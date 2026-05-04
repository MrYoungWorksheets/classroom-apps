// Workbook structure constants (configurable)
const EXPECTED_SHEET_NAMES = ['1st 9 Weeks', '2nd 9 Weeks', '3rd 9 Weeks', '4th 9 Weeks'];
const GRADING_PERIOD_LABELS = ['1st', '2nd', '3rd', '4th'];
const DATE_COLUMNS = ['A', 'C', 'E', 'G', 'I'];
const NOTE_COLUMNS = ['B', 'D', 'F', 'H', 'J'];

const START_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } }; // light green
const END_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4CCCC' } };   // light red

const BLANK_TEMPLATE = `SCHOOL_YEAR:\n2026-2027\n\nCOURSE_NAME:\n\nSKIP_WEEKENDS:\nyes\n\nTERMS:\nFall Semester | YYYY-MM-DD | YYYY-MM-DD\nSpring Semester | YYYY-MM-DD | YYYY-MM-DD\n\nBLOCKED_DAYS:\nName | YYYY-MM-DD\nName | YYYY-MM-DD | YYYY-MM-DD\n\nEVENT_NOTES:\nName | YYYY-MM-DD\nName | YYYY-MM-DD | YYYY-MM-DD\n\nUNIT_PLAN:\nFall Semester | Unit Name | Number of Instructional Days\nSpring Semester | Unit Name | Number of Instructional Days\n`;

const EXAMPLE_TEMPLATE = `SCHOOL_YEAR:\n2026-2027\n\nCOURSE_NAME:\nAlgebra 2\n\nSKIP_WEEKENDS:\nyes\n\nTERMS:\nFall Semester | 2026-08-12 | 2026-12-14\nSpring Semester | 2027-01-06 | 2027-05-14\n\nBLOCKED_DAYS:\nLabor Day | 2026-09-07\nFlex Day PD / Student Holiday | 2026-10-09\nProfessional Development / Student Holiday | 2026-10-12\nFall Break | 2026-11-23 | 2026-11-27\nWinter Break | 2026-12-21 | 2027-01-03\nTeacher Workday / Student Holiday | 2027-01-04\nProfessional Development / Student Holiday | 2027-01-05\nStudent / Staff Holiday | 2027-01-18\nProfessional Development / Student Holiday | 2027-02-12\nFlex Day PD / Student Holiday | 2027-02-15\nSpring Break | 2027-03-08 | 2027-03-12\nHoliday | 2027-03-26\nProfessional Development / Student Holiday | 2027-04-30\nFinal Exams | 2027-05-17 | 2027-05-20\nProfessional Development / Student Holiday | 2027-05-21\n\nEVENT_NOTES:\nGrowth Pre-Test | 2026-08-24 | 2026-08-27\nGrowth Pre-Test Choir/Band | 2026-09-02 | 2026-09-04\nTSIA2 English | 2026-09-28\nTSIA2 Math | 2026-10-06\nPSAT | 2026-10-22\nCBE | 2026-10-27 | 2026-10-30\nEng I & II Interim | 2026-11-03\nAlg I Interim | 2026-11-19\nEOC Retakes | 2026-12-01 | 2026-12-10\nMidterms | 2026-12-15 | 2026-12-18\nCBE / ASVAB | 2027-01-19 | 2027-01-22\nEng I & II Interim | 2027-01-26 | 2027-01-27\nBio & US Hist Interim | 2027-02-10\nAlg I Interim | 2027-02-23\nTELPAS | 2027-03-02 | 2027-03-04\nTSIA2 English | 2027-03-18\nTSIA2 Math | 2027-03-25\nSAT Day for Juniors | 2027-03-30\nEnglish I & II EOC | 2027-04-08\nBio & US Hist EOC | 2027-04-15\nAlg I EOC | 2027-04-27\nGrowth Post Test | 2027-04-28 | 2027-05-03\nAP / IBC Testing Window | 2027-05-04 | 2027-05-14\n\nUNIT_PLAN:\nFall Semester | Unit 00 Fundamentals | 13\nFall Semester | Unit 01 Linear F(x) | 13\nFall Semester | Unit 02 Systems | 13\nFall Semester | Unit 03 Quadratics | 13\nFall Semester | Unit 04 Quadratics Pt 2 | 16\nFall Semester | Unit 04.5 | 11\nSpring Semester | Unit 05 Polynomials | 17\nSpring Semester | Unit 06 Rational Exponents / Radical Functions | 16\nSpring Semester | Unit 07 Exponential / Logarithms | 24\nSpring Semester | Unit 08 Rational Functions | 20\nSpring Semester | Unit 09 Regressions and Review | 7\n`;

const state = { workbook: null, workbookName: '', diagnostics: null, parsed: null, preview: null, applied: false, exportWarning: '' };
const $ = (id) => document.getElementById(id);


if (typeof ExcelJS === 'undefined') {
  state.exportWarning = 'Warning: this export method may not preserve original workbook formatting.';
  $('fileStatus').textContent = state.exportWarning;
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
};
$('loadExampleBtn').onclick = () => { $('templateInput').value = EXAMPLE_TEMPLATE; };

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
    $('downloadBtn').disabled = true;
    $('applyBtn').disabled = true;
    $('fileStatus').textContent = `Loaded: ${file.name}`;

    state.diagnostics = detectWorkbookDates(state.workbook, file.name);
    renderDiagnostics(state.diagnostics);
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

$('validateBtn').onclick = () => {
  const parsed = parseTemplate($('templateInput').value);
  state.parsed = parsed.ok ? parsed.data : null;
  if (!parsed.ok) {
    $('validationOutput').innerHTML = `<p class="error">Validation errors:</p><ul>${parsed.errors.map((e) => `<li>${e}</li>`).join('')}</ul>`;
  } else {
    if (state.workbook && state.diagnostics && state.diagnostics.totalDateCells === 0) {
      $('validationOutput').innerHTML = '<p class="error">Workbook loaded, but no usable date cells were detected. Check workbook diagnostics.</p>';
    } else {
      $('validationOutput').innerHTML = '<p class="ok">Template validation passed.</p>';
    }
  }
};

$('previewBtn').onclick = () => {
  if (!state.workbook || !state.diagnostics) {
    setError('No workbook uploaded. Upload a workbook before generating preview.');
    return;
  }
  const parsed = parseTemplate($('templateInput').value);
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

  const previewRows = [];
  for (const term of parsed.data.terms) {
    const termDays = dateRows.filter((d) => (
      d.date >= term.start &&
      d.date <= term.end &&
      (!parsed.data.skipWeekends || !isWeekend(d.date)) &&
      !blockedSet.has(d.date)
    ));

    const termUnits = parsed.data.units.filter((u) => u.termName === term.name);
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
      const startDate = slice[0].date;
      const endDate = slice[slice.length - 1].date;
      const eventHits = events.filter((ev) => slice.some((d) => ev.dates.has(d.date))).map((ev) => ev.name);
      previewRows.push({
        term: term.name,
        unit: unit.unitName,
        days: unit.days,
        startDate,
        endDate,
        skippedBlockedDays: 'Skipped globally based on BLOCKED_DAYS',
        eventWarnings: eventHits.join('; '),
        status: eventHits.length ? 'Scheduled with event-note warnings' : 'Scheduled'
      });
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

  state.parsed = parsed.data;
  state.preview = previewRows;
  renderPreview(previewRows);
  $('applyBtn').disabled = false;
};

function renderPreview(rows) {
  $('previewOutput').innerHTML = `<table><thead><tr>
    <th>Term</th><th>Unit Name</th><th>Instructional Days Required</th><th>Generated Start Date</th><th>Generated End Date</th>
    <th>Skipped Blocked Days Encountered</th><th>Event-Note Warnings Encountered</th><th>Status or Warning</th>
  </tr></thead><tbody>${rows.map((r) => `<tr><td>${r.term}</td><td>${r.unit}</td><td>${r.days}</td><td>${r.startDate}</td><td>${r.endDate}</td><td>${r.skippedBlockedDays}</td><td>${r.eventWarnings}</td><td>${r.status}</td></tr>`).join('')}</tbody></table>`;
}

$('applyBtn').onclick = () => {
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
  $('downloadBtn').disabled = false;
  $('applyStatus').textContent = `Applied changes in memory. START labels: ${startLabels}; END labels: ${endLabels}; Date cells colored: ${dateCellsColored}; Note cells updated: ${noteCellsTouched.size}. Use Download Edited Workbook to save a new file.`;
};

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

$('downloadBtn').onclick = async () => {
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
};

function setError(message) {
  $('validationOutput').innerHTML = `<p class="error">${message}</p>`;
}
