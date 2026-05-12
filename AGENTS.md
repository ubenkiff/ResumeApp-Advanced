# AI Autonomy Zones & Guardrails

## FULL AUTONOMY (No approval needed)
- Create NEW files in any folder
- Write utility functions (`src/utils/*`)
- Write API endpoints (`backend/routes/*`)
- Write SELECT queries (read-only)
- Write test files
- Write documentation

## REQUIRES APPROVAL (Show template first)
- Modifying ANY existing UI component
- Changing ANY CSS/Tailwind class
- DELETING any file
- ALTER TABLE (schema changes)
- UPDATE, DELETE, or INSERT queries
- Adding new npm packages

### Approval Template to use:
## CHANGE REQUEST
**File:** `path/to/file`
**Lines:** `start-end`

**Current code:**
```
...
```
**Proposed code:**
```
...
```
**Reason:** `Reason for change`

**Waiting for approval...**

## FORBIDDEN (Never do)
- Changing existing layout structure
- Removing existing features
- Changing colors, fonts, margins, padding
- Modifying authentication logic
