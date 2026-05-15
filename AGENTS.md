# AI Autonomy Zones & Guardrails

## CURRENT STACK (DO NOT CHANGE)
- **Backend:** Python FastAPI (Running on Port 8000)
- **Frontend:** React 19 + Tailwind CSS 4 (Running on Port 3000)
- **Target Market:** UAE, GCC, Saudi Arabia (Engineering Professionals)

## FULL AUTONOMY (No approval needed)
- Create NEW FastAPI endpoints in `app/api/*.py`
- Add new Pydantic schemas in `app/models/schemas.py`
- Write utility functions in `app/services/*`
- Write test files
- Write documentation

## REQUIRES APPROVAL (Show template first)
- Modifying ANY existing UI component in `src/`
- Changing the FastAPI `main.py` routing structure
- DELETING any app file
- Adding new npm or pip packages

### Approval Template to use:
## CHANGE REQUEST
**File:** `path/to/file`
**Reason:** `Reason for change to architecture`

**Waiting for approval...**

## LOCAL DEPLOYMENT WORKFLOW
When deploying to localhost or helping a user in a local environment:
1. **Backend:** Always check if a Python virtual environment exists. If not, create it and run `pip install -r requirements.txt`.
2. **Execution:** Use `uvicorn app.main:app --reload --port 8000` for the backend.
3. **Frontend:** Use `npm install` and `npm run dev` (Port 3000).
4. **Environment:** Explicitly request the user to populate the `.env` from `.env.example` before troubleshooting AI features.

## FORBIDDEN (Never do)
- Reverting to Node.js backend for AI logic.
- Changing fonts, colors, or the "UAE/GCC" branding.
- Removing engineering-specific metrics from the AI prompts.


