---
target: src/routes/admin.index.tsx
total_score: 25
p0_count: 0
p1_count: 1
timestamp: 2026-06-10T09-47-31Z
slug: src-routes-admin-index-tsx
---

#### Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                         |
| --------- | ------------------------------- | --------- | ----------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | Real-time preview works well, save state is clear.                |
| 2         | Match System / Real World       | 3         | Standard terminology used (SEO, Slug).                            |
| 3         | User Control and Freedom        | 2         | No obvious way to discard draft changes without refreshing.       |
| 4         | Consistency and Standards       | 3         | Uses standard shadcn/ui components consistently.                  |
| 5         | Error Prevention                | 2         | Character count exists, but no hard validation before save.       |
| 6         | Recognition Rather Than Recall  | 3         | Inline placeholders provide good context.                         |
| 7         | Flexibility and Efficiency      | 2         | Missing keyboard shortcuts (e.g., Cmd+S to save).                 |
| 8         | Aesthetic and Minimalist Design | 3         | Clean layout, SEO fields are sensibly hidden behind an accordion. |
| 9         | Error Recovery                  | 2         | "Save failed" is generic and doesn't explain why.                 |
| 10        | Help and Documentation          | 2         | Inline placeholders act as help, but no dedicated guidance.       |
| **Total** |                                 | **25/40** | **[Acceptable]**                                                  |

#### Anti-Patterns Verdict

**LLM assessment**: The interface avoids major AI slop tells. It uses a standard sidebar-plus-content layout suitable for admin panels. The recent addition of the SEO accordion helps prevent cognitive overload (The Wall of Options). However, it relies entirely on generic components and lacks specific "power user" affordances typical of high-end product UI.

**Deterministic scan**: The CLI detector found 0 issues. No architectural or cross-register bans were violated.

**Visual overlays**: Skipped. The admin panel requires authentication, making automated browser overlay injection unreliable.

#### Overall Impression

A solid, functional admin interface that gets the job done. The real-time preview (especially the Google and Social cards) is excellent for content creators. The biggest opportunity is improving the "power user" feel by adding keyboard shortcuts, better empty states, and more robust error handling.

#### What's Working

- **Real-time Previews**: The Google Search and Social Media previews give immediate, high-value feedback.
- **Progressive Disclosure**: Hiding the SEO settings behind an accordion keeps the primary form clean.
- **Character Counts**: The visual indicator (green/red bar) for SEO titles and descriptions is a great touch.

#### Priority Issues

- **[P1] Form State & Keyboard Shortcuts**: No way to save via keyboard (Cmd/Ctrl+S) or discard changes without a page refresh.
  - **Why it matters**: Admin users are often doing repetitive data entry. Forcing mouse clicks slows them down (affects Impatient Power User).
  - **Fix**: Add global keyboard event listener for Cmd+S to trigger save. Add a "Discard Changes" button if `draft` is dirty.
  - **Suggested command**: `$impeccable harden`

- **[P2] Generic Error Handling**: The save error is just "Save failed" in red text.
  - **Why it matters**: If a save fails due to network or validation, the user doesn't know how to fix it (affects Confused First-Timer).
  - **Fix**: Surface the actual error message returned from Supabase, or use a toast notification system for better visibility.
  - **Suggested command**: `$impeccable clarify`

- **[P3] Weak Empty States**: The image preview fallback is just text "No preview image".
  - **Why it matters**: It feels unfinished and doesn't guide the user.
  - **Fix**: Add a skeleton placeholder or a subtle icon illustration for the empty image state.
  - **Suggested command**: `$impeccable onboard`

#### Persona Red Flags

**Alex (Power User)**:

- No keyboard shortcut (Cmd+S) to save.
- Has to manually click the "SEO Settings" accordion every time if they always fill it out.

**Jordan (First-Timer)**:

- If a save fails, "Save failed" gives no clue what to fix.

#### Minor Observations

- The Save button jumps to a spinner state but keeps its full width, which is good.
- The `ToggleField` is custom and looks good, but ensure it's fully accessible via keyboard (tab navigation).

#### Questions to Consider

- Does the Admin need to manage multiple items quickly? If so, would a split-pane "list on left, edit on right" be better?
- Should the SEO accordion remember its open/closed state via localStorage?
