# Algebra 2 Honors Unit 12 Review

This folder contains the Stage 2 interactive assignment for **Algebra 2 Honors Unit 12 Review**.

## Source material

The problem list and key notes were included directly in the Codex prompt. The app does **not** require the unavailable original PDFs to load or run.

Intended source: Algebra 2 Honors Unit 12 Review.

## File structure

- `index.html` — small structural HTML shell.
- `styles.css` — classroom-style visual design and responsive layout.
- `script.js` — app navigation, practical validators, graph checks, attempts, hints, status tracking, and diagnostic summary.
- `problems.js` — problem content and answer metadata.
- `solutions.js` — worked-solution entries keyed by `solutionId`.
- `graph-data.js` — graph-feature metadata for parent and transformed graph problems.
- `README.md` — implementation notes and TODO list.

## Stage 2 status

Stage 2 upgrades the study-map shell into a working review experience. Students can enter name/period, open any topic from the dashboard, page through up to four problems at a time, check answers with practical validators, request hints, reveal worked solutions, retry for practice, start over, and view a final summary.

Completed Stage 2 behavior:

- Practical answer validation for numeric, expression, graph-feature, and system-solution problems.
- Graphing problems use feature-based checks with dropdowns for domain/range and short inputs for asymptotes, key points, shifts, reflections, openings, and intercept notes.
- Incorrect feedback points students toward the missed skill without referencing an answer key.
- The final summary diagnoses weak skill tags, names the top weak areas, and recommends exact problem IDs to retry.
- Worked solutions render the short answer, ordered steps, and common mistake in a Chromebook-friendly format.


## Theme controls

The app now starts in **Dark Mode** by default, using charcoal/slate backgrounds with soft high-contrast text for classroom-friendly viewing. Students can switch to **Light Mode** to restore the original bright look as closely as possible.

A student-facing **Don’t Click This** joke mode applies a curated ridiculous palette and shows a **Reroll Chaos** button for swapping to another silly-but-usable palette. Chaos mode now includes additional curated palettes, all using fixed safe colors only; it does not use flashing, strobe effects, rapid animation, moving text, tiny text, or physically uncomfortable patterns.

The selected theme, including the current chaos palette when applicable, is saved with `localStorage` so the choice persists after reload.

## Stage 3 TODO list

1. Add printable/PDF export.
2. Add optional graph thumbnails or generated solution graphs.
3. Apply final visual polish after classroom testing.
4. Add or verify the root hub link if not already handled separately.
