# Teacher Calendar Planner

Private, no-API browser app for fitting a pacing calendar onto an uploaded Excel curriculum map.

## What this app is

1. A private no-API browser app (plain HTML/CSS/JS + SheetJS).
2. It edits uploaded Excel files locally in your browser.
3. It never overwrites your original workbook; export creates a new file.
4. Teachers can use ChatGPT separately to generate/refine the Planning Template, then paste it here.
5. `BLOCKED_DAYS` are skipped (not counted as instructional days).
6. `EVENT_NOTES` are warnings only (not skipped automatically).
7. Units are scheduled by instructional-day count, not by old date-range matching.
8. Built for static hosting (including GitHub Pages).
9. Since real spreadsheets may differ, diagnostics are included so teachers can verify detected sheets/date cells after upload.

## Files

- `index.html` - UI sections and controls
- `styles.css` - simple styling
- `app.js` - parser, diagnostics, scheduling, apply/export logic

## Privacy and cost

- No backend
- No database
- No login
- No OpenAI/Google/Microsoft API usage
- No paid API dependencies
- Workbook processing remains local in-browser

## Usage

1. Open `teacher-calendar-planner/index.html` in a browser (or deploy folder to GitHub Pages).
2. Upload the calendar workbook.
3. Review workbook diagnostics.
4. Paste or load planning template.
5. Validate template.
6. Generate preview.
7. Apply changes.
8. Download edited workbook.
