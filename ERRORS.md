# Current Errors Report

Last updated: 2026-03-05

## 1) Render Blueprint Validation Errors
**File:** `myapp/server/render.yaml`

### Error A
- **Line:** 2
- **Message:** `Missing property "runtime".`
- **Impact:** Render blueprint/declarative deployment may fail validation if this file is used.
- **Suggested fix:** Add the required `runtime` field and align schema with current Render blueprint spec.

### Error B
- **Line:** 4
- **Message:** `Property env is not allowed.`
- **Impact:** Same as above; invalid config key for the detected schema.
- **Suggested fix:** Replace invalid `env` usage with the schema-supported key/value structure for runtime/environment.

---

## 2) GitHub Workflow Secret Context Warnings
These appear as static/validation warnings in editor diagnostics.

### Warning A
- **File:** `.github/workflows/backend.yml`
- **Line:** 59
- **Message:** `Context access might be invalid: RENDER_SERVICE_ID`
- **Impact:** Deployment step may fail if secret is missing or misnamed in repository settings.
- **Action:** Verify secret exists in GitHub repo secrets with exact name `RENDER_SERVICE_ID`.

### Warning B
- **File:** `.github/workflows/backend.yml`
- **Line:** 59
- **Message:** `Context access might be invalid: RENDER_API_KEY`
- **Impact:** Deployment step may fail if secret is missing or misnamed.
- **Action:** Verify secret exists with exact name `RENDER_API_KEY`.

### Warning C
- **File:** `.github/workflows/frontend.yml`
- **Line:** 54
- **Message:** `Context access might be invalid: NETLIFY_HOOK_ID`
- **Impact:** Netlify deploy hook step may fail if secret is missing.
- **Action:** Verify secret exists with exact name `NETLIFY_HOOK_ID`.

---

## 3) Observed Runtime/Build Notes
- Frontend production build currently succeeds (`npm run build`).
- Existing Vite warning about chunk size (`>500kB`) is not a build blocker.

---

## Priority Order
1. Fix `render.yaml` schema issues (if Render blueprint file is used).
2. Confirm all CI/CD secrets are present and correctly named.
3. Optional: reduce frontend chunk size using code-splitting.
