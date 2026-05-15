import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';
import Dashboard from './Dashboard';
import PublicView from './PublicView';
import PrintableResume from './PrintableResume';
import ResetPassword from './ResetPassword';
import ATSScore from './ATSScore';
import AIAssistant from './pages/AIAssistant';
import OptimizedPublicView from './OptimizedPublicView';
import PrintableTemplate from './PrintableTemplate';

function LoginPage({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin ? { username, password } : { username, email, password };
      const res = await api.post(endpoint, payload);
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    try {
      const res = await api.post('/auth/forgot-password', { email: resetEmail });
      setResetMessage('Password reset link sent to your email!');
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetMessage('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Email not found');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
          <p className="text-gray-500 mb-6">Enter your email to receive a reset link</p>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
          {resetMessage && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">{resetMessage}</div>}
          <form onSubmit={handleForgotPassword}>
            <input type="email" placeholder="Email address" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">Send Reset Link</button>
          </form>
          <button onClick={() => setShowForgotPassword(false)} className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm">← Back to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3 group cursor-pointer hover:rotate-0 transition-all duration-300">
              <i className="fas fa-file-alt text-white text-xl"></i>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl text-gray-900 tracking-tighter leading-none font-display">
                Resume<span className="text-blue-600">App</span>
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1 font-display">
                Engineering <span className="text-purple-500">•</span> UAE & GCC
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setIsLogin(true); setShowAuthModal(true); }}
              className="px-5 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              Log in
            </button>
            <button
              onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Sign up free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative min-h-[calc(100vh-73px)] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Heroes */}
        <div className="absolute inset-0 flex">
          <div className="relative flex-1">
            <img 
              src="https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Creative" 
            />
            <div className="absolute inset-0 bg-white/70 flex items-end justify-center pb-12">
              <span className="text-xl font-medium text-gray-400">Be Creative</span>
            </div>
          </div>
          <div className="relative flex-1 border-x border-white/20">
            <img 
              src="https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=800&q=80" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Unique" 
            />
            <div className="absolute inset-0 bg-white/70 flex items-end justify-center pb-12">
              <span className="text-xl font-medium text-gray-400">Be Unique</span>
            </div>
          </div>
          <div className="relative flex-1">
            <img 
              src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80" 
              className="absolute inset-0 w-full h-full object-cover" 
              alt="Inspired" 
            />
            <div className="absolute inset-0 bg-white/70 flex items-end justify-center pb-12">
              <span className="text-xl font-medium text-gray-400">Be Inspired</span>
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center -mt-24">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-5 py-2 rounded-full mb-8 shadow-sm border border-gray-100">
            <span className="text-blue-600 text-sm font-bold tracking-wide uppercase">📍 UAE and Middle East</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9] font-display">
            Build a resume that <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent italic">tells your story</span>
          </h1>
          <p className="mt-8 text-xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
            Precision-engineered resumes designed for elite career opportunities across the UAE, Saudi Arabia, and the entire GCC professional landscape.
          </p>
          
          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => { setIsLogin(false); setShowAuthModal(true); }}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Building Free
            </button>
            <button
              onClick={() => setShowDemo(true)}
              className="px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-bold rounded-lg border border-gray-200 hover:bg-white transition shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              <i className="fas fa-play text-blue-600"></i> View Demo
            </button>
          </div>
        </div>
      </main>

      {/* Demo Video Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowDemo(false)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">ResumeApp - Engineering Resumes Demo</h3>
              <button onClick={() => setShowDemo(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            <iframe
              src="https://player.cloudinary.com/embed/?cloud_name=dir1ub2qu&public_id=Video_preview_of_my_resume_app_hfbqwj"
              width="640"
              height="360"
              style={{ height: 'auto', width: '100%', aspectRatio: '640 / 360' }}
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              allowFullScreen
              frameBorder="0"
              title="ResumeApp Demo"
            ></iframe>
            <p className="text-center text-gray-500 text-sm mt-3">Watch how ResumeApp helps you build professional resumes</p>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAuthModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <p className="text-gray-500 mb-6">{isLogin ? 'Sign in to your account' : 'Start building your resume'}</p>

            {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
              {!isLogin && <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />}
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" required />
              
              {isLogin && (
                <div className="text-right">
                  <button type="button" onClick={() => { setShowAuthModal(false); setShowForgotPassword(true); }} className="text-sm text-blue-600 hover:text-blue-700">Forgot Password?</button>
                </div>
              )}

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition">{isLogin ? 'Sign In' : 'Create Account'}</button>
            </form>

            <div className="mt-6 text-center">
              <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:text-blue-700 text-sm">
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (token) fetchUser();
    else setAuthChecked(true);
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      logout();
      return;
    } finally {
      setAuthChecked(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const Home = () => {
    if (!authChecked) return null;
    if (!user) return <LoginPage onLogin={setUser} />;
    return <Dashboard user={user} onLogout={logout} />;
  };

  const ProtectedAIAssistant = () => {
    if (!authChecked) return null;
    if (!user) return <Navigate to="/" replace />;
    return <AIAssistant />;
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/view/:username" element={<PublicView />} />
        <Route path="/resume/:username" element={<PrintableResume />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/ats-resume/:username" element={<ATSScore />} />
        <Route path="/ai-assistant" element={<ProtectedAIAssistant />} />
        <Route path="/public/:username/optimized/:templateName" element={<OptimizedPublicView />} />
        <Route path="/printable/:username/:templateName" element={<PrintableTemplate />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
