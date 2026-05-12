import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Scissors, Shield, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set up PDF.js worker using Vite's URL asset loading
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

/**
 * BlurSnipTool Component
 * Allows users to upload a PDF/Image, preview pages, blur sensitive areas, and export/snip.
 */
function BlurSnipTool({ isOpen, onClose, resumeData = null }) {
  // Canvas and image state
  const canvasRef = useRef(null);
  const [imageObj, setImageObj] = useState(null);
  const [blurOptions, setBlurOptions] = useState({
    name: false, email: false, phone: false, company: false,
    dates: false, location: false, linkedin: false, avatar: false,
  });
  const [manualBlurs, setManualBlurs] = useState([]); // Support for custom-drawn blur regions
  const [exportFormat, setExportFormat] = useState('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [snipMode, setSnipMode] = useState(false);
  const [blurDrawMode, setBlurDrawMode] = useState(false); // New mode for drawing blurs
  const [interactionStart, setInteractionStart] = useState(null);
  const [activeRect, setActiveRect] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  
  // PDF state
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPage, setSelectedPage] = useState(1);
  const pdfCanvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  const [detectedRegions, setDetectedRegions] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setImageObj(null);
      setDetectedRegions([]);
      setIsScanning(false);
      setActiveRect(null);
      setSnipMode(false);
      setBlurDrawMode(false);
      setManualBlurs([]);
      setActiveTab('upload');
      setPdfDoc(null);
      setTotalPages(0);
      setSelectedPage(1);
      setBlurOptions({
        name: false, email: false, phone: false, company: false,
        dates: false, location: false, linkedin: false, avatar: false,
      });
    }
  }, [isOpen]);

  // Re-render PDF page when selectedPage or pdfDoc changes
  useEffect(() => {
    if (activeTab === 'pdf_preview' && pdfDoc) {
      renderPdfPage(pdfDoc, selectedPage);
    }
  }, [selectedPage, pdfDoc, activeTab]);

  if (!isOpen) return null;

  // Load PDF and render preview
  const loadPdfAndRender = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setSelectedPage(1);
      return pdf;
    } catch (error) {
      console.error('Error loading PDF document:', error);
      throw error;
    }
  };

  const renderPdfPage = async (pdf, pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = pdfCanvasRef.current;
      if (!canvas) return;
      
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      
      await renderTask.promise;
      renderTaskRef.current = null;
    } catch (error) {
      if (error.name === 'RenderingCancelledException') return;
      console.error('Error rendering PDF page:', error);
    }
  };

  const changePage = (direction) => {
    const newPage = selectedPage + direction;
    if (newPage < 1 || newPage > totalPages) return;
    setSelectedPage(newPage);
  };

  const convertCurrentPageToImage = async () => {
    if (!pdfDoc) return null;
    
    try {
      const page = await pdfDoc.getPage(selectedPage);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error converting PDF to image:', error);
      return null;
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    // Handle PDF files
    if (file.type === 'application/pdf') {
      setIsProcessing(true);
      try {
        await loadPdfAndRender(file);
        setActiveTab('pdf_preview');
      } catch (error) {
        console.error('PDF loading error:', error);
        alert('Error loading PDF. Please try again.');
      } finally {
        setIsProcessing(false);
      }
      return;
    }
    
    // Handle image files
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        setDetectedRegions([]); // No PDF text to scan for images
        renderCanvas(img, blurOptions, [], null);
        setActiveTab('blur');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  const scanPdfText = async (pdf, pageNum) => {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 2.0 }); // Use same scale as our image conversion
      
      const detections = [];
      const emailRegex = /[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      const urlRegex = /(https?:\/\/[^\s]+)|(linkedin\.com\/in\/[^\s]+)|(github\.com\/[^\s]+)/gi;
      const addrKeywords = /\b(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Square|Sq|Suite|Apt|Unit|Floor|PO Box|Building|Bldg)\b/i;
      const months = /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i;

      // Group items by line (roughly similar Y coordinate)
      const lines = {};
      textContent.items.forEach(item => {
        const y = Math.round(item.transform[5]);
        if (!lines[y]) lines[y] = [];
        lines[y].push(item);
      });

      // Sort lines top to bottom
      const sortedY = Object.keys(lines).sort((a, b) => b - a);

      sortedY.forEach(y => {
        const lineItems = lines[y].sort((a, b) => a.transform[4] - b.transform[4]);
        const fullText = lineItems.map(it => it.str).join(' ');
        
        // Find Email, Phone, or URLs in the full line text
        const matches = [
          { regex: emailRegex, label: 'email' },
          { regex: phoneRegex, label: 'phone' },
          { regex: urlRegex, label: 'link' }
        ];

        matches.forEach(({ regex, label }) => {
          let m;
          while ((m = regex.exec(fullText)) !== null) {
            const matchedText = m[0];
            // Find which items contributed to this match to get a rough bounding box
            const startIndex = fullText.indexOf(matchedText);
            const endIndex = startIndex + matchedText.length;
            
            // Map the matched text back to item boxes
            let currentOffset = 0;
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            
            lineItems.forEach(it => {
              const itText = it.str;
              const itLen = itText.length + 1; // +1 for the space we added
              
              const itemStart = currentOffset;
              const itemEnd = currentOffset + itLen;
              
              if (itemStart < endIndex && itemEnd > startIndex) {
                // This item overlaps with the match
                const [tx, ty] = pdfjsLib.Util.transform(viewport.transform, [it.transform[4], it.transform[5]]);
                minX = Math.min(minX, tx);
                minY = Math.min(minY, ty - it.height);
                maxX = Math.max(maxX, tx + it.width);
                maxY = Math.max(maxY, ty);
              }
              currentOffset = itemEnd;
            });

            if (minX !== Infinity) {
              detections.push({
                x: minX - 5,
                y: minY - 5,
                width: (maxX - minX) + 10,
                height: (maxY - minY) + 10,
                label: label
              });
            }
          }
        });
      });

      // Also keep individual item checks for high-precision matches
      textContent.items.forEach(item => {
        const text = item.str;
        const transform = item.transform;
        
        const [tx, ty] = pdfjsLib.Util.transform(viewport.transform, [transform[4], transform[5]]);
        
        // Check for specific sensitive keywords
        if (addrKeywords.test(text) || months.test(text)) {
           detections.push({
            x: tx - 5,
            y: ty - (item.height * 2.0),
            width: item.width + 10,
            height: item.height * 2.5,
            label: 'misc'
          });
        }
      });
      
      return detections;
    } catch (error) {
      console.error('Error scanning PDF text:', error);
      return [];
    }
  };

  const startBlurFromPdf = async () => {
    setIsProcessing(true);
    setIsScanning(true);
    try {
      const imageDataUrl = await convertCurrentPageToImage();
      if (!imageDataUrl) throw new Error('Failed to capture page');
      
      // Also scan for text location data
      const detections = await scanPdfText(pdfDoc, selectedPage);
      setDetectedRegions(detections);
      
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
        renderCanvas(img, blurOptions, [], null);
        setActiveTab('blur');
        setIsProcessing(false);
        setIsScanning(false);
        if (detections.length > 0) {
          alert(`✨ Auto-detected ${detections.length} potentially sensitive areas to blur!`);
        }
      };
      img.src = imageDataUrl;
    } catch (error) {
      console.error('Error starting blur from PDF:', error);
      setIsProcessing(false);
      setIsScanning(false);
      alert('Could not process this page for blurring.');
    }
  };

  const autoDetectBlur = () => {
    if (!detectedRegions.length) {
      alert("No sensitive text patterns found on this page. Use the 'Draw Blur' tool for manual protection.");
      return;
    }

    // Convert detected regions (image scale) to the current canvas view scale
    const canvas = canvasRef.current;
    const viewScale = canvas.width / imageObj.width;
    
    const newManuals = detectedRegions.map(reg => ({
      x: reg.x * viewScale,
      y: reg.y * viewScale,
      width: reg.width * viewScale,
      height: reg.height * viewScale
    }));

    setManualBlurs([...manualBlurs, ...newManuals]);
    renderCanvas(imageObj, blurOptions, [...manualBlurs, ...newManuals], null);
  };

  const renderCanvas = (img, opts, manuals, activePreview) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;
    
    const scale = Math.min(1, 800 / img.width);
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // 1. Render Presets
    const regions = getRegions(canvas.width, canvas.height);
    Object.entries(opts).forEach(([key, on]) => {
      if (on && regions[key]) blurRegion(ctx, regions[key]);
    });

    // 2. Render Manual Blurs
    manuals.forEach(region => blurRegion(ctx, region));

    // 3. Render Active Drawing Preview (Either Blur or Snip)
    if (activePreview) {
      if (activeTab === 'snip') {
        // Snip UI
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 3]);
        ctx.strokeRect(activePreview.x, activePreview.y, activePreview.w, activePreview.h);
        ctx.setLineDash([]);
        
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, activePreview.y);
        ctx.fillRect(0, activePreview.y + activePreview.h, canvas.width, canvas.height - activePreview.y - activePreview.h);
        ctx.fillRect(0, activePreview.y, activePreview.x, activePreview.h);
        ctx.fillRect(activePreview.x + activePreview.w, activePreview.y, canvas.width - activePreview.x - activePreview.w, activePreview.h);
      } else if (blurDrawMode) {
        // Blur Drawing UI
        blurRegion(ctx, { x: activePreview.x, y: activePreview.y, width: activePreview.w, height: activePreview.h });
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(activePreview.x, activePreview.y, activePreview.w, activePreview.h);
      }
    }
  };

  // Logic to define typical areas of a resume for quick blurring
  const getRegions = (w, h) => ({
    avatar:   { x: w * 0.05, y: h * 0.02, width: w * 0.15, height: h * 0.10 },
    name:     { x: w * 0.22, y: h * 0.02, width: w * 0.40, height: h * 0.06 },
    email:    { x: w * 0.22, y: h * 0.08, width: w * 0.35, height: h * 0.03 },
    phone:    { x: w * 0.22, y: h * 0.11, width: w * 0.30, height: h * 0.03 },
    location: { x: w * 0.22, y: h * 0.14, width: w * 0.30, height: h * 0.03 },
    linkedin: { x: w * 0.65, y: h * 0.08, width: w * 0.30, height: h * 0.04 },
    company:  { x: w * 0.05, y: h * 0.22, width: w * 0.50, height: h * 0.05 },
    dates:    { x: w * 0.65, y: h * 0.22, width: w * 0.30, height: h * 0.05 },
  });

  const blurRegion = (ctx, { x, y, width, height }) => {
    if (width < 2 || height < 2) return;
    
    // Ensure all values are integers for correct buffer indexing
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const iw = Math.floor(width);
    const ih = Math.floor(height);
    
    if (iw < 2 || ih < 2) return;

    const blockSize = 8;
    try {
      const imageData = ctx.getImageData(ix, iy, iw, ih);
      const data = imageData.data;
      
      for (let py = 0; py < ih; py += blockSize) {
        for (let px = 0; px < iw; px += blockSize) {
          const index = (py * iw + px) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];
          
          for (let subY = 0; subY < blockSize && py + subY < ih; subY++) {
            for (let subX = 0; subX < blockSize && px + subX < iw; subX++) {
              const subIndex = ((py + subY) * iw + (px + subX)) * 4;
              data[subIndex] = r;
              data[subIndex + 1] = g;
              data[subIndex + 2] = b;
              data[subIndex + 3] = a;
            }
          }
        }
      }
      
      ctx.putImageData(imageData, ix, iy);
      // Add a semi-transparent overlay for a more professional "redacted" look
      ctx.fillStyle = 'rgba(100, 100, 120, 0.25)';
      ctx.fillRect(ix, iy, iw, ih);
    } catch (e) {
      console.warn('Blur failed for region:', { ix, iy, iw, ih }, e);
    }
  };

  const toggle = (key) => {
    const next = { ...blurOptions, [key]: !blurOptions[key] };
    setBlurOptions(next);
    if (imageObj) renderCanvas(imageObj, next, manualBlurs, activeRect);
  };

  const clearAll = () => {
    setBlurOptions({
      name: false, email: false, phone: false, company: false,
      dates: false, location: false, linkedin: false, avatar: false,
    });
    setManualBlurs([]);
    if (imageObj) renderCanvas(imageObj, {}, [], null);
  };

  const undoManual = () => {
    const nextManuals = manualBlurs.slice(0, -1);
    setManualBlurs(nextManuals);
    if (imageObj) renderCanvas(imageObj, blurOptions, nextManuals, null);
  };

  const handlePointerDown = (e) => {
    if (!snipMode && !blurDrawMode) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setInteractionStart({ x, y });
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !interactionStart) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const newRect = {
      x: Math.min(interactionStart.x, x),
      y: Math.min(interactionStart.y, y),
      w: Math.abs(x - interactionStart.x),
      h: Math.abs(y - interactionStart.y),
    };
    
    setActiveRect(newRect);
    renderCanvas(imageObj, blurOptions, manualBlurs, newRect);
  };

  const handlePointerUp = () => {
    if (isDragging && activeRect && blurDrawMode) {
      // Save manual blur
      const newBlur = { x: activeRect.x, y: activeRect.y, width: activeRect.w, height: activeRect.h };
      const nextManuals = [...manualBlurs, newBlur];
      setManualBlurs(nextManuals);
      renderCanvas(imageObj, blurOptions, nextManuals, null);
    }
    setIsDragging(false);
    if (!snipMode) setActiveRect(null); // Keep snip rect visible, clear blur drawing active rect
  };

  const exportFull = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsProcessing(true);
    setTimeout(() => {
      const mime = exportFormat === 'jpg' ? 'image/jpeg' : 'image/png';
      const fileExtension = exportFormat === 'jpg' ? 'jpg' : 'png';
      const link = document.createElement('a');
      link.download = `protected-resume.${fileExtension}`;
      link.href = canvas.toDataURL(mime, 0.95);
      link.click();
      setIsProcessing(false);
    }, 100);
  };

  const exportSnip = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeRect) return;
    setIsProcessing(true);
    setTimeout(() => {
      const snipCanvas = document.createElement('canvas');
      snipCanvas.width = activeRect.w;
      snipCanvas.height = activeRect.h;
      snipCanvas.getContext('2d').drawImage(
        canvas, 
        activeRect.x, activeRect.y, activeRect.w, activeRect.h, 
        0, 0, activeRect.w, activeRect.h
      );
      const link = document.createElement('a');
      link.download = 'resume-snippet.png';
      link.href = snipCanvas.toDataURL('image/png');
      link.click();
      setIsProcessing(false);
    }, 100);
  };

  const blurItems = [
    { key: 'avatar',   label: '🖼️ Avatar / Photo' },
    { key: 'name',     label: '👤 Full Name' },
    { key: 'email',    label: '📧 Email' },
    { key: 'phone',    label: '📞 Phone' },
    { key: 'location', label: '📍 Location' },
    { key: 'linkedin', label: '🔗 LinkedIn' },
    { key: 'company',  label: '🏢 Current Company' },
    { key: 'dates',    label: '📅 Dates & Years' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-slate-700 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-700 flex-shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Blur & Snip</h2>
              <p className="text-slate-400 text-xs font-medium">Protect privacy before sharing</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white hover:bg-slate-800 transition p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-900/30 px-2 border-b border-slate-700 flex-shrink-0">
          {[
            { id: 'upload', label: '1. Upload' },
            { id: 'pdf_preview', label: '2. Pages', disabled: !pdfDoc },
            { id: 'blur', label: '3. Privacy', disabled: !imageObj },
            { id: 'snip', label: '4. Extract', disabled: !imageObj },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === tab.id
                  ? 'text-pink-400'
                  : 'text-slate-500 hover:text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Main Workspace Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 md:p-8">

            {/* UPLOAD VIEW */}
            {activeTab === 'upload' && (
              <div className="max-w-xl mx-auto py-12">
                <div
                  className="border-2 border-dashed border-slate-700 rounded-3xl p-16 text-center hover:border-pink-500 hover:bg-slate-800/50 transition-all cursor-pointer group"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files[0]); }}
                  onClick={() => document.getElementById('bstInput').click()}
                >
                  <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                    <Shield size={32} className="text-pink-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload your document</h3>
                  <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
                    We support PDF, PNG and JPG files. Total privacy: files stay in your browser.
                  </p>
                  <span className="px-8 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-600/20 transition-all active:scale-95">
                    Select File
                  </span>
                  <input
                    id="bstInput"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    onChange={e => handleFileUpload(e.target.files[0])}
                  />
                </div>
              </div>
            )}

            {/* PDF PAGE NAVIGATION VIEW */}
            {activeTab === 'pdf_preview' && pdfDoc && (
              <div className="flex flex-col items-center h-full gap-8">
                <div className="flex items-center gap-6 bg-slate-800/50 p-2 rounded-2xl border border-slate-700 w-full max-w-sm justify-between shadow-lg">
                  <button
                    onClick={() => changePage(-1)}
                    disabled={selectedPage <= 1}
                    className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold text-base">Page {selectedPage}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">of {totalPages} pages</span>
                  </div>
                  <button
                    onClick={() => changePage(1)}
                    disabled={selectedPage >= totalPages}
                    className="p-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all active:scale-90"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="flex-1 w-full flex justify-center overflow-hidden min-h-0">
                  <div className="bg-white rounded-lg shadow-2xl p-1 overflow-auto max-w-full">
                    <canvas ref={pdfCanvasRef} className="max-w-none h-auto block" />
                  </div>
                </div>

                <button
                  onClick={startBlurFromPdf}
                  disabled={isProcessing}
                  className="px-10 py-4 mb-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-pink-600/20 transition-all active:scale-95"
                >
                  <Shield size={20} />
                  {isProcessing ? 'Processing...' : 'Prepare this page for Privacy Tools'}
                </button>
              </div>
            )}

            {/* BLUR TOOL WORKSPACE */}
            {activeTab === 'blur' && imageObj && (
              <div className="flex flex-col lg:flex-row gap-8 h-full">
                <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-auto flex items-center justify-center p-4 relative">
                  <div className="inline-block shadow-2xl relative">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handlePointerDown}
                      onMouseMove={handlePointerMove}
                      onMouseUp={handlePointerUp}
                      style={{ cursor: blurDrawMode ? 'crosshair' : 'default' }}
                      className="block max-w-full h-auto transition-opacity"
                    />
                    {isScanning && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                        <div className="absolute inset-x-0 h-1 bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.8)] animate-scan" />
                        <div className="absolute inset-0 bg-pink-500/10 backdrop-blur-[2px]" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-slate-900/80 px-4 py-2 rounded-full border border-pink-500/50 text-white text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                             <div className="w-2 h-2 bg-pink-500 rounded-full animate-ping" />
                             Scanning document...
                          </div>
                        </div>
                      </div>
                    )}
                    {blurDrawMode && !isDragging && !isScanning && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="bg-pink-600/20 text-pink-400 px-4 py-2 rounded-full border border-pink-500/50 backdrop-blur-md text-sm font-bold animate-pulse">
                          Draw a box to blur
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 shadow-xl space-y-4">
                    <div>
                      <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                        <Scissors size={14} className="text-pink-400" />
                        Manual Tools
                      </h4>
                      <div className="flex gap-2">
                        <button
                          onClick={autoDetectBlur}
                          disabled={!detectedRegions.length}
                          className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold text-[11px] flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all active:scale-95 disabled:opacity-20"
                        >
                          ✨ Auto-Detect
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setBlurDrawMode(!blurDrawMode);
                            setSnipMode(false);
                            renderCanvas(imageObj, blurOptions, manualBlurs, null);
                          }}
                          className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                            blurDrawMode 
                              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' 
                              : 'bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          <Shield size={14} />
                          {blurDrawMode ? 'Exit Drawing' : 'Draw Blur'}
                        </button>
                        <button
                          onClick={undoManual}
                          disabled={manualBlurs.length === 0}
                          className="px-4 py-3 bg-slate-900 border border-slate-700 text-slate-400 hover:text-white rounded-xl disabled:opacity-20 transition-all active:scale-95"
                          title="Undo last blur"
                        >
                          <ChevronLeft size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-white font-bold text-sm flex items-center gap-2">
                          <EyeOff size={14} className="text-pink-400" />
                          Presets
                        </h4>
                        <button onClick={clearAll} className="text-[10px] uppercase font-bold text-slate-400 hover:text-white transition-colors">Clear All</button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {blurItems.map(({ key, label }) => (
                          <button 
                            key={key}
                            onClick={() => toggle(key)}
                            className={`py-2 px-3 rounded-lg text-[11px] font-semibold text-left transition-all flex items-center gap-2 border ${
                              blurOptions[key] 
                                ? 'bg-pink-500/20 border-pink-500 text-pink-400' 
                                : 'bg-slate-900 border-slate-700 text-slate-400 opacity-60 hover:opacity-100'
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full ${blurOptions[key] ? 'bg-pink-400 animate-pulse' : 'bg-slate-600'}`} />
                            {label.split(' ')[1]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 shadow-xl">
                    <h4 className="text-white font-bold text-sm mb-4">Export File</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {['png', 'jpg'].map(fmt => (
                          <button 
                            key={fmt}
                            onClick={() => setExportFormat(fmt)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all uppercase ${
                              exportFormat === fmt ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20' : 'bg-slate-900 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {fmt}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={exportFull}
                        disabled={isProcessing}
                        className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Download size={18} />
                        {isProcessing ? 'Working...' : 'Download'}
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setActiveTab('snip');
                      setSnipMode(true);
                      setBlurDrawMode(false);
                      renderCanvas(imageObj, blurOptions, manualBlurs, null);
                    }}
                    className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 transition-all"
                  >
                    <Scissors size={18} />
                    Extract Snippet
                  </button>
                </div>
              </div>
            )}

            {/* SNIP TOOL WORKSPACE */}
            {activeTab === 'snip' && imageObj && (
              <div className="flex flex-col lg:flex-row gap-8 h-full">
                <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 overflow-auto flex items-center justify-center p-4">
                  <div className="relative inline-block shadow-2xl">
                    <canvas
                      ref={canvasRef}
                      onMouseDown={handlePointerDown}
                      onMouseMove={handlePointerMove}
                      onMouseUp={handlePointerUp}
                      style={{ cursor: 'crosshair' }}
                      className="block max-w-full h-auto"
                    />
                  </div>
                </div>

                <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
                  <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                        <Scissors size={16} className="text-white" />
                      </div>
                      <h4 className="text-white font-bold text-sm">Snip & Export</h4>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6">
                      Extract specific sections of your resume (like a specific project or achievement) as a standalone image.
                    </p>
                    
                    <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-center">
                      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Selected Size</p>
                      <p className="text-white font-mono text-lg font-bold">
                        {activeRect ? `${Math.round(activeRect.w)} × ${Math.round(activeRect.h)}` : '0 × 0'}
                      </p>
                    </div>
                  </div>

                  {activeRect && activeRect.w > 5 && activeRect.h > 5 && (
                    <div className="bg-slate-800 rounded-2xl p-5 border-2 border-emerald-500/30 shadow-xl animate-in zoom-in duration-300">
                      <button
                        onClick={exportSnip}
                        disabled={isProcessing}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                      >
                        <Download size={18} />
                        Download Snip
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                        setActiveTab('blur');
                        setSnipMode(false);
                        setBlurDrawMode(false);
                        setActiveRect(null);
                        renderCanvas(imageObj, blurOptions, manualBlurs, null);
                    }}
                    className="w-full py-3 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-all"
                  >
                    ← Back to Privacy Tools
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default BlurSnipTool;
