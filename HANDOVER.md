# Handover: LinkedIn Impact Scanner & Integration Plan

## Overview
This document outlines the architectural proposal for the **LinkedIn Impact Scanner**, a high-value feature designed to bridge the gap between social profiles and high-impact resumes.

## 1. Feature Concept: "Crystallization Scanner"
The scanner takes raw text inputs (pasted from professional profiles) and performs a "Metric Audit" using Gemini. It provides:
- **Impact Score (0-100):** Based on the presence of hard numbers and action verbs.
- **Copyright-Safe Refinement:** Rewrites descriptions into the "Minimal/ATS" style without mimicking LinkedIn's internal structure.
- **Compliance Guard:** Checks for non-inclusive language or industry jargon.

## 2. Technical Architecture

### A. UI Integration (The "Extra Feature" Tab)
- **Dashboard.jsx:** Add a new menu item `{ id: 'scanner', name: 'Profile Scanner', icon: 'fas fa-shield-alt' }`.
- **ScannerView.jsx (New):** A dedicated component for processing profile text.
- **Integration Flow:** 
  - User pastes text -> Frontend calls `/api/ai/scan` -> Result is displayed in a "Heat Map" of impact.
  - Option to "Push to Resume": Validated achievements can be one-click imported into the user's `Experience` or `Achievements` collections.

### B. Backend Logic
- **Route:** `POST /api/ai/scan`
- **Model:** `gemini-3-flash`
- **Logic:** Extracts entities (metrics, verbs, titles) and compares them against a benchmark of "Top 1% Executives".

## 3. LinkedIn Copyright & Legal Safety
To avoid copyright strikes and comply with LinkedIn's Terms of Service:
- **Zero Scraping Policy:** The application **MUST NOT** programmatically crawl LinkedIn. It relies entirely on user-pasted content.
- **Visual Distinction:** The UI will use the existing "Minimal/ATS" aesthetic. It will NOT use LinkedIn colors (Blue #0077b5), LinkedIn fonts, or their specific "Card" layout.
- **Processing vs reproduction:** We analyze the *content* (user's own data) rather than reproducing the *structure* of the platform.
- **Compliance Warning:** Add a footer: *"This tool is independent and not affiliated with LinkedIn. It processes user-provided data only."*

## 4. Integration into Current Architecture
- **State Management:** Dashboard handles the switch; local state in `ScannerView` handles the parsing.
- **Persistence:** Successful scans can be saved to the database as `OptimizedVersion` metadata.

---
**Status:** ✅ Implemented. Feature ready for final review.
**Integration Note:** The "Impact Scanner" is now accessible via the main dashboard.
**B&W Minimal Template:** Integrated and optimized for ATS.
