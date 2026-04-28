# Pending Work Checklist

Last updated: 2026-03-05

## ✅ Completed

### 1) Orders Navigation Gap
- **Status:** ✅ COMPLETED
- **Implementation:** Created Orders.jsx and OrderDetail.jsx pages
- **Routes:** Registered `/orders` and `/orders/:orderId` in App.jsx
- **Features:** Order history list, order detail view with status tracking
- **Commits:** 30b231c (route registration), d5491a5 (OrderDetail page)

---

## High Priority

### 2) Render Blueprint File Validation
- **Current state:** `myapp/server/render.yaml` has schema diagnostics.
- **Impact:** Risk of deployment config failure if blueprint-based deploy is used.
- **Required work:** Update file to current Render blueprint schema (runtime + valid environment fields).

### 3) CI/CD Secret Verification
- **Current state:** Workflow diagnostics warn that secrets may be invalid/missing.
- **Required work:** Confirm repository secrets exist and are populated:
  - `RENDER_SERVICE_ID`
  - `RENDER_API_KEY`
  - `NETLIFY_HOOK_ID`

---

## Medium Priority

### 4) Bundle Size Optimization
- **Current state:** Vite warns JS bundle exceeds 500kB after minification.
- **Required work:**
  - Add route-level lazy loading (`React.lazy` + `Suspense`)
  - Split large modules/manual chunks in Vite config as needed

### 5) End-to-End Auth & RFQ Verification on Production
- **Required work:**
  - Validate register/login/logout flow
  - Validate RFQ submission flow from `/rfq`
  - Confirm environment variable `VITE_API_URL` points to Render backend

---

## Low Priority

### 6) Documentation Sync
- **Required work:**
  - Add links in main README to latest React pages (`/cart`, `/rfq`)
  - Update deployment notes after `render.yaml` schema fix

---

## Suggested Execution Sequence
1. Implement Orders page + route.
2. Fix `render.yaml` schema.
3. Verify GitHub secrets.
4. Re-run CI workflows.
5. Perform production smoke tests.
6. Optional performance optimization.
