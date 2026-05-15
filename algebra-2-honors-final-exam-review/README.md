# Algebra 2 Honors Final Exam Review

Standalone GitHub Pages classroom app for the Algebra 2 Honors End of Year Assessment Review.

## Purpose

This app presents all 37 final review problems in one long scrolling worksheet:

- Part 1: Solve Equations, problems 1–13
- Part 2: Evaluate, problems 14–25
- Part 3: Graph Parent Functions and Related Functions, problems 26–37

## Features

- Student name and class period fields at the top of the page.
- Data-driven problem rendering from `problems.js`.
- Unlimited tries with clear feedback, attempt counts, hint tracking, skip status, and saved progress.
- Always-visible “Start by” tips and optional hints.
- Structured graph-feature controls so students do not need to type vague graph descriptions or draw inside the app.
- Summary section with completion counts, skipped problems, multiple-attempt problems, hint-used problems, and weak skill tags.
- Print / Save PDF Summary button that prints only the summary using print CSS.
- Desmos modal support for graphing problems.

## Local storage

Progress is saved in the same browser and device with the key:

```text
algebra2HonorsFinalReviewProgressV1
```

Saved data includes student name, class period, responses, statuses, attempts, hint usage, skip flags, and reveal flags. This storage is not shared across devices or browsers.

## Desmos API key

`index.html` includes the Desmos API script with a placeholder:

```html
https://www.desmos.com/api/v1.12/calculator.js?apiKey=[YOUR_API_KEY_HERE]
```

To enable the embedded calculator, replace `[YOUR_API_KEY_HERE]` with a valid Desmos API key. If no valid key is present or the API does not load, the modal shows a safe fallback button that opens `https://www.desmos.com/calculator` in a new tab.

## Updating the hub later

After this standalone app is tested and working on GitHub Pages, add a small hub link from the main classroom apps index using the link text:

```text
Algebra 2 Honors Final Exam Review
```
