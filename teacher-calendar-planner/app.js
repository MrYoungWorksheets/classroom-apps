// Workbook structure constants (configurable)
const EXPECTED_SHEET_NAMES = ['1st 9 Weeks', '2nd 9 Weeks', '3rd 9 Weeks', '4th 9 Weeks'];
const GRADING_PERIOD_LABELS = ['1st', '2nd', '3rd', '4th'];
const DATE_COLUMNS = ['A', 'C', 'E', 'G', 'I'];
const NOTE_COLUMNS = ['B', 'D', 'F', 'H', 'J'];

const START_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // light green
const END_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4CCCC' } };   // light red

const BLANK_TEMPLATE = `SCHOOL_YEAR:\n2026-2027\n\nCOURSE_NAME:\n\nSKIP_WEEKENDS:\nyes\n\nTERMS:\nFall Semester | YYYY-MM-DD | YYYY-MM-DD\nSpring Semester | YYYY-MM-DD | YYYY-MM-DD\n\nBLOCKED_DAYS:\nName | YYYY-MM-DD\nName | YYYY-MM-DD | YYYY-MM-DD\n\nEVENT_NOTES:\nName | YYYY-MM-DD\nName | YYYY-MM-DD | YYYY-MM-DD\n\nUNIT_PLAN:\nFall Semester | Unit Name | Number of Instructional Days\nSpring Semester | Unit Name | Number of Instructional Days\n`;

const EXAMPLE_TEMPLATE = `SCHOOL_YEAR:\n2026-2027\n\nCOURSE_NAME:\nAlgebra 2\n\nSKIP_WEEKENDS:\nyes\n\nTERMS:\nFall Semester | 2026-08-12 | 2026-12-14\nSpring Semester | 2027-01-06 | 2027-05-14\n\nBLOCKED_DAYS:\nLabor Day | 2026-09-07\nFlex Day PD / Student Holiday | 2026-10-09\nProfessional Development / Student Holiday | 2026-10-12\nFall Break | 2026-11-23 | 2026-11-27\nWinter Break | 2026-12-21 | 2027-01-03\nTeacher Workday / Student Holiday | 2027-01-04\nProfessional Development / Student Holiday | 2027-01-05\nStudent / Staff Holiday | 2027-01-18\nProfessional Development / Student Holiday | 2027-02-12\nFlex Day PD / Student Holiday | 2027-02-15\nSpring Break | 2027-03-08 | 2027-03-12\nHoliday | 2027-03-26\nProfessional Development / Student Holiday | 2027-04-30\nFinal Exams | 2027-05-17 | 2027-05-20\nProfessional Development / Student Holiday | 2027-05-21\n\nEVENT_NOTES:\nGrowth Pre-Test | 2026-08-24 | 2026-08-27\nGrowth Pre-Test Choir/Band | 2026-09-02 | 2026-09-04\nTSIA2 English | 2026-09-28\nTSIA2 Math | 2026-10-06\nPSAT | 2026-10-22\nCBE | 2026-10-27 | 2026-10-30\nEng I & II Interim | 2026-11-03\nAlg I Interim | 2026-11-19\nEOC Retakes | 2026-12-01 | 2026-12-10\nMidterms | 2026-12-15 | 2026-12-18\nCBE / ASVAB | 2027-01-19 | 2027-01-22\nEng I & II Interim | 2027-01-26 | 2027-01-27\nBio & US Hist Interim | 2027-02-10\nAlg I Interim | 2027-02-23\nTELPAS | 2027-03-02 | 2027-03-04\nTSIA2 English | 2027-03-18\nTSIA2 Math | 2027-03-25\nSAT Day for Juniors | 2027-03-30\nEnglish I & II EOC | 2027-04-08\nBio & US Hist EOC | 2027-04-15\nAlg I EOC | 2027-04-27\nGrowth Post Test | 2027-04-28 | 2027-05-03\nAP / IBC Testing Window | 2027-05-04 | 2027-05-14\n\nUNIT_PLAN:\nFall Semester | Unit 00 Fundamentals | 13\nFall Semester | Unit 01 Linear F(x) | 13\nFall Semester | Unit 02 Systems | 13\nFall Semester | Unit 03 Quadratics | 13\nFall Semester | Unit 04 Quadratics Pt 2 | 16\nFall Semester | Unit 04.5 | 11\nSpring Semester | Unit 05 Polynomials | 17\nSpring Semester | Unit 06 Rational Exponents / Radical Functions | 16\nSpring Semester | Unit 07 Exponential / Logarithms | 24\nSpring Semester | Unit 08 Rational Functions | 20\nSpring Semester | Unit 09 Regressions and Review | 7\n`;

const state = { workbook: null, workbookName: '', diagnostics: null, parsed: null, preview: null, applied: false, exportWarning: '', templateLoaded: false, validationSucceeded: false, previewSucceeded: false, nextStep: 'Upload a workbook to begin.', mode: 'guided', guidedUnits: [], allowCrossTermGuided: true };
const $ = (id) => document.getElementById(id);


if (typeof ExcelJS === 'undefined') {
  state.exportWarning = 'Warning: this export method may not preserve original workbook formatting.';
  $('fileStatus').textContent = state.exportWarning;
}


function hasWorkbookWithDates() {
  return !!(state.workbook && state.diagnostics && state.diagnostics.totalDateCells > 0);
}

function setActionState(id, ready, reason = '') {
  const el = $(id);
  if (!el) return;
  el.disabled = false;
  el.dataset.ready = ready ? 'true' : 'false';
  el.setAttribute('aria-disabled', ready ? 'false' : 'true');
  el.title = ready ? '' : reason;
  el.classList.toggle('not-ready', !ready);
}

function updateWorkflowButtons() {
  const workbookLoaded = !!state.workbook;
  const workbookReady = hasWorkbookWithDates();
  const hasTemplate = !!($('templateInput').value || '').trim();
  const guidedValid = validateGuided(false).ok;
  const uploadReason = state.workbook ? 'Workbook loaded. Upload a different file if needed.' : 'Upload a calendar workbook to begin.';
  const courseReason = workbookReady ? 'Enter the course name and number of units.' : 'Upload a workbook with detected date cells first.';
  const unitReason = $('courseNameInput').value.trim() ? 'Fill in unit names and instructional days.' : 'Enter the course name and create a unit table first.';
  const guidedPreviewReason = !workbookLoaded
    ? 'Upload a calendar before generating preview.'
    : (!guidedValid ? 'Complete the course setup and unit table before generating preview.' : 'Generate the pacing preview.');
  const applyReason = state.previewSucceeded ? 'Apply the previewed changes to the workbook.' : 'Generate a successful preview before applying changes.';
  const downloadReason = state.applied ? 'Download the edited workbook.' : 'Apply changes before downloading the edited workbook.';
  const templateReason = workbookReady ? 'Paste or load a planning template.' : 'Upload a workbook with detected date cells first.';
  const validateReason = workbookLoaded && hasTemplate ? 'Validate the template.' : 'Upload a workbook and load or paste a template before validating.';
  const advancedPreviewReason = state.validationSucceeded ? 'Generate the pacing preview.' : 'Validate the template before generating preview.';

  setActionState('wfUploadBtn', true, uploadReason);
  setActionState('wfAdvUploadBtn', true, uploadReason);
  setActionState('wfCourseBtn', workbookReady, courseReason);
  setActionState('wfUnitBtn', !!$('courseNameInput').value.trim(), unitReason);
  setActionState('wfTemplateBtn', workbookReady, templateReason);
  setActionState('validateBtn', workbookLoaded && hasTemplate, validateReason);
  setActionState('validateTemplateInContextBtn', workbookLoaded && hasTemplate, validateReason);
  setActionState('previewBtn', state.mode === 'guided' && workbookLoaded && guidedValid, guidedPreviewReason);
  setActionState('generatePreviewFromUnitsBtn', state.mode === 'guided' && workbookLoaded && guidedValid, guidedPreviewReason);
  setActionState('advPreviewBtn', state.validationSucceeded, advancedPreviewReason);
  setActionState('generateTemplatePreviewBtn', state.validationSucceeded, advancedPreviewReason);
  setActionState('applyBtn', state.previewSucceeded, applyReason);
  setActionState('advApplyBtn', state.previewSucceeded, applyReason);
  setActionState('applyFromPreviewBtn', state.previewSucceeded, applyReason);
  setActionState('downloadBtn', state.applied, downloadReason);
  setActionState('advDownloadBtn', state.applied, downloadReason);
  setActionState('downloadFromApplyBtn', state.applied, downloadReason);
}

function setStepClass(id, stateName) {
  const el = $(id);
  if (!el) return;
  el.classList.remove('complete', 'current', 'warning', 'error');
  if (stateName) el.classList.add(stateName);
}

function updateWorkflowState() {
  const workbookReady = hasWorkbookWithDates();
  const hasTemplate = !!($('templateInput').value || '').trim();
  const hasCourse = !!$('courseNameInput').value.trim();
  const hasUnitRows = state.guidedUnits.length > 0;
  const guidedValid = validateGuided(false).ok;

  if (!state.workbook) {
    state.nextStep = 'Next: upload a calendar.';
  } else if (!workbookReady) {
    state.nextStep = 'Next: check workbook diagnostics because no date cells were detected.';
  } else if (state.applied) {
    state.nextStep = 'Next: download edited workbook.';
  } else if (state.previewSucceeded) {
    state.nextStep = 'Next: review preview and apply changes.';
  } else if (state.mode === 'guided') {
    if (!hasCourse) state.nextStep = 'Next: enter course name and create unit table.';
    else if (!hasUnitRows) state.nextStep = 'Next: enter number of units and create unit table.';
    else if (!guidedValid) state.nextStep = 'Next: fill in unit names and days.';
    else state.nextStep = 'Next: generate preview.';
  } else if (state.validationSucceeded) {
    state.nextStep = 'Next: generate preview.';
  } else if (hasTemplate) {
    state.nextStep = 'Next: validate template.';
  } else {
    state.nextStep = 'Next: load or paste a planning template.';
  }

  const uploadState = !state.workbook ? 'current' : (workbookReady ? 'complete' : 'error');
  setStepClass('wfUploadBtn', uploadState);
  setStepClass('wfAdvUploadBtn', uploadState);
  setStepClass('wfCourseBtn', hasCourse ? 'complete' : (workbookReady ? 'current' : ''));
  setStepClass('wfUnitBtn', guidedValid ? 'complete' : (hasUnitRows ? 'warning' : (hasCourse ? 'current' : '')));
  setStepClass('wfTemplateBtn', hasTemplate ? 'complete' : (workbookReady ? 'current' : ''));
  setStepClass('previewBtn', state.previewSucceeded ? 'complete' : (guidedValid && state.mode === 'guided' ? 'current' : ''));
  setStepClass('applyBtn', state.applied ? 'complete' : (state.previewSucceeded && state.mode === 'guided' ? 'current' : ''));
  setStepClass('downloadBtn', state.applied && state.mode === 'guided' ? 'current' : '');
  setStepClass('validateBtn', state.validationSucceeded ? 'complete' : (hasTemplate && state.mode === 'advanced' ? 'current' : ''));
  setStepClass('advPreviewBtn', state.previewSucceeded ? 'complete' : (state.validationSucceeded && state.mode === 'advanced' ? 'current' : ''));
  setStepClass('advApplyBtn', state.applied ? 'complete' : (state.previewSucceeded && state.mode === 'advanced' ? 'current' : ''));
  setStepClass('advDownloadBtn', state.applied && state.mode === 'advanced' ? 'current' : '');

  $('guidedWorkflowRow').classList.toggle('hidden', state.mode !== 'guided');
  $('advancedWorkflowRow').classList.toggle('hidden', state.mode !== 'advanced');
  $('guidedSection').classList.toggle('hidden', state.mode !== 'guided');
  $('advancedSection').classList.toggle('hidden', state.mode !== 'advanced');

  updateWorkflowButtons();
  renderStatusPanel();
}

function renderStatusPanel() {
  const nextStepMessage = $('nextStepMessage');
  if (nextStepMessage) nextStepMessage.textContent = state.nextStep;
  const d = state.diagnostics;
  const workbookLoaded = state.workbook ? 'Yes' : 'No';
  const sheetsMatched = d && d.missingSheets.length === 0 ? 'Yes' : 'No';
  const dateCellsDetected = d ? d.totalDateCells : 0;
  const firstDate = d?.firstDate || 'N/A';
  const lastDate = d?.lastDate || 'N/A';
  $('statusPanel').innerHTML = `
    <ul>
      <li><strong>Workbook loaded:</strong> ${workbookLoaded}</li>
      <li><strong>Sheets matched:</strong> ${d ? sheetsMatched : 'No'}</li>
      <li><strong>Date cells detected:</strong> ${dateCellsDetected}</li>
      <li><strong>First detected date:</strong> ${firstDate}</li>
      <li><strong>Last detected date:</strong> ${lastDate}</li>
      <li><strong>Next step:</strong> ${state.nextStep}</li>
    </ul>`;
}

function setNextStep(message) {
  state.nextStep = message;
  renderStatusPanel();
}

function scrollToSection(id) {
  const target = $(id);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function actionReady(id, fallbackMessage) {
  const el = $(id);
  if (!el || el.dataset.ready !== 'false') return true;
  const message = el.title || fallbackMessage;
  setNextStep(message);
  return false;
}

function handleUploadShortcut() {
  scrollToSection('uploadSection');
  setNextStep(state.workbook ? 'Upload a different workbook if needed, or continue to the next workflow step.' : 'Next: upload a calendar.');
}

function handleCourseShortcut() {
  if (!actionReady('wfCourseBtn', 'Upload a workbook with detected date cells first.')) return;
  scrollToSection('courseSetupSection');
}

function handleUnitShortcut() {
  if (!actionReady('wfUnitBtn', 'Enter the course name and create a unit table first.')) return;
  scrollToSection('unitListSection');
}

function handleTemplateShortcut() {
  if (!actionReady('wfTemplateBtn', 'Upload a workbook with detected date cells first.')) return;
  scrollToSection('templateSection');
}

function refreshWorkbookDiagnostics() {
  if (!state.workbook) {
    updateWorkflowState();
    return;
  }
  state.diagnostics = detectWorkbookDates(state.workbook, state.workbookName);
  renderDiagnostics(state.diagnostics);
  updateWorkflowState();
}

function isoDate(value) { return new Date(value).toISOString().slice(0, 10); }
function parseIso(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
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

function parseSchoolYearRange(schoolYear) {
  const m = String(schoolYear || '').trim().match(/^(\d{4})\s*-\s*(\d{4})$/);
  if (!m) return null;
  return { firstYear: Number(m[1]), secondYear: Number(m[2]) };
}

function inferSheetYear(sheetName) {
  const m = String(sheetName || '').match(/\b(19|20)\d{2}\b/);
  return m ? Number(m[0]) : null;
}

function inferSchoolYearForPeriod(periodLabel, schoolYear) {
  const parsed = parseSchoolYearRange(schoolYear);
  if (!parsed) return null;
  if (periodLabel === '1st' || periodLabel === '2nd') return parsed.firstYear;
  if (periodLabel === '3rd' || periodLabel === '4th') return parsed.secondYear;
  return null;
}

function readExcelDate(cell, context = {}) {
  if (!cell) return { ok: false };
  const rawValue = getCellRawValue(cell);
  if (rawValue instanceof Date && !Number.isNaN(rawValue.getTime())) {
    return { ok: true, iso: isoDate(rawValue), raw: rawValue, type: 'Date object' };
  }
  if (typeof rawValue === 'number') {
    const dt = excelSerialToDate(rawValue);
    if (dt) {
      return { ok: true, iso: isoDate(dt), raw: rawValue, type: 'Excel serial date' };
    }
  }
  if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    const mdOnly = trimmed.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (mdOnly) {
      const month = Number(mdOnly[1]);
      const day = Number(mdOnly[2]);
      const sheetYear = inferSheetYear(context.sheetName);
      const schoolYear = inferSchoolYearForPeriod(context.periodLabel, context.schoolYear);
      const inferredYear = sheetYear || schoolYear;
      if (!inferredYear) {
        return {
          ok: false,
          raw: rawValue,
          type: 'non-date',
          warning: `Unable to infer year for month/day text "${trimmed}" in ${context.sheetName || 'unknown sheet'} (${context.periodLabel || 'unknown period'}).`
        };
      }
      const dt = new Date(Date.UTC(inferredYear, month - 1, day));
      if (dt.getUTCFullYear() !== inferredYear || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
        return { ok: false, raw: rawValue, type: 'non-date' };
      }
      return {
        ok: true,
        iso: isoDate(dt),
        raw: rawValue,
        type: sheetYear ? 'date-like text with sheet-year inference' : 'date-like text with school-year inference'
      };
    }
    const directIso = parseIso(trimmed);
    if (directIso) return { ok: true, iso: isoDate(directIso), raw: rawValue, type: 'full date text' };
    const attempt = new Date(trimmed);
    if (!Number.isNaN(attempt.getTime())) return { ok: true, iso: isoDate(attempt), raw: rawValue, type: 'full date text' };
  }
  return { ok: false, raw: rawValue, type: 'non-date' };
}

function excelSerialToDate(serial) {
  if (!Number.isFinite(serial)) return null;
  const excelEpoch = Date.UTC(1899, 11, 30);
  const millis = Math.round(serial * 86400000);
  const dt = new Date(excelEpoch + millis);
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

function getMatchedSheets(sheetNames) {
  const taken = new Set();
  const matches = [];
  for (let i = 0; i < EXPECTED_SHEET_NAMES.length; i++) {
    const expectedName = EXPECTED_SHEET_NAMES[i];
    const periodLabel = GRADING_PERIOD_LABELS[i];
    let actualName = sheetNames.find((name) => name === expectedName);
    let matchType = 'exact';
    if (!actualName) {
      const pattern = new RegExp(`\\b${periodLabel}\\b`, 'i');
      actualName = sheetNames.find((name) => !taken.has(name) && pattern.test(name));
      matchType = actualName ? 'pattern' : 'missing';
    }
    if (actualName) taken.add(actualName);
    matches.push({ expectedName, periodLabel, actualName: actualName || null, matchType });
  }
  return matches;
}

$('copyBlankBtn').onclick = async () => {
  await navigator.clipboard.writeText(BLANK_TEMPLATE);
  refreshWorkbookDiagnostics();
    if (hasWorkbookWithDates()) setNextStep('Next: enter your course name and number of units.');
};
$('loadExampleBtn').onclick = () => { $('templateInput').value = EXAMPLE_TEMPLATE; state.templateLoaded = true; state.validationSucceeded = false; state.previewSucceeded = false; refreshWorkbookDiagnostics(); };
$('templateInput').addEventListener('input', () => { state.templateLoaded = !!$('templateInput').value.trim(); state.validationSucceeded = false; state.previewSucceeded = false; refreshWorkbookDiagnostics(); });

$('fileInput').onchange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) {
    if (!state.workbook) setError('No workbook selected. Please upload a .xlsx file.');
    return;
  }
  try {
    const buf = await file.arrayBuffer();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    state.workbook = wb;
    state.workbookName = file.name;
    state.applied = false;
    state.preview = null;
    state.validationSucceeded = false;
    state.previewSucceeded = false;
    $('fileStatus').textContent = `Loaded: ${file.name}`;

    refreshWorkbookDiagnostics();
  } catch (err) {
    setError(`Failed to read workbook: ${err.message}`);
  }
};

function detectWorkbookDates(workbook, workbookName) {
  const templateSchoolYear = parseTemplate($('templateInput')?.value || '').data?.schoolYear || '';
  const diagnostics = {
    workbookName,
    sheetNames: workbook.worksheets.map((ws) => ws.name),
    missingSheets: [],
    perSheet: {},
    totalDateCells: 0,
    firstDate: null,
    lastDate: null,
    allAddresses: [],
    skipped: [],
    warnings: [],
    matchedSheets: []
  };

  diagnostics.matchedSheets = getMatchedSheets(diagnostics.sheetNames);
  diagnostics.missingSheets = diagnostics.matchedSheets.filter((m) => !m.actualName).map((m) => m.expectedName);
  if (diagnostics.missingSheets.length > 0) {
    diagnostics.warnings.push(`Missing expected sheets: ${diagnostics.missingSheets.join(', ')}`);
  }

  for (const match of diagnostics.matchedSheets) {
    const sheetKey = `${match.expectedName} (${match.periodLabel})`;
    const ws = match.actualName ? workbook.getWorksheet(match.actualName) : null;
    if (!ws) {
      diagnostics.perSheet[sheetKey] = [];
      continue;
    }

    if (!ws.actualRowCount) {
      diagnostics.skipped.push(`${match.actualName}: empty worksheet range`);
      diagnostics.perSheet[sheetKey] = [];
      continue;
    }
    const matches = [];
    const endRow = ws.actualRowCount || ws.rowCount;
    for (let r = 1; r <= endRow; r++) {
      for (let i = 0; i < DATE_COLUMNS.length; i++) {
        const dateAddr = `${DATE_COLUMNS[i]}${r}`;
        const noteAddr = `${NOTE_COLUMNS[i]}${r}`;
        const cell = ws.getCell(dateAddr);
        if (cell.value == null || cell.value === '') continue;

        const parsed = readExcelDate(cell, { sheetName: match.actualName, periodLabel: match.periodLabel, schoolYear: templateSchoolYear });
        if (!parsed.ok) {
          if (parsed.warning) diagnostics.warnings.push(parsed.warning);
          continue;
        }

        matches.push({
          sheetName: match.actualName,
          matchedPeriod: match.periodLabel,
          row: r,
          dateAddr,
          noteAddr,
          date: parsed.iso,
          rawValue: String(parsed.raw),
          interpretedAs: parsed.type
        });
        diagnostics.totalDateCells += 1;
        diagnostics.allAddresses.push(`${match.actualName}!${dateAddr}`);
        if (!diagnostics.firstDate || parsed.iso < diagnostics.firstDate) diagnostics.firstDate = parsed.iso;
        if (!diagnostics.lastDate || parsed.iso > diagnostics.lastDate) diagnostics.lastDate = parsed.iso;
      }
    }

    diagnostics.perSheet[sheetKey] = matches;
    if (!matches.length) diagnostics.warnings.push(`No date cells detected in ${match.actualName} (matched ${match.periodLabel}) for date columns ${DATE_COLUMNS.join(', ')}`);
  }

  if (!diagnostics.totalDateCells) diagnostics.warnings.push('No date cells were detected in expected sheets/columns.');
  return diagnostics;
}

function renderDiagnostics(diagnostics) {
  const expectedFound = diagnostics.missingSheets.length === 0;
  const detailRows = Object.values(diagnostics.perSheet).flat().slice(0, 200);

  $('diagnostics').innerHTML = `
    <ul>
      <li><strong>Workbook name:</strong> ${diagnostics.workbookName}</li>
      <li><strong>Sheet names found:</strong> ${diagnostics.sheetNames.join(', ') || 'None'}</li>
      <li><strong>Expected sheets found:</strong> ${expectedFound ? 'Yes' : 'No'}</li>
      <li><strong>Sheet matching:</strong> ${diagnostics.matchedSheets.map((m) => `${m.expectedName} (${m.periodLabel}) → ${m.actualName || 'Not found'} [${m.matchType}]`).join(' | ')}</li>
      <li><strong>Date cells detected per sheet:</strong> ${Object.entries(diagnostics.perSheet).map(([s, arr]) => `${s}: ${arr.length}`).join(' | ')}</li>
      <li><strong>Total date cells detected:</strong> ${diagnostics.totalDateCells}</li>
      <li><strong>First detected date:</strong> ${diagnostics.firstDate || 'N/A'}</li>
      <li><strong>Last detected date:</strong> ${diagnostics.lastDate || 'N/A'}</li>
      <li><strong>Detected date addresses:</strong> ${diagnostics.allAddresses.join(', ') || 'None'}</li>
      <li><strong>Rows/columns skipped:</strong> ${diagnostics.skipped.join('; ') || 'None'}</li>
      <li><strong>Warnings:</strong> ${diagnostics.warnings.join('; ') || 'None'}</li>
    </ul>
    <p><strong>Detection details (first 200): raw value → interpreted date, with paired note cell</strong></p>
    <table><thead><tr><th>Sheet</th><th>Matched Period</th><th>Date Cell</th><th>Note Cell</th><th>Raw Value</th><th>Interpreted Date</th><th>Parse Type</th></tr></thead>
    <tbody>${detailRows.map(x => `<tr><td>${x.sheetName}</td><td>${x.matchedPeriod}</td><td>${x.dateAddr}</td><td>${x.noteAddr}</td><td>${x.rawValue}</td><td>${x.date}</td><td>${x.interpretedAs}</td></tr>`).join('')}</tbody></table>`;
}

function parseTemplate(text) {
  const lines = text.split(/\r?\n/);
  const errors = [];
  const data = { terms: [], blocked: [], events: [], units: [], schoolYear: '', courseName: '', skipWeekends: true };
  let section = '';

  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) return;
    if (line.endsWith(':')) {
      section = line.slice(0, -1).trim().toUpperCase();
      return;
    }

    const lineNo = idx + 1;
    const parts = line.split('|').map((p) => p.trim());

    if (section === 'SCHOOL_YEAR') data.schoolYear = line;
    else if (section === 'COURSE_NAME') data.courseName = line;
    else if (section === 'SKIP_WEEKENDS') data.skipWeekends = line.toLowerCase() === 'yes';
    else if (section === 'TERMS') {
      if (parts.length !== 3) {
        errors.push(`Line ${lineNo}: TERMS must be "Term Name | YYYY-MM-DD | YYYY-MM-DD".`);
      } else {
        const [name, start, end] = parts;
        if (!parseIso(start) || !parseIso(end)) errors.push(`Line ${lineNo}: malformed term date(s).`);
        else if (start > end) errors.push(`Line ${lineNo}: term start date must be <= end date.`);
        else data.terms.push({ name, start, end });
      }
    } else if (section === 'BLOCKED_DAYS' || section === 'EVENT_NOTES') {
      if (parts.length !== 2 && parts.length !== 3) {
        errors.push(`Line ${lineNo}: ${section} must be "Name | Date" or "Name | Start | End".`);
      } else {
        const [name, start, endRaw] = parts;
        const end = endRaw || start;
        if (!parseIso(start) || !parseIso(end)) errors.push(`Line ${lineNo}: malformed date(s) in ${section}.`);
        else if (start > end) errors.push(`Line ${lineNo}: start date must be <= end date in ${section}.`);
        else (section === 'BLOCKED_DAYS' ? data.blocked : data.events).push({ name, start, end });
      }
    } else if (section === 'UNIT_PLAN') {
      if (parts.length !== 3) {
        errors.push(`Line ${lineNo}: UNIT_PLAN must be "Term Name | Unit Name | Number".`);
      } else {
        const [termName, unitName, dayStr] = parts;
        const days = Number(dayStr);
        if (!Number.isInteger(days) || days <= 0) errors.push(`Line ${lineNo}: instructional days must be a positive integer.`);
        else data.units.push({ termName, unitName, days });
      }
    } else {
      errors.push(`Line ${lineNo}: text appears outside a known section header.`);
    }
  });

  if (!data.terms.length) errors.push('No TERMS entries found.');
  if (!data.units.length) errors.push('No UNIT_PLAN entries found.');
  const termNames = new Set(data.terms.map((t) => t.name));
  const badUnits = data.units.filter((u) => !termNames.has(u.termName));
  if (badUnits.length) errors.push(`UNIT_PLAN term mismatch: ${badUnits.map((u) => `${u.termName} (${u.unitName})`).join(', ')}`);

  return { ok: errors.length === 0, errors, data };
}

function validateTemplate() {
  const parsed = parseTemplate($('templateInput').value);
  state.parsed = parsed.ok ? parsed.data : null;
  state.validationSucceeded = false;
  state.previewSucceeded = false;
  if (!parsed.ok) {
    $('validationOutput').innerHTML = `<p class="error">Validation errors:</p><ul>${parsed.errors.map((e) => `<li>${e}</li>`).join('')}</ul>`;
  } else {
    if (state.workbook && state.diagnostics && state.diagnostics.totalDateCells === 0) {
      $('validationOutput').innerHTML = '<p class="error">Workbook loaded, but no usable date cells were detected. Check workbook diagnostics.</p>';
    } else {
      $('validationOutput').innerHTML = '<p class="ok">Template validation passed.</p>';
      state.validationSucceeded = true;
    }
  }
  updateWorkflowState();
}


function makeInstructionalDayFilter(parsed, blockedSet) {
  return (d) => (!parsed.skipWeekends || !isWeekend(d.date)) && !blockedSet.has(d.date);
}

function countDatesInRange(range) {
  return datesInRange(range.start, range.end).length;
}

function isCrossedRange(startDate, endDate, range) {
  return startDate && endDate && startDate < range.start && endDate > range.end;
}

function findTermByDate(terms, date) {
  return terms.find((t) => date >= t.start && date <= t.end) || null;
}

function boundaryWarningsForUnit(unit, startDate, endDate, parsed) {
  const warnings = [];
  const preferredTerm = parsed.terms.find((t) => t.name === unit.termName);
  if (preferredTerm && startDate <= preferredTerm.end && endDate > preferredTerm.end) {
    warnings.push(`Crosses ${preferredTerm.name} boundary`);
    warnings.push('Scheduled across term boundary; review pacing');
  }

  const startTerm = findTermByDate(parsed.terms, startDate);
  const endTerm = findTermByDate(parsed.terms, endDate);
  if (startTerm && endTerm && startTerm.name !== endTerm.name) {
    warnings.push(`Crosses ${startTerm.name} boundary`);
    warnings.push('Scheduled across term boundary; review pacing');
  }
  for (const term of parsed.terms) {
    if (startDate < term.start && endDate >= term.start) {
      warnings.push(`Crosses ${term.name} boundary`);
      warnings.push('Scheduled across term boundary; review pacing');
    }
  }

  for (const blocked of parsed.blocked) {
    if (!isCrossedRange(startDate, endDate, blocked)) continue;
    const lowerName = blocked.name.toLowerCase();
    if (lowerName.includes('winter break')) warnings.push('Crosses Winter Break');
    else if (lowerName.includes('spring break')) warnings.push('Crosses Spring Break');
    else if (countDatesInRange(blocked) >= 5) warnings.push(`Crosses ${blocked.name}`);
  }

  return [...new Set(warnings)];
}

function blockedRangesEncountered(startDate, endDate, parsed) {
  return parsed.blocked
    .filter((b) => startDate && endDate && b.start <= endDate && b.end >= startDate)
    .map((b) => b.name);
}

function createScheduledPreviewRow({ termName, unit, days, slice, events, parsed, statusPrefix = 'Scheduled' }) {
  const startDate = slice[0].date;
  const endDate = slice[slice.length - 1].date;
  const eventHits = events.filter((ev) => slice.some((d) => ev.dates.has(d.date))).map((ev) => ev.name);
  const crossingWarnings = boundaryWarningsForUnit(unit, startDate, endDate, parsed);
  const blockedHits = blockedRangesEncountered(startDate, endDate, parsed);
  const statusMessages = [];
  if (eventHits.length) statusMessages.push('Scheduled with event-note warnings');
  else statusMessages.push(statusPrefix);
  statusMessages.push(...crossingWarnings);

  return {
    term: termName,
    unit: unit.unitName,
    days,
    startDate,
    endDate,
    skippedBlockedDays: blockedHits.length ? `Skipped: ${blockedHits.join('; ')}` : 'Skipped globally based on BLOCKED_DAYS',
    eventWarnings: eventHits.join('; '),
    status: [...new Set(statusMessages)].join('; ')
  };
}

function buildStrictTermPreview(parsed, dateRows, blockedSet, events) {
  const previewRows = [];
  for (const term of parsed.terms) {
    const termDays = dateRows.filter((d) => (
      d.date >= term.start &&
      d.date <= term.end &&
      makeInstructionalDayFilter(parsed, blockedSet)(d)
    ));

    const termUnits = parsed.units.filter((u) => u.termName === term.name);
    let cursor = 0;

    for (const unit of termUnits) {
      if (cursor + unit.days > termDays.length) {
        previewRows.push({
          term: term.name,
          unit: unit.unitName,
          days: unit.days,
          startDate: 'N/A',
          endDate: 'N/A',
          skippedBlockedDays: 'N/A',
          eventWarnings: '',
          status: 'Not enough instructional days in term'
        });
        continue;
      }

      const slice = termDays.slice(cursor, cursor + unit.days);
      cursor += unit.days;
      previewRows.push(createScheduledPreviewRow({ termName: term.name, unit, days: unit.days, slice, events, parsed }));
    }

    if (cursor < termDays.length) {
      previewRows.push({
        term: term.name,
        unit: '(unused term capacity)',
        days: termDays.length - cursor,
        startDate: '',
        endDate: '',
        skippedBlockedDays: '',
        eventWarnings: '',
        status: 'Unused instructional days remain'
      });
    }
  }
  return { rows: previewRows, okToApply: !previewRows.some((r) => r.startDate === 'N/A' || r.endDate === 'N/A') };
}

function buildFlexibleCrossTermPreview(parsed, dateRows, blockedSet, events) {
  const instructionalDays = dateRows.filter(makeInstructionalDayFilter(parsed, blockedSet));
  const previewRows = [];
  let cursor = 0;

  for (const unit of parsed.units) {
    const preferredTerm = parsed.terms.find((t) => t.name === unit.termName);
    const earliestStart = preferredTerm ? preferredTerm.start : dateRows[0].date;
    while (cursor < instructionalDays.length && instructionalDays[cursor].date < earliestStart) cursor += 1;

    if (cursor + unit.days > instructionalDays.length) {
      const remaining = Math.max(0, instructionalDays.length - cursor);
      previewRows.push({
        term: unit.termName,
        unit: unit.unitName,
        days: unit.days,
        startDate: remaining ? instructionalDays[cursor].date : 'N/A',
        endDate: 'N/A',
        skippedBlockedDays: 'N/A',
        eventWarnings: '',
        status: `Not enough instructional days remain in the detected school year (${remaining} available, ${unit.days} required). Apply Changes disabled.`
      });
      return { rows: previewRows, okToApply: false };
    }

    const slice = instructionalDays.slice(cursor, cursor + unit.days);
    cursor += unit.days;
    previewRows.push(createScheduledPreviewRow({ termName: unit.termName, unit, days: unit.days, slice, events, parsed }));
  }

  if (cursor < instructionalDays.length) {
    previewRows.push({
      term: 'School Year',
      unit: '(remaining year capacity)',
      days: instructionalDays.length - cursor,
      startDate: '',
      endDate: '',
      skippedBlockedDays: '',
      eventWarnings: '',
      status: 'Available instructional days remain after all units are scheduled'
    });
  }

  return { rows: previewRows, okToApply: true };
}

function generateAdvancedPreview() {
  if (!state.workbook || !state.diagnostics) {
    setError('No workbook uploaded. Upload a workbook before generating preview.');
    return;
  }
  const parsed = parseTemplate($('templateInput').value);
  state.previewSucceeded = false;
  if (!parsed.ok) {
    $('validationOutput').innerHTML = `<p class="error">Fix template errors first.</p><ul>${parsed.errors.map((e) => `<li>${e}</li>`).join('')}</ul>`;
    return;
  }
  if (state.diagnostics.missingSheets.length) {
    $('previewOutput').innerHTML = `<p class="error">Expected sheets missing: ${state.diagnostics.missingSheets.join(', ')}</p>`;
    return;
  }

  const dateRows = Object.values(state.diagnostics.perSheet).flat().sort((a, b) => a.date.localeCompare(b.date));
  if (!dateRows.length) {
    $('previewOutput').innerHTML = '<p class="error">No date cells detected in expected sheets/columns. Cannot schedule safely.</p>';
    return;
  }

  const blockedSet = new Set(parsed.data.blocked.flatMap((b) => datesInRange(b.start, b.end)));
  const events = parsed.data.events.map((e) => ({ name: e.name, dates: new Set(datesInRange(e.start, e.end)) }));
  const useFlexibleCrossTermScheduling = state.mode === 'guided' && state.allowCrossTermGuided;
  const previewResult = useFlexibleCrossTermScheduling
    ? buildFlexibleCrossTermPreview(parsed.data, dateRows, blockedSet, events)
    : buildStrictTermPreview(parsed.data, dateRows, blockedSet, events);

  state.parsed = parsed.data;
  state.preview = previewResult.rows;
  state.previewSucceeded = previewResult.okToApply;
  renderPreview(previewResult.rows);
  updateWorkflowState();
}

function renderPreview(rows) {
  $('previewOutput').innerHTML = `<table><thead><tr>
    <th>Term</th><th>Unit Name</th><th>Instructional Days Required</th><th>Generated Start Date</th><th>Generated End Date</th>
    <th>Skipped Blocked Days Encountered</th><th>Event-Note Warnings Encountered</th><th>Status or Warning</th>
  </tr></thead><tbody>${rows.map((r) => `<tr><td>${r.term}</td><td>${r.unit}</td><td>${r.days}</td><td>${r.startDate}</td><td>${r.endDate}</td><td>${r.skippedBlockedDays}</td><td>${r.eventWarnings}</td><td>${r.status}</td></tr>`).join('')}</tbody></table>`;
}

function applyPreviewChanges() {
  if (!state.workbook || !state.preview || !state.diagnostics) {
    setError('Cannot apply changes: generate a preview first.');
    return;
  }

  const byDate = new Map();
  for (const row of Object.values(state.diagnostics.perSheet).flat()) {
    byDate.set(row.date, row);
  }

  let startLabels = 0;
  let endLabels = 0;
  let dateCellsColored = 0;
  const noteCellsTouched = new Set();

  for (const item of state.preview) {
    if (!item.startDate || item.startDate === 'N/A' || !item.endDate || item.endDate === 'N/A') continue;
    const start = byDate.get(item.startDate);
    const end = byDate.get(item.endDate);
    if (!start || !end) continue;

    const startWs = state.workbook.getWorksheet(start.sheetName);
    const endWs = state.workbook.getWorksheet(end.sheetName);
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
  $('applyStatus').textContent = `Applied changes in memory. START labels: ${startLabels}; END labels: ${endLabels}; Date cells colored: ${dateCellsColored}; Note cells updated: ${noteCellsTouched.size}. Use Download Edited Workbook to save a new file.`;
  updateWorkflowState();
}

function appendNote(ws, addr, text) {
  const cell = ws.getCell(addr);
  const existing = String(getCellRawValue(cell) || '').replace(/\s+$/g, '');
  cell.value = existing ? `${existing}\n\n${text}` : text;
  cell.alignment = { ...(cell.alignment || {}), wrapText: true };
}
function colorDateCell(ws, addr, fill) {
  const cell = ws.getCell(addr);
  cell.fill = { ...fill };
}

async function downloadEditedWorkbook() {
  if (!state.workbook || !state.applied) {
    setError('No applied changes to export.');
    return;
  }
  try {
    const outputName = state.workbookName.replace(/\.(xlsx|xlsm|xls)$/i, '') + '-paced.xlsx';
    const buf = await state.workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch (err) {
    setError(`Export failed: ${err.message}`);
  }
}


function getDefaultTemplateFromGuided() {
  const courseName = $('courseNameInput').value.trim();
  const unitLines = state.guidedUnits.map((u) => `${u.termName} | ${u.unitName} | ${u.days}`).join('\n');
  return `SCHOOL_YEAR:
2026-2027

COURSE_NAME:
${courseName}

SKIP_WEEKENDS:
yes

TERMS:
Fall Semester | 2026-08-12 | 2026-12-14
Spring Semester | 2027-01-06 | 2027-05-14

BLOCKED_DAYS:
Labor Day | 2026-09-07
Flex Day PD / Student Holiday | 2026-10-09
Professional Development / Student Holiday | 2026-10-12
Fall Break | 2026-11-23 | 2026-11-27
Winter Break | 2026-12-21 | 2027-01-03
Teacher Workday / Student Holiday | 2027-01-04
Professional Development / Student Holiday | 2027-01-05
Student / Staff Holiday | 2027-01-18
Professional Development / Student Holiday | 2027-02-12
Flex Day PD / Student Holiday | 2027-02-15
Spring Break | 2027-03-08 | 2027-03-12
Holiday | 2027-03-26
Professional Development / Student Holiday | 2027-04-30
Final Exams | 2027-05-17 | 2027-05-20
Professional Development / Student Holiday | 2027-05-21

EVENT_NOTES:
Growth Pre-Test | 2026-08-24 | 2026-08-27
Growth Pre-Test Choir/Band | 2026-09-02 | 2026-09-04
TSIA2 English | 2026-09-28
TSIA2 Math | 2026-10-06
PSAT | 2026-10-22
CBE | 2026-10-27 | 2026-10-30
Eng I & II Interim | 2026-11-03
Alg I Interim | 2026-11-19
EOC Retakes | 2026-12-01 | 2026-12-10
Midterms | 2026-12-15 | 2026-12-18
CBE / ASVAB | 2027-01-19 | 2027-01-22
Eng I & II Interim | 2027-01-26 | 2027-01-27
Bio & US Hist Interim | 2027-02-10
Alg I Interim | 2027-02-23
TELPAS | 2027-03-02 | 2027-03-04
TSIA2 English | 2027-03-18
TSIA2 Math | 2027-03-25
SAT Day for Juniors | 2027-03-30
English I & II EOC | 2027-04-08
Bio & US Hist EOC | 2027-04-15
Alg I EOC | 2027-04-27
Growth Post Test | 2027-04-28 | 2027-05-03
AP / IBC Testing Window | 2027-05-04 | 2027-05-14

UNIT_PLAN:
${unitLines}
`;
}
function validateGuided(render=true){
 const errors=[];
 if(!$('courseNameInput').value.trim()) errors.push('Course name is required.');
 if(state.guidedUnits.length<1) errors.push('Number of units must be at least 1.');
 state.guidedUnits.forEach((u,i)=>{ if(!u.unitName.trim()) errors.push(`Row ${i+1}: unit name is required.`); if(!Number.isInteger(Number(u.days))||Number(u.days)<=0) errors.push(`Row ${i+1}: instructional days must be greater than 0.`); if(!['Fall Semester','Spring Semester'].includes(u.termName)) errors.push(`Row ${i+1}: valid term is required.`);});
 if(render){$('validationOutput').innerHTML = errors.length ? `<p class="error">Guided validation errors:</p><ul>${errors.map(e=>`<li>${e}</li>`).join('')}</ul>` : '<p class="ok">Guided unit table is valid. Next: generate preview.</p>'; }
 return {ok:!errors.length,errors};
}
function renderUnitTable(){
 if(!state.guidedUnits.length){$('unitTableOutput').textContent='Create a unit table to begin.';return;}
 $('unitTableOutput').innerHTML = `<table><thead><tr><th>Unit #</th><th>Term</th><th>Unit Name</th><th>Instructional Days</th></tr></thead><tbody>${state.guidedUnits.map((u,i)=>`<tr><td>${i+1}</td><td><select data-i="${i}" data-k="termName"><option ${u.termName==='Fall Semester'?'selected':''}>Fall Semester</option><option ${u.termName==='Spring Semester'?'selected':''}>Spring Semester</option></select></td><td><input data-i="${i}" data-k="unitName" value="${u.unitName.replace(/"/g,'&quot;')}" /></td><td><input type="number" min="1" data-i="${i}" data-k="days" value="${u.days}" /></td></tr>`).join('')}</tbody></table>`;
 $('unitTableOutput').querySelectorAll('input,select').forEach(el=>el.addEventListener('input',e=>{const i=Number(e.target.dataset.i); const k=e.target.dataset.k; state.guidedUnits[i][k]=k==='days'?Number(e.target.value):e.target.value; validateGuided(); updateWorkflowState();}));
 validateGuided();
 updateWorkflowState();
}
$('modeGuided').onchange=()=>{state.mode='guided'; updateWorkflowState();};
$('modeAdvanced').onchange=()=>{state.mode='advanced'; updateWorkflowState();};
$('createUnitTableBtn').onclick=()=>{const n=Number($('unitCountInput').value); if(!Number.isInteger(n)||n<1){$('validationOutput').innerHTML='<p class="error">Number of units must be at least 1.</p>';return;} state.guidedUnits=[]; for(let i=0;i<n;i++){state.guidedUnits.push({termName:i<Math.ceil(n/2)?'Fall Semester':'Spring Semester',unitName:'',days:1});} renderUnitTable(); setNextStep('Next: fill in each unit name and instructional day count.');};
$('addUnitRowBtn').onclick=()=>{state.guidedUnits.push({termName:'Spring Semester',unitName:'',days:1}); renderUnitTable();};
$('removeUnitRowBtn').onclick=()=>{state.guidedUnits.pop(); renderUnitTable();};
$('clearUnitTableBtn').onclick=()=>{state.guidedUnits=[]; renderUnitTable();};
function generateGuidedPreview(){ if(!actionReady('previewBtn', 'Complete the course setup and unit table before generating preview.')) return; if(!state.workbook||!state.diagnostics){setError('No workbook uploaded. Upload a workbook before generating preview.'); return;} const v=validateGuided(true); if(!v.ok) return; $('templateInput').value=getDefaultTemplateFromGuided(); const parsed=parseTemplate($('templateInput').value); state.validationSucceeded=true; state.previewSucceeded=false; if(!parsed.ok){ setError('Internal guided template generation failed.'); return;} generateAdvancedPreview(); scrollToSection('previewSection'); setNextStep('Next: review preview and apply changes.');}
function handleApplyChanges(){ if(!actionReady(state.mode === 'advanced' ? 'advApplyBtn' : 'applyBtn', 'Generate a successful preview before applying changes.')) return; applyPreviewChanges(); if(state.applied){ scrollToSection('applySection'); setNextStep('Next: download edited workbook.'); }}
async function handleDownloadWorkbook(){ if(!actionReady(state.mode === 'advanced' ? 'advDownloadBtn' : 'downloadBtn', 'Apply changes before downloading the edited workbook.')) return; await downloadEditedWorkbook();}
function handleValidateTemplate() {
  if (!actionReady('validateBtn', 'Upload a workbook and load or paste a template before validating.')) return;
  validateTemplate();
  scrollToSection('validationSection');
}

function handleAdvancedPreview() {
  if (!actionReady('advPreviewBtn', 'Validate the template before generating preview.')) return;
  generateAdvancedPreview();
  scrollToSection('previewSection');
}

$('wfUploadBtn').onclick = handleUploadShortcut;
$('wfAdvUploadBtn').onclick = handleUploadShortcut;
$('wfCourseBtn').onclick = handleCourseShortcut;
$('wfUnitBtn').onclick = handleUnitShortcut;
$('wfTemplateBtn').onclick = handleTemplateShortcut;
$('validateBtn').onclick = handleValidateTemplate;
$('validateTemplateInContextBtn').onclick = handleValidateTemplate;
$('previewBtn').onclick = generateGuidedPreview;
$('generatePreviewFromUnitsBtn').onclick = generateGuidedPreview;
$('advPreviewBtn').onclick = handleAdvancedPreview;
$('generateTemplatePreviewBtn').onclick = handleAdvancedPreview;
$('applyBtn').onclick = handleApplyChanges;
$('advApplyBtn').onclick = handleApplyChanges;
$('applyFromPreviewBtn').onclick = handleApplyChanges;
$('downloadBtn').onclick = handleDownloadWorkbook;
$('advDownloadBtn').onclick = handleDownloadWorkbook;
$('downloadFromApplyBtn').onclick = handleDownloadWorkbook;
$('validateUnitsBtn').onclick = () => {
  validateGuided(true);
  scrollToSection('validationSection');
  updateWorkflowState();
};

$('courseNameInput').addEventListener('input',()=>{updateWorkflowState();});
$('unitCountInput').addEventListener('input',()=>{updateWorkflowState();});
$('allowCrossTermInput').addEventListener('change',()=>{state.allowCrossTermGuided=$('allowCrossTermInput').checked; state.previewSucceeded=false; state.applied=false; updateWorkflowState();});

function setError(message) {
  $('validationOutput').innerHTML = `<p class="error">${message}</p>`;
}


updateWorkflowState();
