# Algebra 2 Honors Unit 12 Review

This folder contains the Stage 1 interactive assignment shell for **Algebra 2 Honors Unit 12 Review**.

## Source material

The problem list and key notes were included directly in the Codex prompt. The app does **not** require the unavailable original PDFs to load or run.

Intended source: Algebra 2 Honors Unit 12 Review.

## File structure

- `index.html` — small structural HTML shell.
- `styles.css` — classroom-style visual design and responsive layout.
- `script.js` — app navigation, attempts, hints, status tracking, and summary shell.
- `problems.js` — problem content and answer metadata.
- `solutions.js` — worked-solution entries keyed by `solutionId`.
- `graph-data.js` — graph-feature metadata for parent and transformed graph problems.
- `README.md` — implementation notes and TODO list.

## Stage 1 status

Stage 1 builds the study-map architecture. Students can enter name/period, open any topic from the dashboard, page through up to four problems at a time, check answers with placeholder-safe validators, request hints, reveal worked solutions, retry for practice, start over, and view a final summary shell.

Graphing problems use feature-based answer inputs instead of freehand graph drawing.

## Stage 2 TODO list

1. Complete exact answer validators.
2. Complete all worked solutions from the key notes.
3. Complete graph feature checks.
4. Add summary recommendations by weakest skill.
5. Add printable/PDF export.
6. Then link from the root hub when approved.
