# Logo JPG Switch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the shared site logo references from the removed PNG asset to the new JPG asset so the header and footer render correctly again.

**Architecture:** The site uses a single imported logo asset in the shared header and footer layout components. We will keep the existing layout and sizing behavior, changing only the asset import path from `matrix-logo.png` to `matrix-logo.jpg` and then verifying no stale PNG references remain in app source files.

**Tech Stack:** React, TypeScript, TanStack Router, Vite asset imports, ripgrep verification

---

### Task 1: Update Shared Layout Logo Imports

**Files:**
- Create: `docs/superpowers/plans/2026-06-23-logo-jpg-switch.md`
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Confirm current logo references**

Run: `rg -n "matrix-logo\.png|matrix-logo\.jpg" src public .`
Expected: `Header.tsx` and `Footer.tsx` still point at `@/assets/matrix-logo.png`, while `src/assets/matrix-logo.jpg` exists as the replacement file.

- [ ] **Step 2: Update the header logo import**

Change this import in `src/components/layout/Header.tsx`:

```ts
import matrixLogo from "@/assets/matrix-logo.jpg";
```

- [ ] **Step 3: Update the footer logo import**

Change this import in `src/components/layout/Footer.tsx`:

```ts
import matrixLogo from "@/assets/matrix-logo.jpg";
```

- [ ] **Step 4: Verify stale PNG references are gone**

Run: `rg -n "matrix-logo\.png" src public .`
Expected: no matches in application source files.

- [ ] **Step 5: Verify the new JPG references are present**

Run: `rg -n "matrix-logo\.jpg" src/components/layout`
Expected: one match in `Header.tsx` and one match in `Footer.tsx`.
