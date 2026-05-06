// PLC defaults and workbook structure constants (configurable)
const PLC_GRADING_PERIOD_CONFIG = [
  { name: '1st Nine Weeks', start: '2026-08-12', end: '2026-10-08' },
  { name: '2nd Nine Weeks', start: '2026-10-13', end: '2026-12-18' },
  { name: '3rd Nine Weeks', start: '2027-01-06', end: '2027-03-05' },
  { name: '4th Nine Weeks', start: '2027-03-15', end: '2027-05-20' }
];
const EXPECTED_SHEET_NAMES = ['1st 9 Weeks', '2nd 9 Weeks', '3rd 9 Weeks', '4th 9 Weeks'];
const GRADING_PERIOD_LABELS = ['1st', '2nd', '3rd', '4th'];
const DATE_COLUMNS = ['A', 'C', 'E', 'G', 'I'];
const NOTE_COLUMNS = ['B', 'D', 'F', 'H', 'J'];

const DEFAULT_BLOCKED_DAYS = [
  { name: 'Labor Day', start: '2026-09-07', end: '2026-09-07' },
  { name: 'Flex Day PD / Student Holiday', start: '2026-10-09', end: '2026-10-09' },
  { name: 'Professional Development / Student Holiday', start: '2026-10-12', end: '2026-10-12' },
  { name: 'Fall Break', start: '2026-11-23', end: '2026-11-27' },
  { name: 'Winter Break', start: '2026-12-21', end: '2027-01-03' },
  { name: 'Teacher Workday / Student Holiday', start: '2027-01-04', end: '2027-01-04' },
  { name: 'Professional Development / Student Holiday', start: '2027-01-05', end: '2027-01-05' },
  { name: 'Student / Staff Holiday', start: '2027-01-18', end: '2027-01-18' },
  { name: 'Professional Development / Student Holiday', start: '2027-02-12', end: '2027-02-12' },
  { name: 'Flex Day PD / Student Holiday', start: '2027-02-15', end: '2027-02-15' },
  { name: 'Spring Break', start: '2027-03-08', end: '2027-03-12' },
  { name: 'Holiday', start: '2027-03-26', end: '2027-03-26' },
  { name: 'Professional Development / Student Holiday', start: '2027-04-30', end: '2027-04-30' },
  { name: 'Final Exams', start: '2027-05-17', end: '2027-05-20' },
  { name: 'Professional Development / Student Holiday', start: '2027-05-21', end: '2027-05-21' }
];
const DEFAULT_EVENT_NOTES = [
  { name: 'Growth Pre-Test', start: '2026-08-24', end: '2026-08-27' },
  { name: 'Growth Pre-Test Choir/Band', start: '2026-09-02', end: '2026-09-04' },
  { name: 'TSIA2 English', start: '2026-09-28', end: '2026-09-28' },
  { name: 'TSIA2 Math', start: '2026-10-06', end: '2026-10-06' },
  { name: 'PSAT', start: '2026-10-22', end: '2026-10-22' },
  { name: 'CBE', start: '2026-10-27', end: '2026-10-30' },
  { name: 'Eng I & II Interim', start: '2026-11-03', end: '2026-11-03' },
  { name: 'Alg I Interim', start: '2026-11-19', end: '2026-11-19' },
  { name: 'EOC Retakes', start: '2026-12-01', end: '2026-12-10' },
  { name: 'Midterms', start: '2026-12-15', end: '2026-12-18' },
  { name: 'CBE / ASVAB', start: '2027-01-19', end: '2027-01-22' },
  { name: 'Eng I & II Interim', start: '2027-01-26', end: '2027-01-27' },
  { name: 'Bio & US Hist Interim', start: '2027-02-10', end: '2027-02-10' },
  { name: 'Alg I Interim', start: '2027-02-23', end: '2027-02-23' },
  { name: 'TELPAS', start: '2027-03-02', end: '2027-03-04' },
  { name: 'TSIA2 English', start: '2027-03-18', end: '2027-03-18' },
  { name: 'TSIA2 Math', start: '2027-03-25', end: '2027-03-25' },
  { name: 'SAT Day for Juniors', start: '2027-03-30', end: '2027-03-30' },
  { name: 'English I & II EOC', start: '2027-04-08', end: '2027-04-08' },
  { name: 'Bio & US Hist EOC', start: '2027-04-15', end: '2027-04-15' },
  { name: 'Alg I EOC', start: '2027-04-27', end: '2027-04-27' },
  { name: 'Growth Post Test', start: '2027-04-28', end: '2027-05-03' },
  { name: 'AP / IBC Testing Window', start: '2027-05-04', end: '2027-05-14' }
];

const START_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
const END_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4CCCC' } };
const HALF_DAY_WARNING = 'Half-day count used. Placement uses whole calendar dates; verify manually.';
const LOW_CONFIDENCE_WARNING = 'Could not confidently extract this section. Use Advanced Mode to review or enter units manually.';

const YAG_REAL_UNIT_PATTERN = /\bUnit\s*\d+(?:\.\d+)?\b/i;

function emptyYagCapacitySummary() {
  return PLC_GRADING_PERIOD_CONFIG.map((p) => ({
    gradingPeriod: p.name,
    calendarDaysAvailable: null,
    nonInstructionalDays: null,
    instructionalDaysAvailable: null,
    totalUnitDays: null,
    balance: null
  }));
}

function getYagCapacitySummaryRow(summary, periodName) {
  return summary.find((row) => row.gradingPeriod === periodName) || null;
}

function isRealYagUnitTitle(text) {
  return YAG_REAL_UNIT_PATTERN.test(String(text || ''));
}

function detectYagSummaryMetric(text) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  if (/\btotal\s+calendar\s+days\s+available\b/i.test(s) || /\bcalendar\s+days\s+available\b/i.test(s)) return 'calendarDaysAvailable';
  if (/\banticipated\s+non[-\s]?instructional\s+days\b/i.test(s) || /\bnon[-\s]?instructional\s+days\b/i.test(s)) return 'nonInstructionalDays';
  if (/\binstructional\s+days\s+available\b/i.test(s)) return 'instructionalDaysAvailable';
  if (/\btotal\s+days\s+in\s+units\b/i.test(s)) return 'totalUnitDays';
  if (/\bbalance\b/i.test(s)) return 'balance';
  return '';
}

function isYagBookkeepingOrEventText(text) {
  return /(total\s+calendar\s+days\s+available|calendar\s+days\s+available|instructional\s+days\s+available|non[-\s]?instructional\s+days|total\s+days\s+in\s+units|balance|anticipated\s+non[-\s]?instructional\s+days|midterms?|finals?|early\s+release|\bSAT\b|\bPSAT\b|\bEOC\b|interim|TELPAS|\bCBE\b|benchmark|testing|holiday|break|professional\s+development|student\s+holiday|staff\s+holiday|teacher\s+workday)/i.test(String(text || ''));
}

function extractNumbersFromRow(row, lastCell) {
  const nums = [];
  for (let c = 1; c <= lastCell; c += 1) {
    const n = extractNumberFromCell(row.getCell(c));
    if (n != null) nums.push({ col: c, value: n });
  }
  return nums;
}

const BLANK_TEMPLATE = `SCHOOL_YEAR:\n2026-2027\n\nCOURSE_NAME:\n\nSKIP_WEEKENDS:\nyes\n\nTERMS:\n1st Nine Weeks | 2026-08-12 | 2026-10-08\n2nd Nine Weeks | 2026-10-13 | 2026-12-18\n3rd Nine Weeks | 2027-01-06 | 2027-03-05\n4th Nine Weeks | 2027-03-15 | 2027-05-20\n\nBLOCKED_DAYS:\nName | YYYY-MM-DD\nName | YYYY-MM-DD | YYYY-MM-DD\n\nEVENT_NOTES:\nName | YYYY-MM-DD\nName | YYYY-MM-DD | YYYY-MM-DD\n\nUNIT_PLAN:\n1st Nine Weeks | Unit Name | Number of Instructional Days\n`;

const EXAMPLE_TEMPLATE = `SCHOOL_YEAR:\n2026-2027\n\nCOURSE_NAME:\nAlgebra 2\n\nSKIP_WEEKENDS:\nyes\n\nTERMS:\n1st Nine Weeks | 2026-08-12 | 2026-10-08\n2nd Nine Weeks | 2026-10-13 | 2026-12-18\n3rd Nine Weeks | 2027-01-06 | 2027-03-05\n4th Nine Weeks | 2027-03-15 | 2027-05-20\n\nBLOCKED_DAYS:\n${DEFAULT_BLOCKED_DAYS.map((d) => `${d.name} | ${d.start}${d.end !== d.start ? ` | ${d.end}` : ''}`).join('\n')}\n\nEVENT_NOTES:\n${DEFAULT_EVENT_NOTES.map((d) => `${d.name} | ${d.start}${d.end !== d.start ? ` | ${d.end}` : ''}`).join('\n')}\n\nUNIT_PLAN:\n1st Nine Weeks | Unit 00 Fundamentals | 13\n1st Nine Weeks | Unit 01 Linear F(x) | 13\n2nd Nine Weeks | Unit 02 Systems | 13\n2nd Nine Weeks | Unit 03 Quadratics | 15.5\n3rd Nine Weeks | Unit 04 Polynomials | 17\n4th Nine Weeks | Unit 05 Review | 7\n`;

const state = {
  mode: 'plc',
  yagWorkbook: null,
  yagName: '',
  mapWorkbook: null,
  mapName: '',
  diagnostics: null,
  courseName: '',
  gradingPeriods: cloneRows(PLC_GRADING_PERIOD_CONFIG),
  blockedDays: cloneRows(DEFAULT_BLOCKED_DAYS),
  eventNotes: cloneRows(DEFAULT_EVENT_NOTES),
  units: [],
  extractionWarnings: [],
  extractionSummary: '',
  yagCapacitySummary: [],
  preview: [],
  previewSucceeded: false,
  applied: false,
  selectedAdvancedUnit: 0,
  fitIssues: [],
  unusedDays: [],
  nextStep: 'Next: upload a district YAG and blank curriculum map.'
};

const $ = (id) => document.getElementById(id);
const escapeHtml = (text) => String(text ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

if (typeof ExcelJS === 'undefined') {
  setStatusMessage('ExcelJS did not load. Workbook import/export will not work until the local browser can load the bundled spreadsheet library.', true);
}

function cloneRows(rows) {
  return rows.map((row) => ({ ...row }));
}

function setStatusMessage(message, isError = false) {
  const panel = $('statusPanel');
  if (panel) panel.innerHTML = `<p class="${isError ? 'error' : 'status'}">${escapeHtml(message)}</p>`;
}

function setNextStep(message) {
  state.nextStep = message;
  updateWorkflowState();
}

function isoDate(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function parseIso(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(dateStr || ''))) return null;
  const dt = new Date(`${dateStr}T00:00:00Z`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function isWeekend(dateStr) {
  const n = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  return n === 0 || n === 6;
}

function datesInRange(startIso, endIso) {
  const out = [];
  const d = new Date(`${startIso}T00:00:00Z`);
  const end = new Date(`${endIso}T00:00:00Z`);
  while (d <= end) {
    out.push(isoDate(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

function excelSerialToDate(serial) {
  if (!Number.isFinite(serial)) return null;
  const excelEpoch = Date.UTC(1899, 11, 30);
  const dt = new Date(excelEpoch + Math.round(serial * 86400000));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function getCellRawValue(cell) {
  if (!cell) return null;
  const value = cell.value;
  if (value == null) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (value && typeof value === 'object') {
    if (value.result != null) return value.result;
    if (value.text != null) return value.text;
    if (Array.isArray(value.richText)) return value.richText.map((rt) => rt.text || '').join('');
  }
  return null;
}

function cellText(cell) {
  const raw = getCellRawValue(cell);
  if (raw == null) return '';
  if (raw instanceof Date) return isoDate(raw);
  return String(raw).replace(/\s+/g, ' ').trim();
}

function readExcelDate(cell, context = {}) {
  const rawValue = getCellRawValue(cell);
  if (rawValue instanceof Date && !Number.isNaN(rawValue.getTime())) return { ok: true, iso: isoDate(rawValue), raw: rawValue, type: 'Date object' };
  if (typeof rawValue === 'number') {
    const dt = excelSerialToDate(rawValue);
    if (dt) return { ok: true, iso: isoDate(dt), raw: rawValue, type: 'Excel serial date' };
  }
  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    const directIso = parseIso(trimmed);
    if (directIso) return { ok: true, iso: isoDate(directIso), raw: rawValue, type: 'full date text' };
    const mdOnly = trimmed.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (mdOnly) {
      const inferredYear = context.periodLabel === '1st' || context.periodLabel === '2nd' ? 2026 : 2027;
      const dt = new Date(Date.UTC(inferredYear, Number(mdOnly[1]) - 1, Number(mdOnly[2])));
      if (!Number.isNaN(dt.getTime())) return { ok: true, iso: isoDate(dt), raw: rawValue, type: 'date-like text with grading-period inference' };
    }
    const attempt = new Date(trimmed);
    if (!Number.isNaN(attempt.getTime())) return { ok: true, iso: isoDate(attempt), raw: rawValue, type: 'full date text' };
  }
  return { ok: false, raw: rawValue, type: 'non-date' };
}

function columnLetterToNumber(letter) {
  return String(letter).split('').reduce((sum, ch) => sum * 26 + ch.toUpperCase().charCodeAt(0) - 64, 0);
}

function getMatchedSheets(sheetNames) {
  const taken = new Set();
  return EXPECTED_SHEET_NAMES.map((expectedName, index) => {
    const periodLabel = GRADING_PERIOD_LABELS[index];
    let actualName = sheetNames.find((name) => name === expectedName);
    let matchType = 'exact';
    if (!actualName) {
      const pattern = new RegExp(`\\b${periodLabel}\\b|${periodLabel}\\s*(9|nine)`, 'i');
      actualName = sheetNames.find((name) => !taken.has(name) && pattern.test(name));
      matchType = actualName ? 'pattern' : 'missing';
    }
    if (actualName) taken.add(actualName);
    return { expectedName, periodLabel, actualName: actualName || null, matchType };
  });
}

function detectWorkbookDates(workbook, workbookName) {
  const diagnostics = {
    workbookName,
    sheetNames: workbook.worksheets.map((ws) => ws.name),
    missingSheets: [],
    perSheet: {},
    totalDateCells: 0,
    firstDate: null,
    lastDate: null,
    allAddresses: [],
    warnings: [],
    matchedSheets: []
  };
  diagnostics.matchedSheets = getMatchedSheets(diagnostics.sheetNames);
  diagnostics.missingSheets = diagnostics.matchedSheets.filter((m) => !m.actualName).map((m) => m.expectedName);
  if (diagnostics.missingSheets.length) diagnostics.warnings.push(`Missing expected curriculum map sheets: ${diagnostics.missingSheets.join(', ')}`);

  for (const match of diagnostics.matchedSheets) {
    const key = `${match.expectedName} (${match.periodLabel})`;
    const ws = match.actualName ? workbook.getWorksheet(match.actualName) : null;
    diagnostics.perSheet[key] = [];
    if (!ws) continue;
    for (let r = 1; r <= (ws.actualRowCount || ws.rowCount); r += 1) {
      DATE_COLUMNS.forEach((dateCol, idx) => {
        const dateAddr = `${dateCol}${r}`;
        const parsed = readExcelDate(ws.getCell(dateAddr), { periodLabel: match.periodLabel });
        if (!parsed.ok) return;
        const noteAddr = `${NOTE_COLUMNS[idx]}${r}`;
        const row = { sheetName: match.actualName, matchedPeriod: match.periodLabel, dateAddr, noteAddr, date: parsed.iso, rawValue: String(parsed.raw), interpretedAs: parsed.type };
        diagnostics.perSheet[key].push(row);
        diagnostics.totalDateCells += 1;
        diagnostics.allAddresses.push(`${match.actualName}!${dateAddr}`);
        if (!diagnostics.firstDate || parsed.iso < diagnostics.firstDate) diagnostics.firstDate = parsed.iso;
        if (!diagnostics.lastDate || parsed.iso > diagnostics.lastDate) diagnostics.lastDate = parsed.iso;
      });
    }
    if (!diagnostics.perSheet[key].length) diagnostics.warnings.push(`No date cells detected in ${match.actualName} for date columns ${DATE_COLUMNS.join(', ')}.`);
  }
  if (!diagnostics.totalDateCells) diagnostics.warnings.push('No date cells detected. Apply is disabled until a curriculum map with dates is uploaded.');
  return diagnostics;
}

function renderDiagnostics() {
  if (!state.diagnostics) {
    $('diagnostics').textContent = 'Upload a blank curriculum map workbook to view diagnostics.';
    return;
  }
  const d = state.diagnostics;
  const detailRows = Object.values(d.perSheet).flat().slice(0, 200);
  $('diagnostics').innerHTML = `<ul>
    <li><strong>Workbook name:</strong> ${escapeHtml(d.workbookName)}</li>
    <li><strong>Sheet names found:</strong> ${escapeHtml(d.sheetNames.join(', ') || 'None')}</li>
    <li><strong>Sheet matching:</strong> ${escapeHtml(d.matchedSheets.map((m) => `${m.expectedName} → ${m.actualName || 'Not found'} [${m.matchType}]`).join(' | '))}</li>
    <li><strong>Date cells detected per sheet:</strong> ${escapeHtml(Object.entries(d.perSheet).map(([s, rows]) => `${s}: ${rows.length}`).join(' | '))}</li>
    <li><strong>Total date cells detected:</strong> ${d.totalDateCells}</li>
    <li><strong>First / last detected date:</strong> ${d.firstDate || 'N/A'} / ${d.lastDate || 'N/A'}</li>
    <li><strong>Warnings:</strong> ${escapeHtml(d.warnings.join('; ') || 'None')}</li>
  </ul>
  <table><thead><tr><th>Sheet</th><th>Period</th><th>Date Cell</th><th>Note Cell</th><th>Raw Value</th><th>Interpreted Date</th><th>Parse Type</th></tr></thead>
  <tbody>${detailRows.map((x) => `<tr><td>${escapeHtml(x.sheetName)}</td><td>${escapeHtml(x.matchedPeriod)}</td><td>${x.dateAddr}</td><td>${x.noteAddr}</td><td>${escapeHtml(x.rawValue)}</td><td>${x.date}</td><td>${escapeHtml(x.interpretedAs)}</td></tr>`).join('')}</tbody></table>`;
}

async function readWorkbookFromFile(file) {
  const buf = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buf);
  return wb;
}

async function handleYagUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    state.yagWorkbook = await readWorkbookFromFile(file);
    state.yagName = file.name;
    state.applied = false;
    $('yagStatus').textContent = `Loaded: ${file.name}`;
    setNextStep('Next: upload the blank curriculum map, then extract units from the YAG.');
  } catch (err) {
    $('yagStatus').innerHTML = `<span class="error">Failed to read YAG: ${escapeHtml(err.message)}</span>`;
  }
}

async function handleMapUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    state.mapWorkbook = await readWorkbookFromFile(file);
    state.mapName = file.name;
    state.diagnostics = detectWorkbookDates(state.mapWorkbook, file.name);
    state.applied = false;
    state.preview = [];
    state.previewSucceeded = false;
    $('mapStatus').textContent = `Loaded: ${file.name}`;
    renderDiagnostics();
    setNextStep(state.yagWorkbook ? 'Next: extract units from the YAG.' : 'Next: upload the completed district YAG.');
  } catch (err) {
    $('mapStatus').innerHTML = `<span class="error">Failed to read curriculum map: ${escapeHtml(err.message)}</span>`;
  }
}

function normalizePeriodLabel(text) {
  const s = String(text || '').toLowerCase();
  if (/\b1(st)?\b|first/.test(s)) return '1st Nine Weeks';
  if (/\b2(nd)?\b|second/.test(s)) return '2nd Nine Weeks';
  if (/\b3(rd)?\b|third/.test(s)) return '3rd Nine Weeks';
  if (/\b4(th)?\b|fourth/.test(s)) return '4th Nine Weeks';
  return '';
}

function isPeriodText(text) {
  return /(1st|first|2nd|second|3rd|third|4th|fourth)\s*(nine|9)/i.test(String(text || ''));
}

function isSkipYagText(text) {
  const s = String(text || '').trim();
  return /^(unit number\/title;?\s*teks|days in unit|instructional days available|total days in units|balance|unit title|unit number|teks)$/i.test(s) ||
    /(instructional days available|total days in units|balance)/i.test(s) ||
    (!isRealYagUnitTitle(s) && isYagBookkeepingOrEventText(s));
}

function extractNumberFromCell(cell) {
  const raw = getCellRawValue(cell);
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string') {
    const cleaned = raw.replace(/,/g, '').trim();
    if (/^\d+(\.\d+)?$/.test(cleaned)) return Number(cleaned);
  }
  return null;
}

function maybeCourseName(rowText) {
  const joined = rowText.join(' ').trim();
  const courseMatch = joined.match(/course\s*(name)?\s*[:\-]\s*(.+)$/i);
  if (courseMatch && courseMatch[2]) return courseMatch[2].trim();
  if (joined && joined.length > 4 && joined.length < 90 && !isPeriodText(joined) && !isSkipYagText(joined) && !/days|balance|total|unit/i.test(joined) && !isYagBookkeepingOrEventText(joined)) return joined;
  return '';
}

function detectYagHeader(rowText, currentHeader) {
  const header = { ...currentHeader };
  rowText.forEach((text, idx) => {
    const col = idx + 1;
    if (/unit number\/title|unit title|unit name/i.test(text)) header.titleCol = col;
    if (/days in unit/i.test(text)) header.daysCol = col;
  });
  return header;
}

function extractUnitsFromYagWorkbook(workbook) {
  const units = [];
  const warnings = [];
  const capacitySummary = emptyYagCapacitySummary();
  const sectionStats = new Map(PLC_GRADING_PERIOD_CONFIG.map((p) => [p.name, { seen: false, units: 0 }]));
  let courseName = '';

  workbook.eachSheet((ws) => {
    let currentPeriod = '';
    let header = { titleCol: null, daysCol: null };
    for (let r = 1; r <= (ws.actualRowCount || ws.rowCount); r += 1) {
      const row = ws.getRow(r);
      const lastCell = Math.max(row.actualCellCount || 0, 12);
      const texts = [];
      for (let c = 1; c <= lastCell; c += 1) texts.push(cellText(row.getCell(c)));
      const joined = texts.filter(Boolean).join(' | ');
      if (!joined) continue;

      const courseGuess = maybeCourseName(texts.filter(Boolean));
      if (!courseName && courseGuess) courseName = courseGuess;

      if (isPeriodText(joined)) {
        currentPeriod = normalizePeriodLabel(joined);
        if (currentPeriod) sectionStats.get(currentPeriod).seen = true;
        header = { titleCol: null, daysCol: null };
        continue;
      }

      header = detectYagHeader(texts, header);

      const nums = extractNumbersFromRow(row, lastCell);
      const summaryMetric = detectYagSummaryMetric(joined);
      if (currentPeriod && summaryMetric) {
        const summaryRow = getYagCapacitySummaryRow(capacitySummary, currentPeriod);
        const value = nums.length ? nums[nums.length - 1].value : null;
        if (summaryRow && value != null) summaryRow[summaryMetric] = value;
        if (summaryMetric === 'balance' && value != null && Math.abs(value) > 0.0001) warnings.push(`${currentPeriod} balance is ${value}; expected 0.`);
        continue;
      }
      if (!currentPeriod) continue;

      const daysCandidates = nums.filter((n) => n.value > 0 && n.value < 200);
      if (!daysCandidates.length) continue;

      let daysCandidate = header.daysCol ? daysCandidates.find((d) => d.col === header.daysCol) : null;
      if (!daysCandidate) daysCandidate = daysCandidates[daysCandidates.length - 1];

      let titleCol = header.titleCol;
      if (!titleCol || !isRealYagUnitTitle(cellText(row.getCell(titleCol)))) {
        titleCol = 0;
        for (let c = 1; c <= lastCell; c += 1) {
          const text = cellText(row.getCell(c));
          if (!text || c === daysCandidate.col || isSkipYagText(text) || /^\d+(\.\d+)?$/.test(text) || !isRealYagUnitTitle(text)) continue;
          titleCol = c;
          break;
        }
      }
      if (!titleCol) continue;
      const title = cellText(row.getCell(titleCol));
      if (!title || !isRealYagUnitTitle(title) || isPeriodText(title)) continue;

      const warning = Number.isInteger(daysCandidate.value) ? '' : HALF_DAY_WARNING;
      units.push({
        gradingPeriod: currentPeriod,
        unitName: title,
        days: daysCandidate.value,
        sourceSheet: ws.name,
        sourceCell: row.getCell(titleCol).address,
        warning,
        allowCrossPeriod: false
      });
      sectionStats.get(currentPeriod).units += 1;
    }
  });

  for (const [period, stat] of sectionStats) {
    if (stat.seen && stat.units === 0) warnings.push(`${period}: ${LOW_CONFIDENCE_WARNING}`);
  }
  if (!units.length) warnings.push('No units extracted. Use Advanced Mode to review or enter units manually.');
  return { units, warnings, courseName, capacitySummary };
}

function extractUnitsFromYag() {
  if (!state.yagWorkbook) {
    showValidationError('No YAG uploaded. Upload a completed district YAG workbook first.');
    return;
  }
  const result = extractUnitsFromYagWorkbook(state.yagWorkbook);
  state.units = result.units;
  state.extractionWarnings = result.warnings;
  state.yagCapacitySummary = result.capacitySummary || [];
  state.courseName = result.courseName || state.courseName;
  state.preview = [];
  state.previewSucceeded = false;
  state.applied = false;
  renderUnitTables();
  renderExtractionSummary();
  syncTemplateFromState();
  setNextStep(state.units.length ? 'Next: review extracted units, make small edits if needed, then generate preview.' : LOW_CONFIDENCE_WARNING);
}

function formatYagSummaryValue(value) {
  return value == null ? '—' : String(value);
}

function hasYagSummaryValues(row) {
  return row && ['calendarDaysAvailable', 'nonInstructionalDays', 'instructionalDaysAvailable', 'totalUnitDays', 'balance'].some((key) => row[key] != null);
}

function renderYagCapacitySummary() {
  const rows = (state.yagCapacitySummary || []).filter(hasYagSummaryValues);
  if (!rows.length) return '';
  const balanceMessages = rows.filter((row) => row.balance != null).map((row) => {
    if (Math.abs(row.balance) <= 0.0001) return `<li class="ok">${escapeHtml(row.gradingPeriod)}: YAG balance appears complete for this grading period.</li>`;
    return `<li class="warn">${escapeHtml(row.gradingPeriod)}: YAG balance is ${escapeHtml(row.balance)}; review unit totals and available days.</li>`;
  }).join('');
  return `<h3>YAG Capacity Diagnostics</h3>
    <table><thead><tr><th>Grading Period</th><th>Calendar Days Available</th><th>Non-instructional Days</th><th>Instructional Days Available</th><th>Total Unit Days</th><th>Balance</th></tr></thead><tbody>
      ${rows.map((row) => `<tr><td>${escapeHtml(row.gradingPeriod)}</td><td>${formatYagSummaryValue(row.calendarDaysAvailable)}</td><td>${formatYagSummaryValue(row.nonInstructionalDays)}</td><td>${formatYagSummaryValue(row.instructionalDaysAvailable)}</td><td>${formatYagSummaryValue(row.totalUnitDays)}</td><td>${formatYagSummaryValue(row.balance)}</td></tr>`).join('')}
    </tbody></table>
    ${balanceMessages ? `<ul>${balanceMessages}</ul>` : ''}`;
}

function renderExtractionSummary() {
  const byPeriod = PLC_GRADING_PERIOD_CONFIG.map((p) => `${p.name}: ${state.units.filter((u) => u.gradingPeriod === p.name).length} unit(s)`).join(' | ');
  const warnings = state.extractionWarnings.length ? `<ul>${state.extractionWarnings.map((w) => `<li class="warn">${escapeHtml(w)}</li>`).join('')}</ul>` : '<p class="ok">Extraction completed with no balance or confidence warnings.</p>';
  $('plcExtractionSummary').innerHTML = `<p><strong>Course:</strong> ${escapeHtml(state.courseName || 'Not detected')}</p><p>${escapeHtml(byPeriod)}</p>${renderYagCapacitySummary()}${warnings}`;
}

function periodOptions(selected) {
  return state.gradingPeriods.map((p) => `<option value="${escapeHtml(p.name)}" ${p.name === selected ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('');
}

function renderPlcUnitTable() {
  if (!state.units.length) {
    $('plcUnitTableOutput').textContent = 'No extracted units yet. Use Extract Units from YAG or add a row.';
    return;
  }
  $('plcUnitTableOutput').innerHTML = `<table><thead><tr><th>Grading Period</th><th>Unit Name</th><th>Instructional Days</th><th>Source Sheet</th><th>Source Cell</th><th>Warning</th><th>Action</th></tr></thead><tbody>
    ${state.units.map((u, i) => `<tr>
      <td><select data-table="unit" data-i="${i}" data-k="gradingPeriod">${periodOptions(u.gradingPeriod)}</select></td>
      <td><input data-table="unit" data-i="${i}" data-k="unitName" value="${escapeHtml(u.unitName)}" /></td>
      <td><input type="number" step="0.5" min="0.5" data-table="unit" data-i="${i}" data-k="days" value="${u.days}" /></td>
      <td>${escapeHtml(u.sourceSheet || 'Manual')}</td><td>${escapeHtml(u.sourceCell || '')}</td><td>${escapeHtml(u.warning || '')}</td>
      <td><button type="button" data-delete-unit="${i}">Delete</button></td>
    </tr>`).join('')}</tbody></table>`;
  bindUnitTableInputs('plcUnitTableOutput');
}

function renderAdvancedUnitTable() {
  if (!state.units.length) {
    $('advancedUnitTableOutput').textContent = 'No unit rows yet. Extract in PLC Mode or add rows manually.';
    return;
  }
  $('advancedUnitTableOutput').innerHTML = `<table><thead><tr><th>Select</th><th>Grading Period</th><th>Unit Name</th><th>Instructional Days</th><th>Allow Continue</th><th>Action</th></tr></thead><tbody>
    ${state.units.map((u, i) => `<tr class="${i === state.selectedAdvancedUnit ? 'selected-row' : ''}">
      <td><input type="radio" name="advancedUnitSelect" data-select-unit="${i}" ${i === state.selectedAdvancedUnit ? 'checked' : ''} /></td>
      <td><select data-table="unit" data-i="${i}" data-k="gradingPeriod">${periodOptions(u.gradingPeriod)}</select></td>
      <td><input data-table="unit" data-i="${i}" data-k="unitName" value="${escapeHtml(u.unitName)}" /></td>
      <td><input type="number" step="0.5" min="0.5" data-table="unit" data-i="${i}" data-k="days" value="${u.days}" /></td>
      <td><input type="checkbox" data-table="unit" data-i="${i}" data-k="allowCrossPeriod" ${u.allowCrossPeriod ? 'checked' : ''} /></td>
      <td><button type="button" data-delete-unit="${i}">Delete</button></td>
    </tr>`).join('')}</tbody></table>`;
  bindUnitTableInputs('advancedUnitTableOutput');
}

function bindUnitTableInputs(containerId) {
  $(containerId).querySelectorAll('[data-table="unit"]').forEach((el) => {
    el.addEventListener('input', updateUnitFromInput);
    el.addEventListener('change', updateUnitFromInput);
  });
  $(containerId).querySelectorAll('[data-delete-unit]').forEach((btn) => btn.addEventListener('click', () => deleteUnit(Number(btn.dataset.deleteUnit))));
  $(containerId).querySelectorAll('[data-select-unit]').forEach((input) => input.addEventListener('change', () => {
    state.selectedAdvancedUnit = Number(input.dataset.selectUnit);
    renderAdvancedUnitTable();
  }));
}

function updateUnitFromInput(e) {
  const i = Number(e.target.dataset.i);
  const k = e.target.dataset.k;
  if (!state.units[i]) return;
  if (k === 'days') {
    const value = Number(e.target.value);
    state.units[i].days = value;
    state.units[i].warning = Number.isInteger(value) ? '' : HALF_DAY_WARNING;
  } else if (k === 'allowCrossPeriod') {
    state.units[i].allowCrossPeriod = e.target.checked;
  } else {
    state.units[i][k] = e.target.value;
  }
  markPreviewStale();
}

function markPreviewStale() {
  state.previewSucceeded = false;
  state.applied = false;
  syncTemplateFromState();
  updateWorkflowState();
}

function addUnitRow(defaultPeriod = state.gradingPeriods[0].name) {
  state.units.push({ gradingPeriod: defaultPeriod, unitName: '', days: 1, sourceSheet: 'Manual', sourceCell: '', warning: '', allowCrossPeriod: false });
  state.selectedAdvancedUnit = state.units.length - 1;
  renderUnitTables();
  markPreviewStale();
}

function deleteUnit(index) {
  state.units.splice(index, 1);
  state.selectedAdvancedUnit = Math.max(0, Math.min(state.selectedAdvancedUnit, state.units.length - 1));
  renderUnitTables();
  markPreviewStale();
}

function renderUnitTables() {
  renderPlcUnitTable();
  renderAdvancedUnitTable();
  renderExtractionSummary();
}

function renderGpTable() {
  $('gradingPeriodTableOutput').innerHTML = `<table><thead><tr><th>Grading Period</th><th>Start Date</th><th>End Date</th></tr></thead><tbody>
    ${state.gradingPeriods.map((p, i) => `<tr><td>${escapeHtml(p.name)}</td><td><input type="date" data-gp="${i}" data-k="start" value="${p.start}" /></td><td><input type="date" data-gp="${i}" data-k="end" value="${p.end}" /></td></tr>`).join('')}</tbody></table>`;
  $('gradingPeriodTableOutput').querySelectorAll('[data-gp]').forEach((el) => el.addEventListener('input', (e) => {
    state.gradingPeriods[Number(e.target.dataset.gp)][e.target.dataset.k] = e.target.value;
    markPreviewStale();
  }));
}

function renderRangeTable(containerId, rows, type) {
  $(containerId).innerHTML = `<table><thead><tr><th>Name</th><th>Start Date</th><th>End Date</th><th>Action</th></tr></thead><tbody>
    ${rows.map((row, i) => `<tr><td><input data-range-type="${type}" data-i="${i}" data-k="name" value="${escapeHtml(row.name)}" /></td><td><input type="date" data-range-type="${type}" data-i="${i}" data-k="start" value="${row.start}" /></td><td><input type="date" data-range-type="${type}" data-i="${i}" data-k="end" value="${row.end}" /></td><td><button type="button" data-delete-range="${type}:${i}">Delete</button></td></tr>`).join('')}</tbody></table>`;
  $(containerId).querySelectorAll('[data-range-type]').forEach((el) => el.addEventListener('input', (e) => {
    const targetRows = e.target.dataset.rangeType === 'blocked' ? state.blockedDays : state.eventNotes;
    targetRows[Number(e.target.dataset.i)][e.target.dataset.k] = e.target.value;
    markPreviewStale();
  }));
  $(containerId).querySelectorAll('[data-delete-range]').forEach((btn) => btn.addEventListener('click', () => {
    const [rangeType, idx] = btn.dataset.deleteRange.split(':');
    (rangeType === 'blocked' ? state.blockedDays : state.eventNotes).splice(Number(idx), 1);
    renderAdvancedTables();
    markPreviewStale();
  }));
}

function renderAdvancedTables() {
  renderGpTable();
  renderRangeTable('blockedDaysTableOutput', state.blockedDays, 'blocked');
  renderRangeTable('eventNotesTableOutput', state.eventNotes, 'event');
  renderAdvancedUnitTable();
  renderFitIssues();
}

function validatePlanningState() {
  const errors = [];
  if (!state.mapWorkbook) errors.push('No curriculum map uploaded. Upload a blank curriculum map workbook before generating preview.');
  if (!state.units.length) errors.push('No units found. Extract units from a YAG or add units manually.');
  state.gradingPeriods.forEach((p) => {
    if (!parseIso(p.start) || !parseIso(p.end)) errors.push(`${p.name}: missing or invalid start/end date.`);
    else if (p.start > p.end) errors.push(`${p.name}: start date must be before end date.`);
  });
  state.blockedDays.concat(state.eventNotes).forEach((d) => {
    if (!d.name || !parseIso(d.start) || !parseIso(d.end)) errors.push(`Date range row is missing a name, start date, or end date.`);
    else if (d.start > d.end) errors.push(`${d.name}: start date must be before end date.`);
  });
  state.units.forEach((u, i) => {
    if (!u.gradingPeriod) errors.push(`Unit row ${i + 1}: grading period is required.`);
    if (!u.unitName.trim()) errors.push(`Unit row ${i + 1}: unit name is required.`);
    if (!Number.isFinite(Number(u.days)) || Number(u.days) <= 0) errors.push(`Unit row ${i + 1}: instructional days must be greater than 0.`);
  });
  if (state.diagnostics?.missingSheets.length) errors.push(`Missing expected curriculum map sheets: ${state.diagnostics.missingSheets.join(', ')}.`);
  if (state.diagnostics && state.diagnostics.totalDateCells === 0) errors.push('No date cells detected in the curriculum map workbook.');
  return errors;
}

function dateRowsForPeriod(period) {
  const dateRows = Object.values(state.diagnostics?.perSheet || {}).flat().sort((a, b) => a.date.localeCompare(b.date));
  const blockedSet = new Set(state.blockedDays.flatMap((b) => datesInRange(b.start, b.end)));
  return dateRows.filter((d) => d.date >= period.start && d.date <= period.end && !isWeekend(d.date) && !blockedSet.has(d.date));
}

function buildPreview() {
  const errors = validatePlanningState();
  if (errors.length) {
    state.preview = [];
    state.previewSucceeded = false;
    $('previewOutput').innerHTML = `<p class="error">Preview cannot be generated yet.</p><ul>${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`;
    setNextStep('Fix the listed issue before generating preview.');
    updateWorkflowState();
    return;
  }

  const events = state.eventNotes.map((e) => ({ name: e.name, dates: new Set(datesInRange(e.start, e.end)) }));
  const rows = [];
  const fitIssues = [];
  const unusedDays = [];

  for (let gpIndex = 0; gpIndex < state.gradingPeriods.length; gpIndex += 1) {
    const period = state.gradingPeriods[gpIndex];
    const periodDays = dateRowsForPeriod(period);
    const units = state.units.filter((u) => u.gradingPeriod === period.name);
    let cursor = 0;

    for (let unitIndex = 0; unitIndex < units.length; unitIndex += 1) {
      const unit = units[unitIndex];
      const exactDays = Number(unit.days);
      const placementDays = Math.ceil(exactDays);
      let daysPool = periodDays;
      let termLabel = period.name;
      if (unit.allowCrossPeriod) {
        daysPool = [];
        for (let i = gpIndex; i < state.gradingPeriods.length; i += 1) daysPool.push(...dateRowsForPeriod(state.gradingPeriods[i]));
        daysPool = daysPool.filter((d) => d.date >= (periodDays[cursor]?.date || period.start));
      }
      const remaining = Math.max(0, daysPool.length - cursor);
      if (cursor + placementDays > daysPool.length) {
        const status = `Only ${remaining} instructional days remain in this grading period, but this unit needs ${exactDays}.`;
        rows.push({ term: period.name, unit: unit.unitName, days: exactDays, startDate: remaining ? daysPool[cursor].date : 'N/A', endDate: 'N/A', skippedBlockedDays: 'N/A', eventWarnings: '', status });
        fitIssues.push({ period: period.name, unitName: unit.unitName, unitGlobalIndex: state.units.indexOf(unit), remaining, needed: exactDays, status });
        continue;
      }
      const slice = daysPool.slice(cursor, cursor + placementDays);
      cursor += placementDays;
      const eventHits = events.filter((ev) => slice.some((d) => ev.dates.has(d.date))).map((ev) => ev.name);
      const warnings = [];
      if (eventHits.length) warnings.push('Scheduled with event-note warnings');
      if (!Number.isInteger(exactDays)) warnings.push(HALF_DAY_WARNING);
      if (unit.allowCrossPeriod) warnings.push('Allowed to continue into next grading period; verify manually.');
      rows.push({
        term: termLabel,
        unit: unit.unitName,
        days: exactDays,
        startDate: slice[0].date,
        endDate: slice[slice.length - 1].date,
        skippedBlockedDays: 'Weekends and blocked days skipped',
        eventWarnings: eventHits.join('; '),
        status: warnings.length ? warnings.join('; ') : 'Scheduled'
      });
    }
    const remainingInPeriod = Math.max(0, periodDays.length - cursor);
    unusedDays.push({ period: period.name, days: remainingInPeriod });
    if (remainingInPeriod > 0) rows.push({ term: period.name, unit: '(unused grading-period capacity)', days: remainingInPeriod, startDate: '', endDate: '', skippedBlockedDays: '', eventWarnings: '', status: 'Unused instructional days remain' });
  }

  state.preview = rows;
  state.fitIssues = fitIssues;
  state.unusedDays = unusedDays;
  state.previewSucceeded = fitIssues.length === 0;
  state.applied = false;
  renderPreview();
  renderFitIssues();
  setNextStep(state.previewSucceeded ? 'Preview ready. Review warnings, then apply changes.' : 'Preview has unscheduled units. Fix them in Advanced Mode or explicitly confirm before applying scheduled rows.');
}

function renderPreview() {
  if (!state.preview.length) {
    $('previewOutput').textContent = 'Generate a preview to see unit start/end dates, warnings, and unused days.';
    return;
  }
  const seriousWarnings = state.preview.filter((r) => r.endDate === 'N/A').map((r) => r.status);
  const warningBlock = seriousWarnings.length ? `<div class="error-box"><strong>Serious warnings:</strong><ul>${seriousWarnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('')}</ul></div>` : '';
  $('previewOutput').innerHTML = `${warningBlock}<table><thead><tr><th>Grading Period</th><th>Unit Name</th><th>Instructional Days Required</th><th>Generated Start Date</th><th>Generated End Date</th><th>Skipped Blocked Days</th><th>Event-Note Warnings</th><th>Status or Warning</th></tr></thead><tbody>
    ${state.preview.map((r) => `<tr class="${r.endDate === 'N/A' ? 'issue-row' : ''}"><td>${escapeHtml(r.term)}</td><td>${escapeHtml(r.unit)}</td><td>${r.days}</td><td>${escapeHtml(r.startDate)}</td><td>${escapeHtml(r.endDate)}</td><td>${escapeHtml(r.skippedBlockedDays)}</td><td>${escapeHtml(r.eventWarnings)}</td><td>${escapeHtml(r.status)}</td></tr>`).join('')}</tbody></table>`;
}

function renderFitIssues() {
  const unused = state.unusedDays.length ? `<h3>Unused Days by Grading Period</h3><ul>${state.unusedDays.map((u) => `<li>${escapeHtml(u.period)}: ${u.days}</li>`).join('')}</ul>` : '<p>No unused-day data yet.</p>';
  const issues = state.fitIssues.length ? `<h3>Units That Did Not Fit</h3><ul>${state.fitIssues.map((i) => `<li class="error">${escapeHtml(i.status)}</li>`).join('')}</ul>` : '<p class="ok">No fit issues detected in the latest preview.</p>';
  $('fitIssuesOutput').innerHTML = `${unused}${issues}<p class="status">Adjustment helpers modify the Unit Plan Editor. Regenerate the preview after using a helper.</p>`;
}

function previewRowsForExport() {
  const headers = ['Grading Period', 'Unit Name', 'Instructional Days Required', 'Generated Start Date', 'Generated End Date', 'Skipped Blocked Days', 'Event-Note Warnings', 'Status or Warning'];
  const body = state.preview.map((r) => [r.term, r.unit, r.days, r.startDate, r.endDate, r.skippedBlockedDays, r.eventWarnings, r.status]);
  return [headers, ...body];
}

function previewToDelimited(delimiter) {
  return previewRowsForExport().map((row) => row.map((cell) => String(cell ?? '').replace(/\r?\n/g, ' ')).join(delimiter)).join('\n');
}

function previewToCsv() {
  return previewRowsForExport().map((row) => row.map((cell) => `"${String(cell ?? '').replace(/\r?\n/g, ' ').replace(/"/g, '""')}"`).join(',')).join('\n');
}

async function copyPreviewToClipboard() {
  if (!state.preview.length) {
    showValidationError('No preview to copy. Generate Preview first.');
    return;
  }
  await navigator.clipboard.writeText(previewToDelimited('\t'));
  setNextStep('Preview copied to clipboard.');
}

function downloadPreviewCsv() {
  if (!state.preview.length) {
    showValidationError('No preview to download. Generate Preview first.');
    return;
  }
  const csv = previewToCsv();
  const safeCourse = (state.courseName || 'curriculum-map').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  downloadBlob(csv, `${safeCourse || 'curriculum-map'}-preview.csv`, 'text/csv');
  setNextStep('Preview CSV download started.');
}

function applyPreviewChanges() {
  if (!state.mapWorkbook || !state.preview.length || !state.diagnostics) {
    showValidationError('Cannot apply changes: upload a curriculum map and generate a preview first.');
    return;
  }
  const seriousRows = state.preview.filter((r) => r.endDate === 'N/A');
  if (seriousRows.length && !$('confirmUnscheduledInput').checked) {
    showValidationError('Unscheduled units are present. Fix them in Advanced Mode or check the confirmation box before applying scheduled rows.');
    return;
  }

  const byDate = new Map(Object.values(state.diagnostics.perSheet).flat().map((row) => [row.date, row]));
  let startLabels = 0;
  let endLabels = 0;
  let dateCellsColored = 0;
  const noteCellsTouched = new Set();

  for (const item of state.preview) {
    if (!item.startDate || !item.endDate || item.endDate === 'N/A' || item.unit.startsWith('(unused')) continue;
    const start = byDate.get(item.startDate);
    const end = byDate.get(item.endDate);
    if (!start || !end) continue;
    const startWs = state.mapWorkbook.getWorksheet(start.sheetName);
    const endWs = state.mapWorkbook.getWorksheet(end.sheetName);
    appendNote(startWs, start.noteAddr, `START: ${item.unit}`);
    appendNote(endWs, end.noteAddr, `END: ${item.unit}`);
    colorDateCell(startWs, start.dateAddr, START_FILL);
    colorDateCell(endWs, end.dateAddr, END_FILL);
    startLabels += 1;
    endLabels += 1;
    dateCellsColored += 2;
    noteCellsTouched.add(`${start.sheetName}!${start.noteAddr}`);
    noteCellsTouched.add(`${end.sheetName}!${end.noteAddr}`);
  }
  state.applied = true;
  $('applyStatus').textContent = `Applied changes in memory only. START labels: ${startLabels}; END labels: ${endLabels}; Date cells colored: ${dateCellsColored}; Note cells updated: ${noteCellsTouched.size}. Download creates a new edited copy.`;
  setNextStep('Changes applied in memory. Next: download the edited curriculum map.');
}

function appendNote(ws, addr, text) {
  const cell = ws.getCell(addr);
  const existing = String(getCellRawValue(cell) || '').replace(/\s+$/g, '');
  cell.value = existing ? `${existing}\n\n${text}` : text;
  cell.alignment = { ...(cell.alignment || {}), wrapText: true };
}

function colorDateCell(ws, addr, fill) {
  ws.getCell(addr).fill = { ...fill };
}

async function downloadEditedWorkbook() {
  if (!state.mapWorkbook || !state.applied) {
    showValidationError('No applied changes to export. Apply Changes first.');
    return;
  }
  const outputName = `${state.mapName.replace(/\.(xlsx|xlsm|xls)$/i, '')}-edited-curriculum-map.xlsx`;
  const buf = await state.mapWorkbook.xlsx.writeBuffer();
  downloadBlob(buf, outputName, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  setNextStep('Download started for the edited curriculum map.');
}

function downloadBlob(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

function showValidationError(message) {
  $('previewOutput').innerHTML = `<p class="error">${escapeHtml(message)}</p>`;
  setNextStep(message);
}

function syncTemplateFromState() {
  $('templateInput').value = `SCHOOL_YEAR:\n2026-2027\n\nCOURSE_NAME:\n${state.courseName || ''}\n\nSKIP_WEEKENDS:\nyes\n\nTERMS:\n${state.gradingPeriods.map((p) => `${p.name} | ${p.start} | ${p.end}`).join('\n')}\n\nBLOCKED_DAYS:\n${state.blockedDays.map((d) => `${d.name} | ${d.start}${d.end !== d.start ? ` | ${d.end}` : ''}`).join('\n')}\n\nEVENT_NOTES:\n${state.eventNotes.map((d) => `${d.name} | ${d.start}${d.end !== d.start ? ` | ${d.end}` : ''}`).join('\n')}\n\nUNIT_PLAN:\n${state.units.map((u) => `${u.gradingPeriod} | ${u.unitName} | ${u.days}${u.allowCrossPeriod ? ' | allow-cross-period' : ''}`).join('\n')}\n`;
}

function parseTemplate(text) {
  const data = { courseName: '', terms: [], blocked: [], events: [], units: [] };
  const errors = [];
  let section = '';
  text.split(/\r?\n/).forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) return;
    if (line.endsWith(':')) {
      section = line.slice(0, -1).trim().toUpperCase();
      return;
    }
    const parts = line.split('|').map((p) => p.trim());
    const lineNo = idx + 1;
    if (section === 'COURSE_NAME') data.courseName = line;
    else if (section === 'TERMS' && parts.length === 3) data.terms.push({ name: parts[0], start: parts[1], end: parts[2] });
    else if ((section === 'BLOCKED_DAYS' || section === 'EVENT_NOTES') && (parts.length === 2 || parts.length === 3)) {
      const row = { name: parts[0], start: parts[1], end: parts[2] || parts[1] };
      (section === 'BLOCKED_DAYS' ? data.blocked : data.events).push(row);
    } else if (section === 'UNIT_PLAN' && (parts.length === 3 || parts.length === 4)) {
      data.units.push({ gradingPeriod: parts[0], unitName: parts[1], days: Number(parts[2]), sourceSheet: 'Template', sourceCell: '', warning: Number.isInteger(Number(parts[2])) ? '' : HALF_DAY_WARNING, allowCrossPeriod: /allow/i.test(parts[3] || '') });
    } else if (!['SCHOOL_YEAR', 'SKIP_WEEKENDS'].includes(section)) errors.push(`Line ${lineNo}: cannot read this template row.`);
  });
  return { ok: errors.length === 0, errors, data };
}

function importTemplateIntoTables() {
  const parsed = parseTemplate($('templateInput').value);
  if (!parsed.ok) {
    showValidationError(`Template import failed: ${parsed.errors.join('; ')}`);
    return;
  }
  state.courseName = parsed.data.courseName || state.courseName;
  if (parsed.data.terms.length) state.gradingPeriods = parsed.data.terms;
  state.blockedDays = parsed.data.blocked;
  state.eventNotes = parsed.data.events;
  state.units = parsed.data.units;
  renderAdvancedTables();
  renderUnitTables();
  markPreviewStale();
  setNextStep('Template imported into Advanced Mode tables. Review, then generate preview.');
}

function openAdvancedMode() {
  state.mode = 'advanced';
  $('modeAdvanced').checked = true;
  $('modePlc').checked = false;
  syncTemplateFromState();
  renderAdvancedTables();
  updateWorkflowState();
  document.getElementById('advancedModeSections').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function moveSelectedUnit(delta) {
  const i = state.selectedAdvancedUnit;
  const j = i + delta;
  if (j < 0 || j >= state.units.length) {
    showValidationError('Cannot move the selected unit farther in that direction.');
    return;
  }
  [state.units[i], state.units[j]] = [state.units[j], state.units[i]];
  state.selectedAdvancedUnit = j;
  renderUnitTables();
  markPreviewStale();
}

function selectedUnit() {
  return state.units[state.selectedAdvancedUnit] || null;
}

function getCurrentIssueUnit() {
  if (state.fitIssues.length) return state.units[state.fitIssues[0].unitGlobalIndex] || selectedUnit();
  return selectedUnit();
}

function addUnusedDaysTo(direction) {
  const period = selectedUnit()?.gradingPeriod || state.gradingPeriods[0].name;
  const unused = state.unusedDays.find((u) => u.period === period && u.days > 0);
  if (!unused) {
    showValidationError('No unused days are available in the selected grading period.');
    return;
  }
  const units = state.units.filter((u) => u.gradingPeriod === period);
  const target = direction === 'previous' ? units[units.length - 1] : units[0];
  if (!target) {
    showValidationError('No unit is available in this grading period to receive unused days.');
    return;
  }
  target.days = Number(target.days) + unused.days;
  target.warning = Number.isInteger(target.days) ? '' : HALF_DAY_WARNING;
  renderUnitTables();
  markPreviewStale();
  setNextStep('Unused days added to a nearby unit. Regenerate the preview.');
}

function distributeUnusedDays() {
  const period = selectedUnit()?.gradingPeriod || state.gradingPeriods[0].name;
  const unused = state.unusedDays.find((u) => u.period === period && u.days > 0);
  const units = state.units.filter((u) => u.gradingPeriod === period);
  if (!unused || !units.length) {
    showValidationError('No unused days and units are available for the selected grading period.');
    return;
  }
  const each = unused.days / units.length;
  units.forEach((u) => {
    u.days = Number((Number(u.days) + each).toFixed(2));
    u.warning = Number.isInteger(u.days) ? '' : HALF_DAY_WARNING;
  });
  renderUnitTables();
  markPreviewStale();
  setNextStep('Unused days distributed. Regenerate the preview and verify decimal day counts manually.');
}

function nextPeriodName(current) {
  const idx = state.gradingPeriods.findIndex((p) => p.name === current);
  return state.gradingPeriods[idx + 1]?.name || current;
}

function moveIssueToNextGp() {
  const unit = getCurrentIssueUnit();
  if (!unit) {
    showValidationError('No unit selected or fit issue available.');
    return;
  }
  const next = nextPeriodName(unit.gradingPeriod);
  if (next === unit.gradingPeriod) {
    showValidationError('This unit is already in the final grading period.');
    return;
  }
  unit.gradingPeriod = next;
  renderUnitTables();
  markPreviewStale();
  setNextStep('Unit moved to the next grading period. Regenerate the preview.');
}

function allowIssueCrossGp() {
  const unit = getCurrentIssueUnit();
  if (!unit) {
    showValidationError('No unit selected or fit issue available.');
    return;
  }
  unit.allowCrossPeriod = true;
  renderUnitTables();
  markPreviewStale();
  setNextStep('Unit is allowed to continue into the next grading period. Regenerate the preview.');
}

function adjustIssueUnit(delta) {
  const unit = getCurrentIssueUnit();
  if (!unit) {
    showValidationError('No unit selected or fit issue available.');
    return;
  }
  unit.days = Math.max(0.5, Number(unit.days) + delta);
  unit.warning = Number.isInteger(unit.days) ? '' : HALF_DAY_WARNING;
  renderUnitTables();
  markPreviewStale();
  setNextStep('Unit day count adjusted. Regenerate the preview.');
}

function resetDefaults() {
  state.gradingPeriods = cloneRows(PLC_GRADING_PERIOD_CONFIG);
  renderAdvancedTables();
  markPreviewStale();
  setNextStep('Default grading-period dates restored.');
}

function exportBlockedDays() {
  const text = state.blockedDays.map((d) => `${d.name}\t${d.start}\t${d.end}`).join('\n');
  downloadBlob(text, 'blocked-days.tsv', 'text/tab-separated-values');
  setNextStep('Blocked days export started.');
}

function updateWorkflowState() {
  const mode = state.mode;
  $('workflowTitle').textContent = mode === 'plc' ? 'PLC Mode Workflow' : 'Advanced Mode Workflow';
  $('nextStepMessage').textContent = state.nextStep;
  $('plcWorkflowRow').classList.toggle('hidden', mode !== 'plc');
  $('advancedWorkflowRow').classList.toggle('hidden', mode !== 'advanced');
  $('plcModeSections').classList.toggle('hidden', mode !== 'plc');
  $('advancedModeSections').classList.toggle('hidden', mode !== 'advanced');

  const d = state.diagnostics;
  $('statusPanel').innerHTML = `<ul>
    <li><strong>Mode:</strong> ${mode === 'plc' ? 'PLC Mode' : 'Advanced Mode'}</li>
    <li><strong>YAG loaded:</strong> ${state.yagWorkbook ? escapeHtml(state.yagName) : 'No'}</li>
    <li><strong>Curriculum map loaded:</strong> ${state.mapWorkbook ? escapeHtml(state.mapName) : 'No'}</li>
    <li><strong>Date cells detected:</strong> ${d ? d.totalDateCells : 0}</li>
    <li><strong>Extracted/manual units:</strong> ${state.units.length}</li>
    <li><strong>Preview rows:</strong> ${state.preview.length}</li>
    <li><strong>Applied in memory:</strong> ${state.applied ? 'Yes' : 'No'}</li>
    <li><strong>Next step:</strong> ${escapeHtml(state.nextStep)}</li>
  </ul>`;

  setStepState('wfPlcUploadBtn', state.yagWorkbook && state.mapWorkbook ? 'complete' : 'current');
  setStepState('wfPlcExtractBtn', state.units.length ? 'complete' : (state.yagWorkbook ? 'current' : ''));
  setStepState('wfPlcReviewBtn', state.units.length ? 'current' : '');
  setStepState('wfPlcPreviewBtn', state.preview.length ? 'complete' : (state.units.length ? 'current' : ''));
  setStepState('wfPlcApplyBtn', state.applied ? 'complete' : (state.preview.length ? 'current' : ''));
  setStepState('wfPlcDownloadBtn', state.applied ? 'current' : '');
  setStepState('wfAdvDiagnosticsBtn', state.diagnostics ? 'complete' : 'current');
  setStepState('wfAdvSetupBtn', state.gradingPeriods.length ? 'complete' : 'current');
  setStepState('wfAdvUnitsBtn', state.units.length ? 'complete' : 'current');
  setStepState('wfAdvFitBtn', state.fitIssues.length ? 'warning' : (state.preview.length ? 'complete' : ''));
  setStepState('wfAdvPreviewBtn', state.preview.length ? 'complete' : (state.units.length ? 'current' : ''));
  setStepState('wfAdvApplyDownloadBtn', state.applied ? 'complete' : (state.preview.length ? 'current' : ''));
}

function setStepState(id, cls) {
  const el = $(id);
  if (!el) return;
  el.className = `workflow-step workflow-control ${cls || ''}`.trim();
}

function scrollTo(id) {
  const el = $(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function bindEvents() {
  $('yagFileInput').addEventListener('change', handleYagUpload);
  $('mapFileInput').addEventListener('change', handleMapUpload);
  $('extractUnitsBtn').onclick = extractUnitsFromYag;
  $('addPlcUnitRowBtn').onclick = () => addUnitRow();
  $('generatePlcPreviewBtn').onclick = buildPreview;
  $('generateAdvPreviewBtn').onclick = buildPreview;
  $('copyPreviewBtn').onclick = copyPreviewToClipboard;
  $('downloadPreviewCsvBtn').onclick = downloadPreviewCsv;
  $('applyChangesBtn').onclick = applyPreviewChanges;
  $('downloadEditedBtn').onclick = downloadEditedWorkbook;
  $('openAdvancedFromPlcBtn').onclick = openAdvancedMode;
  $('openAdvancedFromReviewBtn').onclick = openAdvancedMode;
  $('modePlc').onchange = () => { state.mode = 'plc'; updateWorkflowState(); };
  $('modeAdvanced').onchange = openAdvancedMode;
  $('resetGpDatesBtn').onclick = resetDefaults;
  $('syncTemplateBtn').onclick = () => { syncTemplateFromState(); setNextStep('Planning template updated from Advanced Mode tables.'); };
  $('addBlockedDayBtn').onclick = () => { state.blockedDays.push({ name: 'Blocked Day', start: '2026-08-12', end: '2026-08-12' }); renderAdvancedTables(); markPreviewStale(); };
  $('addEventNoteBtn').onclick = () => { state.eventNotes.push({ name: 'Event Note', start: '2026-08-12', end: '2026-08-12' }); renderAdvancedTables(); markPreviewStale(); };
  $('exportBlockedDaysBtn').onclick = exportBlockedDays;
  $('addAdvUnitRowBtn').onclick = () => addUnitRow();
  $('moveAdvUnitUpBtn').onclick = () => moveSelectedUnit(-1);
  $('moveAdvUnitDownBtn').onclick = () => moveSelectedUnit(1);
  $('addUnusedToPreviousBtn').onclick = () => addUnusedDaysTo('previous');
  $('addUnusedToNextBtn').onclick = () => addUnusedDaysTo('next');
  $('distributeUnusedBtn').onclick = distributeUnusedDays;
  $('moveIssueNextGpBtn').onclick = moveIssueToNextGp;
  $('allowIssueCrossGpBtn').onclick = allowIssueCrossGp;
  $('reduceIssueUnitBtn').onclick = () => adjustIssueUnit(-1);
  $('increaseNearbyUnitBtn').onclick = () => adjustIssueUnit(1);
  $('copyBlankBtn').onclick = async () => { await navigator.clipboard.writeText(BLANK_TEMPLATE); setNextStep('Blank template copied to clipboard.'); };
  $('loadExampleBtn').onclick = () => { $('templateInput').value = EXAMPLE_TEMPLATE; setNextStep('Example template loaded. Import it into tables or edit it manually.'); };
  $('importTemplateBtn').onclick = importTemplateIntoTables;

  const nav = {
    wfPlcUploadBtn: 'plcUploadSection', wfPlcExtractBtn: 'plcUploadSection', wfPlcReviewBtn: 'plcUnitPlanSection', wfPlcPreviewBtn: 'previewSection', wfPlcApplyBtn: 'applySection', wfPlcDownloadBtn: 'applySection',
    wfAdvDiagnosticsBtn: 'advDiagnosticsSection', wfAdvSetupBtn: 'advSetupSection', wfAdvUnitsBtn: 'advUnitsSection', wfAdvFitBtn: 'advFitSection', wfAdvPreviewBtn: 'previewSection', wfAdvApplyDownloadBtn: 'applySection'
  };
  Object.entries(nav).forEach(([id, target]) => { $(id).onclick = () => scrollTo(target); });
}

renderExtractionSummary();
renderAdvancedTables();
syncTemplateFromState();
bindEvents();
updateWorkflowState();
