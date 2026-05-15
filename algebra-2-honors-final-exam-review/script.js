(function () {
  const STORAGE_KEY = 'algebra2HonorsFinalReviewProgressV1';
  const ASSIGNMENT_TITLE = 'Algebra 2 Honors Final Exam Review';
  const problems = window.FINAL_REVIEW_PROBLEMS || [];
  const graphFieldDefinitions = window.FINAL_REVIEW_GRAPH_FIELDS || {};
  const solutions = window.FINAL_REVIEW_SOLUTIONS || {};

  const state = {
    studentName: '',
    classPeriod: '',
    responses: {}
  };

  let calculator = null;
  let pendingExpression = '';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function defaultProblemState() {
    return { answer: null, status: 'Not Started', attempts: 0, hintUsed: false, skipped: false, revealed: false, feedback: '' };
  }

  function getProblemState(id) {
    if (!state.responses[id]) state.responses[id] = defaultProblemState();
    return state.responses[id];
  }

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadProgress() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      state.studentName = saved.studentName || '';
      state.classPeriod = saved.classPeriod || '';
      state.responses = saved.responses || {};
    } catch (error) {
      console.warn('Saved progress could not be restored.', error);
    }
  }

  function statusClass(status) {
    return String(status || 'Not Started').toLowerCase().replace(/\s+/g, '-');
  }

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '').replace(/−/g, '-');
  }

  function parseNumber(value) {
    const cleaned = normalizeText(value);
    if (!cleaned) return NaN;
    if (/^-?\d+(\.\d+)?\/-?\d+(\.\d+)?$/.test(cleaned)) {
      const [num, den] = cleaned.split('/').map(Number);
      return den === 0 ? NaN : num / den;
    }
    if (/^sqrt\(.+\)$/.test(cleaned)) return NaN;
    return Number(cleaned);
  }

  function numbersClose(a, b, tolerance = 0.001) {
    return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance;
  }

  function splitSet(value) {
    return String(value || '')
      .replace(/[{}]/g, '')
      .split(/,|;/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function pointFromText(value) {
    const cleaned = String(value || '').trim().replace(/[()]/g, '').replace(/\s+/g, '');
    const parts = cleaned.split(',');
    if (parts.length !== 2) return null;
    const x = parseNumber(parts[0]);
    const y = parseNumber(parts[1]);
    return Number.isFinite(x) && Number.isFinite(y) ? [x, y] : null;
  }

  function slopeMatches(value, expected) {
    const typed = parseNumber(value);
    const correct = parseNumber(expected);
    return numbersClose(typed, correct);
  }

  function answerMatches(problem, response) {
    if (problem.answerType === 'numeric') {
      const value = parseNumber(response);
      const accepted = (problem.accepted || []).some((item) => numbersClose(value, parseNumber(item)) || normalizeText(response) === normalizeText(item));
      return accepted || numbersClose(value, Number(problem.correctAnswer));
    }

    if (problem.answerType === 'expression') {
      return normalizeText(response) === normalizeText(problem.correctAnswer) || (problem.accepted || []).some((item) => normalizeText(response) === normalizeText(item));
    }

    if (problem.answerType === 'expressionSet') {
      const typed = splitSet(response).map(parseNumber).sort((a, b) => a - b);
      const correct = problem.correctAnswer.map(parseNumber).sort((a, b) => a - b);
      return typed.length === correct.length && typed.every((value, index) => numbersClose(value, correct[index]));
    }

    if (problem.answerType === 'multipleChoice') {
      return response === problem.correctAnswer;
    }

    if (problem.answerType === 'checkbox') {
      const typed = Array.isArray(response) ? response.slice().sort() : [];
      const correct = problem.correctAnswer.slice().sort();
      return typed.length === correct.length && typed.every((value, index) => value === correct[index]);
    }

    if (problem.answerType === 'graphFeatures') {
      const expected = problem.correctAnswer;
      return problem.graphFields.every((field) => {
        const typedValue = response ? response[field] : undefined;
        const expectedValue = expected[field];
        if (Array.isArray(expectedValue)) {
          const typedPoint = pointFromText(typedValue);
          return typedPoint && numbersClose(typedPoint[0], expectedValue[0]) && numbersClose(typedPoint[1], expectedValue[1]);
        }
        if (typeof expectedValue === 'boolean') return Boolean(typedValue) === expectedValue;
        if (field === 'slope') return slopeMatches(typedValue, expectedValue);
        return normalizeText(typedValue) === normalizeText(expectedValue);
      });
    }

    return false;
  }

  function renderProblem(problem) {
    const pState = getProblemState(problem.id);
    const card = document.createElement('article');
    card.className = `problem-card ${statusClass(pState.status)}`;
    card.id = `problem-${problem.id}`;
    card.dataset.problemId = problem.id;

    card.innerHTML = `
      <div class="problem-head">
        <div class="problem-title">
          <span class="problem-number">${problem.id}</span>
          <div class="prompt">${problem.promptLatex}</div>
        </div>
        <div class="problem-meta">
          <span class="status-pill ${statusClass(pState.status)}" data-role="status">${pState.status}</span>
          <span class="attempt-pill" data-role="attempts">Attempts: ${pState.attempts}</span>
        </div>
      </div>
      <div class="tip"><strong>Start by:</strong> ${problem.startBy}</div>
      <div class="answer-area" data-role="answerArea"></div>
      <div class="actions">
        <button class="btn" type="button" data-action="check">Check</button>
        <button class="btn secondary" type="button" data-action="hint">Hint</button>
        <button class="btn secondary" type="button" data-action="skip">Skip</button>
        ${problem.part === 'Part 3' || problem.desmosExpression ? `<button class="btn secondary desmos-trigger" type="button" data-expression="${problem.desmosExpression || ''}">Open Desmos</button>` : ''}
        <button class="btn secondary" type="button" data-action="reveal">Reveal explanation</button>
      </div>
      <div class="feedback ${pState.status === 'Correct' ? 'good' : pState.feedback ? 'practice' : ''}" data-role="feedback" aria-live="polite">${pState.feedback || ''}</div>
      <div class="hint-box ${pState.hintUsed ? '' : 'hidden'}" data-role="hint"><strong>Hint:</strong> ${problem.hint}</div>
      <div class="solution-box ${pState.status === 'Correct' || pState.revealed ? '' : 'hidden'}" data-role="solution"><strong>Explanation:</strong> ${solutions[problem.id] || 'Review the key features and try the problem again.'}</div>
    `;

    renderAnswerControls(problem, $('[data-role="answerArea"]', card), pState.answer);
    bindProblemEvents(problem, card);
    return card;
  }

  function renderAnswerControls(problem, container, answer) {
    if (problem.answerType === 'numeric' || problem.answerType === 'expression' || problem.answerType === 'expressionSet') {
      const help = problem.answerType === 'expressionSet' ? 'Separate multiple answers with commas. Fractions like 3/2 are accepted.' : 'Fractions and decimals are accepted when equivalent.';
      container.innerHTML = `<label class="answer-row">Answer<input type="text" data-answer="main" value="${answer || ''}" placeholder="Type your answer"><span class="help-text">${help}</span></label>`;
      return;
    }

    if (problem.answerType === 'multipleChoice') {
      container.innerHTML = `<div class="choice-list" role="radiogroup" aria-label="Problem ${problem.id} choices">${problem.choices.map((choice) => `
        <label><input type="radio" name="answer-${problem.id}" value="${choice.value}" ${answer === choice.value ? 'checked' : ''}> ${choice.label}</label>
      `).join('')}</div>`;
      return;
    }

    if (problem.answerType === 'checkbox') {
      const selected = Array.isArray(answer) ? answer : [];
      container.innerHTML = `<div class="checkbox-list">${problem.choices.map((choice) => `
        <label><input type="checkbox" value="${choice.value}" ${selected.includes(choice.value) ? 'checked' : ''}> ${choice.label}</label>
      `).join('')}</div>`;
      return;
    }

    if (problem.answerType === 'graphFeatures') {
      const saved = answer || {};
      container.innerHTML = `<div class="graph-grid">${problem.graphFields.map((field) => graphFieldHtml(field, saved[field])).join('')}</div><p class="help-text">Use exact key points such as (0,0). You do not need to draw the graph.</p>`;
    }
  }

  function graphFieldHtml(field, savedValue) {
    const definition = graphFieldDefinitions[field];
    const safeValue = savedValue === true ? true : (savedValue || '');
    if (!definition) return '';
    if (definition.type === 'select') {
      return `<label>${definition.label}<select data-graph-field="${field}">${definition.options.map((option) => `<option value="${option.value}" ${safeValue === option.value ? 'selected' : ''}>${option.label}</option>`).join('')}</select></label>`;
    }
    if (definition.type === 'checkbox') {
      return `<label class="full"><span><input type="checkbox" data-graph-field="${field}" ${safeValue ? 'checked' : ''}> ${definition.label}</span></label>`;
    }
    return `<label>${definition.label}<input type="text" data-graph-field="${field}" value="${safeValue}" placeholder="${definition.placeholder || ''}"></label>`;
  }

  function collectAnswer(problem, card) {
    if (['numeric', 'expression', 'expressionSet'].includes(problem.answerType)) return $('[data-answer="main"]', card).value;
    if (problem.answerType === 'multipleChoice') return ($(`input[name="answer-${problem.id}"]:checked`, card) || {}).value || '';
    if (problem.answerType === 'checkbox') return $$('input[type="checkbox"]:checked', card).map((input) => input.value);
    if (problem.answerType === 'graphFeatures') {
      const answer = {};
      $$('[data-graph-field]', card).forEach((control) => {
        answer[control.dataset.graphField] = control.type === 'checkbox' ? control.checked : control.value;
      });
      return answer;
    }
    return '';
  }

  function bindProblemEvents(problem, card) {
    card.addEventListener('input', () => {
      getProblemState(problem.id).answer = collectAnswer(problem, card);
      saveProgress();
      updateSummary();
    });
    card.addEventListener('change', () => {
      getProblemState(problem.id).answer = collectAnswer(problem, card);
      saveProgress();
      updateSummary();
    });
    card.addEventListener('click', (event) => {
      const action = event.target.dataset.action;
      if (!action) return;
      if (action === 'check') checkProblem(problem, card);
      if (action === 'hint') showHint(problem, card);
      if (action === 'skip') skipProblem(problem, card);
      if (action === 'reveal') revealSolution(problem, card);
    });
  }

  function updateProblemCard(problem, card) {
    const pState = getProblemState(problem.id);
    card.classList.remove('not-started', 'correct', 'needs-practice', 'skipped');
    card.classList.add(statusClass(pState.status));
    const status = $('[data-role="status"]', card);
    status.className = `status-pill ${statusClass(pState.status)}`;
    status.textContent = pState.status;
    $('[data-role="attempts"]', card).textContent = `Attempts: ${pState.attempts}`;
    const feedback = $('[data-role="feedback"]', card);
    feedback.className = `feedback ${pState.status === 'Correct' ? 'good' : pState.feedback ? 'practice' : ''}`;
    feedback.textContent = pState.feedback || '';
    $('[data-role="hint"]', card).classList.toggle('hidden', !pState.hintUsed);
    $('[data-role="solution"]', card).classList.toggle('hidden', !(pState.status === 'Correct' || pState.revealed));
  }

  function checkProblem(problem, card) {
    const pState = getProblemState(problem.id);
    pState.answer = collectAnswer(problem, card);
    pState.attempts += 1;
    pState.skipped = false;
    if (answerMatches(problem, pState.answer)) {
      pState.status = 'Correct';
      pState.feedback = problem.feedback.correct || 'Correct!';
    } else {
      pState.status = 'Needs Practice';
      pState.feedback = problem.feedback.incorrect || 'Not yet. Try again.';
    }
    updateProblemCard(problem, card);
    saveProgress();
    updateSummary();
  }

  function showHint(problem, card) {
    const pState = getProblemState(problem.id);
    pState.hintUsed = true;
    if (pState.status === 'Not Started') pState.feedback = 'Hint opened. Give the problem a try when you are ready.';
    updateProblemCard(problem, card);
    saveProgress();
    updateSummary();
  }

  function skipProblem(problem, card) {
    const pState = getProblemState(problem.id);
    pState.answer = collectAnswer(problem, card);
    pState.status = 'Skipped';
    pState.skipped = true;
    pState.feedback = 'Skipped for now. You can still come back, try it, and check your work.';
    updateProblemCard(problem, card);
    saveProgress();
    updateSummary();
  }

  function revealSolution(problem, card) {
    const pState = getProblemState(problem.id);
    pState.revealed = true;
    if (pState.status === 'Not Started') {
      pState.status = 'Needs Practice';
      pState.feedback = 'Explanation revealed. Try the problem again to earn Correct.';
    }
    updateProblemCard(problem, card);
    saveProgress();
    updateSummary();
  }

  function renderAllProblems() {
    const partMap = { 'Part 1': $('#part-1-list'), 'Part 2': $('#part-2-list'), 'Part 3': $('#part-3-list') };
    problems.forEach((problem) => partMap[problem.part].appendChild(renderProblem(problem)));
    if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise();
  }

  function problemLabelList(ids) {
    return ids.length ? ids.map((id) => `<li>Problem ${id}</li>`).join('') : '<li>None yet</li>';
  }

  function updateSummary() {
    const completed = problems.filter((problem) => ['Correct', 'Needs Practice', 'Skipped'].includes(getProblemState(problem.id).status));
    const correct = problems.filter((problem) => getProblemState(problem.id).status === 'Correct');
    const skipped = problems.filter((problem) => getProblemState(problem.id).status === 'Skipped').map((problem) => problem.id);
    const multiple = problems.filter((problem) => getProblemState(problem.id).attempts > 1).map((problem) => problem.id);
    const hints = problems.filter((problem) => getProblemState(problem.id).hintUsed).map((problem) => problem.id);
    const weakScores = new Map();

    problems.forEach((problem) => {
      const pState = getProblemState(problem.id);
      const score = (pState.status === 'Needs Practice' ? 2 : 0) + (pState.status === 'Skipped' ? 2 : 0) + (pState.hintUsed ? 1 : 0) + (pState.attempts > 1 ? 1 : 0);
      if (score > 0) problem.skillTags.forEach((tag) => weakScores.set(tag, (weakScores.get(tag) || 0) + score));
    });

    const weakTags = Array.from(weakScores.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    $('#summaryContent').innerHTML = `
      <div class="summary-grid">
        <div class="summary-tile"><span>Student</span><strong>${state.studentName || 'Not entered'}</strong></div>
        <div class="summary-tile"><span>Class period</span><strong>${state.classPeriod || 'Not entered'}</strong></div>
        <div class="summary-tile"><span>Total completed</span><strong>${completed.length} / ${problems.length}</strong></div>
        <div class="summary-tile"><span>Total correct</span><strong>${correct.length} / ${problems.length}</strong></div>
      </div>
      <section><h3>Assignment title</h3><p>${ASSIGNMENT_TITLE}</p></section>
      <section><h3>Skipped problems</h3><ul class="summary-list">${problemLabelList(skipped)}</ul></section>
      <section><h3>Problems requiring more than one attempt</h3><ul class="summary-list">${problemLabelList(multiple)}</ul></section>
      <section><h3>Problems where a hint was used</h3><ul class="summary-list">${problemLabelList(hints)}</ul></section>
      <section><h3>Weak skill tags</h3><div class="tag-cloud">${weakTags.length ? weakTags.map(([tag, score]) => `<span class="tag">${tag} (${score})</span>`).join('') : '<span class="tag">None yet</span>'}</div></section>
    `;
  }

  function bindGlobalEvents() {
    $('#studentName').addEventListener('input', (event) => { state.studentName = event.target.value; saveProgress(); updateSummary(); });
    $('#classPeriod').addEventListener('input', (event) => { state.classPeriod = event.target.value; saveProgress(); updateSummary(); });
    $('#skipSummaryBtn').addEventListener('click', () => { saveProgress(); updateSummary(); $('#summary').scrollIntoView({ behavior: 'smooth' }); });
    $('#printSummaryBtn').addEventListener('click', () => { saveProgress(); updateSummary(); window.print(); });
    $('#startOverBtn').addEventListener('click', () => {
      const confirmed = window.confirm('Start Over will clear this page and remove saved progress from this browser. Choose OK to Clear Saved Progress, or Cancel to keep working.');
      if (!confirmed) return;
      localStorage.removeItem(STORAGE_KEY);
      state.studentName = '';
      state.classPeriod = '';
      state.responses = {};
      $('#studentName').value = '';
      $('#classPeriod').value = '';
      $$('.problem-card').forEach((card) => card.remove());
      renderAllProblems();
      updateSummary();
      saveProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.addEventListener('click', (event) => {
      if (event.target.classList.contains('desmos-trigger')) openDesmos(event.target.dataset.expression || '');
    });
    $('#closeDesmosBtn').addEventListener('click', closeDesmos);
    $('#desmosModal').addEventListener('click', (event) => { if (event.target.id === 'desmosModal') closeDesmos(); });
    window.addEventListener('beforeunload', saveProgress);
  }

  function openDesmos(expression) {
    pendingExpression = expression;
    const modal = $('#desmosModal');
    modal.hidden = false;
    setTimeout(() => {
      const hasDesmos = window.Desmos && typeof window.Desmos.GraphingCalculator === 'function';
      if (!hasDesmos) {
        $('#desmosFallback').hidden = false;
        $('#calculator').classList.add('hidden');
        return;
      }
      $('#desmosFallback').hidden = true;
      $('#calculator').classList.remove('hidden');
      if (!calculator) calculator = window.Desmos.GraphingCalculator($('#calculator'), { expressions: true, settingsMenu: false });
      calculator.resize();
      if (pendingExpression) calculator.setExpression({ id: 'review-function', latex: pendingExpression });
    }, 80);
  }

  function closeDesmos() {
    $('#desmosModal').hidden = true;
  }

  function init() {
    loadProgress();
    $('#studentName').value = state.studentName;
    $('#classPeriod').value = state.classPeriod;
    renderAllProblems();
    bindGlobalEvents();
    updateSummary();
    console.info(`${ASSIGNMENT_TITLE}: ${problems.length} problems loaded.`);
  }

  init();
})();
