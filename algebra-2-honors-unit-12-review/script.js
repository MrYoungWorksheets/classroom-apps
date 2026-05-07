const ASSIGNMENT_TITLE = 'Algebra 2 Honors Unit 12 Review';
const PAGE_SIZE = 4;
const DECIMAL_TOLERANCE = 0.001;

const GRAPH_BY_ID = Object.fromEntries((window.GRAPH_DATA || []).map(item => [item.id, item]));
const SOLUTIONS_BY_ID = window.SOLUTIONS || {};

const INTERVAL_CHOICES = [
  {value:'', label:'Choose...'},
  {value:'(-infinity, infinity)', label:'(-∞, ∞)'},
  {value:'[0, infinity)', label:'[0, ∞)'},
  {value:'(0, infinity)', label:'(0, ∞)'},
  {value:'(-infinity, 0) union (0, infinity)', label:'(-∞, 0) U (0, ∞)'},
  {value:'(3, infinity)', label:'(3, ∞)'},
  {value:'[-1, infinity)', label:'[-1, ∞)'},
  {value:'(-infinity, 4]', label:'(-∞, 4]'},
  {value:'(-infinity, 1]', label:'(-∞, 1]'},
  {value:'(-infinity, -4) union (-4, infinity)', label:'(-∞, -4) U (-4, ∞)'}
];

const GRAPH_CHECKS = {
  'g-1a': {domain:'(-infinity, infinity)', range:'(-infinity, infinity)'},
  'g-1b': {domain:'(-infinity, infinity)', range:'[0, infinity)', keyPoint:{points:[[0,0]], label:'vertex'}},
  'g-1c': {domain:'(-infinity, infinity)', range:'[0, infinity)', keyPoint:{points:[[0,0]], label:'vertex'}, notes:{any:['up','opens up']}},
  'g-1d': {domain:'(-infinity, infinity)', range:'(-infinity, infinity)', keyPoint:{points:[[0,0]], label:'center/inflection point'}},
  'g-1e': {domain:'[0, infinity)', range:'[0, infinity)', keyPoint:{points:[[0,0]], label:'starting point'}},
  'g-1f': {domain:'(-infinity, infinity)', range:'(-infinity, infinity)', keyPoint:{points:[[0,0]], label:'center point'}},
  'g-1g': {domain:'(-infinity, 0) union (0, infinity)', range:'(-infinity, 0) union (0, infinity)', verticalAsymptote:'x = 0', horizontalAsymptote:'y = 0'},
  'g-1h': {domain:'(-infinity, 0) union (0, infinity)', range:'(0, infinity)', verticalAsymptote:'x = 0', horizontalAsymptote:'y = 0'},
  'g-1i': {domain:'(-infinity, infinity)', range:'(0, infinity)', horizontalAsymptote:'y = 0'},
  'g-1j': {domain:'(0, infinity)', range:'(-infinity, infinity)', verticalAsymptote:'x = 0'},
  'g-2a': {domain:'(-infinity, infinity)', range:'[-1, infinity)', keyPoint:{points:[[-2,-1]], label:'vertex'}, notes:{any:['up','opens up'], points:[[-3,0],[-1,0],[0,3]]}},
  'g-2b': {domain:'(-infinity, infinity)', range:'(-infinity, 4]', keyPoint:{points:[[2,4]], label:'vertex'}, notes:{any:['down','opens down'], points:[[-2,0],[6,0],[0,2]]}},
  'g-2c': {domain:'(3, infinity)', range:'(-infinity, infinity)', verticalAsymptote:'x = 3', keyPoint:{points:[[4,0]], label:'x-intercept'}, notes:{any:['right 3','right3']}},
  'g-2d': {domain:'(-infinity, -4) union (-4, infinity)', range:'(-infinity, 0) union (0, infinity)', verticalAsymptote:'x = -4', horizontalAsymptote:'y = 0', notes:{any:['left 4','left4']}},
  'g-2e': {domain:'[0, infinity)', range:'(-infinity, 1]', keyPoint:{points:[[0,1]], label:'starting point'}, notes:{all:['reflect','up 1']}},
  'g-2f': {domain:'(-infinity, infinity)', range:'(-infinity, infinity)', keyPoint:{points:[[-1,0]], label:'center/inflection point'}, notes:{any:['left 1','left1']}}
};

let state = {
  started: false,
  student: {name:'', period:''},
  view: 'landing',
  currentTopic: null,
  topicPage: 0,
  records: {},
  practice: {},
  answers: {}
};

const THEME_STORAGE_KEY = 'unit12ReviewTheme';
const CHAOS_STORAGE_KEY = 'unit12ReviewChaosPalette';
const DEFAULT_THEME = 'dark';
const CHAOS_THEMES = [
  {
    name: 'Radioactive Flamingo',
    bg: '#ff4fd8',
    panel: '#39ff14',
    panelStrong: '#9d00ff',
    card: '#ffff33',
    cardBorder: '#00e5ff',
    text: '#111111',
    muted: '#3b164c',
    accent: '#ff6b00',
    accentStrong: '#111111',
    buttonBg: '#00e5ff',
    buttonText: '#111111',
    success: '#005c2f',
    warning: '#5a2d00',
    danger: '#7a001f',
    inputBg: '#ffffff',
    inputBorder: '#111111',
    shadow: 'rgba(17, 17, 17, 0.36)'
  },
  {
    name: 'Mustard Aquarium',
    bg: '#d9a300',
    panel: '#00a6a6',
    panelStrong: '#ff7a00',
    card: '#ffe66d',
    cardBorder: '#ff00a8',
    text: '#111827',
    muted: '#34204f',
    accent: '#ff00a8',
    accentStrong: '#111827',
    buttonBg: '#b000ff',
    buttonText: '#ffffff',
    success: '#005c46',
    warning: '#6b3500',
    danger: '#8c0038',
    inputBg: '#fffbe6',
    inputBorder: '#111827',
    shadow: 'rgba(52, 32, 79, 0.34)'
  },
  {
    name: 'Goblin Lava Lamp',
    bg: '#34135c',
    panel: '#7cff00',
    panelStrong: '#fff200',
    card: '#baff39',
    cardBorder: '#ffef00',
    text: '#111111',
    muted: '#442200',
    accent: '#ff4b00',
    accentStrong: '#111111',
    buttonBg: '#ff4b00',
    buttonText: '#111111',
    success: '#00613b',
    warning: '#5a3500',
    danger: '#9b1d00',
    inputBg: '#ffffff',
    inputBorder: '#34135c',
    shadow: 'rgba(52, 19, 92, 0.38)'
  },
  {
    name: 'Blueberry Peach Detention',
    bg: '#006bff',
    panel: '#ffd1b3',
    panelStrong: '#7fffd4',
    card: '#ffe0c7',
    cardBorder: '#111111',
    text: '#111111',
    muted: '#16324f',
    accent: '#00d084',
    accentStrong: '#111111',
    buttonBg: '#111111',
    buttonText: '#7fffd4',
    success: '#007a3d',
    warning: '#855400',
    danger: '#a61717',
    inputBg: '#ffffff',
    inputBorder: '#111111',
    shadow: 'rgba(0, 20, 80, 0.35)'
  },
  {
    name: 'Swamp Princess Spreadsheet',
    bg: '#556b2f',
    panel: '#d8bfd8',
    panelStrong: '#ffd700',
    card: '#e6e6fa',
    cardBorder: '#ff6347',
    text: '#111111',
    muted: '#2f3b1f',
    accent: '#ff6347',
    accentStrong: '#111111',
    buttonBg: '#ff6347',
    buttonText: '#111111',
    success: '#176b34',
    warning: '#6b4b00',
    danger: '#991b1b',
    inputBg: '#fffaf0',
    inputBorder: '#111111',
    shadow: 'rgba(47, 59, 31, 0.35)'
  },
  {
    name: 'Carnival Accident',
    bg: '#ff3131',
    panel: '#ffe600',
    panelStrong: '#00c2ff',
    card: '#ffffff',
    cardBorder: '#7a00ff',
    text: '#1b1b1b',
    muted: '#5a275a',
    accent: '#00ff85',
    accentStrong: '#ff00aa',
    buttonBg: '#7a00ff',
    buttonText: '#ffffff',
    success: '#166534',
    warning: '#854d0e',
    danger: '#b91c1c',
    inputBg: '#fff7d6',
    inputBorder: '#ff00aa',
    shadow: 'rgba(122, 0, 255, 0.35)'
  },
  {
    name: 'Goblin Lemonade Stand',
    bg: '#b6ff00',
    panel: '#14532d',
    panelStrong: '#facc15',
    card: '#fef08a',
    cardBorder: '#166534',
    text: '#102a12',
    muted: '#365314',
    accent: '#ec4899',
    accentStrong: '#7c2d12',
    buttonBg: '#ec4899',
    buttonText: '#ffffff',
    success: '#166534',
    warning: '#854d0e',
    danger: '#be123c',
    inputBg: '#ffffff',
    inputBorder: '#166534',
    shadow: 'rgba(20, 83, 45, 0.38)'
  },
  {
    name: 'Algebra Clown Car',
    bg: '#00f5d4',
    panel: '#f15bb5',
    panelStrong: '#fee440',
    card: '#9b5de5',
    cardBorder: '#ffffff',
    text: '#ffffff',
    muted: '#fff3b0',
    accent: '#00bbf9',
    accentStrong: '#fee440',
    buttonBg: '#fee440',
    buttonText: '#111111',
    success: '#bbf7d0',
    warning: '#fef08a',
    danger: '#fecdd3',
    inputBg: '#ffffff',
    inputBorder: '#00bbf9',
    shadow: 'rgba(35, 16, 77, 0.42)'
  },
  {
    name: 'Nacho Nebula',
    bg: '#ff7b00',
    panel: '#3a0ca3',
    panelStrong: '#7209b7',
    card: '#f9c74f',
    cardBorder: '#4cc9f0',
    text: '#1a102b',
    muted: '#5f0f40',
    accent: '#f72585',
    accentStrong: '#4361ee',
    buttonBg: '#4361ee',
    buttonText: '#ffffff',
    success: '#166534',
    warning: '#854d0e',
    danger: '#be123c',
    inputBg: '#fff3d1',
    inputBorder: '#3a0ca3',
    shadow: 'rgba(58, 12, 163, 0.38)'
  },
  {
    name: 'Toxic Library Carpet',
    bg: '#2f4f1f',
    panel: '#8b5cf6',
    panelStrong: '#22c55e',
    card: '#d9f99d',
    cardBorder: '#f97316',
    text: '#111827',
    muted: '#3f3f46',
    accent: '#e11d48',
    accentStrong: '#facc15',
    buttonBg: '#e11d48',
    buttonText: '#ffffff',
    success: '#166534',
    warning: '#854d0e',
    danger: '#b91c1c',
    inputBg: '#f7fee7',
    inputBorder: '#8b5cf6',
    shadow: 'rgba(47, 79, 31, 0.42)'
  },
  {
    name: 'Bubblegum Tax Audit',
    bg: '#ff8fab',
    panel: '#fbff12',
    panelStrong: '#00bbf9',
    card: '#ffc6ff',
    cardBorder: '#8338ec',
    text: '#231942',
    muted: '#5e548e',
    accent: '#ff006e',
    accentStrong: '#3a86ff',
    buttonBg: '#ff006e',
    buttonText: '#ffffff',
    success: '#166534',
    warning: '#854d0e',
    danger: '#b91c1c',
    inputBg: '#ffffff',
    inputBorder: '#8338ec',
    shadow: 'rgba(131, 56, 236, 0.34)'
  },
  {
    name: 'Wizard Vomit',
    bg: '#4c1d95',
    panel: '#84cc16',
    panelStrong: '#06b6d4',
    card: '#bef264',
    cardBorder: '#f43f5e',
    text: '#1a1a1a',
    muted: '#3f6212',
    accent: '#facc15',
    accentStrong: '#f43f5e',
    buttonBg: '#f43f5e',
    buttonText: '#ffffff',
    success: '#166534',
    warning: '#854d0e',
    danger: '#b91c1c',
    inputBg: '#f7fee7',
    inputBorder: '#4c1d95',
    shadow: 'rgba(76, 29, 149, 0.4)'
  },
  {
    name: 'Unlicensed Aquarium',
    bg: '#006d77',
    panel: '#ffddd2',
    panelStrong: '#83c5be',
    card: '#edf6f9',
    cardBorder: '#e29578',
    text: '#1d3557',
    muted: '#457b9d',
    accent: '#ff006e',
    accentStrong: '#fb8500',
    buttonBg: '#fb8500',
    buttonText: '#111111',
    success: '#166534',
    warning: '#854d0e',
    danger: '#b91c1c',
    inputBg: '#ffffff',
    inputBorder: '#006d77',
    shadow: 'rgba(0, 109, 119, 0.35)'
  },
  {
    name: 'Disco Pickle',
    bg: '#3f6212',
    panel: '#ff00ff',
    panelStrong: '#00ffff',
    card: '#ccff00',
    cardBorder: '#111111',
    text: '#111111',
    muted: '#4a044e',
    accent: '#ff7a00',
    accentStrong: '#0000ff',
    buttonBg: '#0000ff',
    buttonText: '#ffffff',
    success: '#166534',
    warning: '#854d0e',
    danger: '#b91c1c',
    inputBg: '#ffffff',
    inputBorder: '#ff00ff',
    shadow: 'rgba(17, 17, 17, 0.42)'
  },
  {
    name: 'Cosmic Mustard Incident',
    bg: '#facc15',
    panel: '#312e81',
    panelStrong: '#c026d3',
    card: '#fde68a',
    cardBorder: '#0891b2',
    text: '#1e1b4b',
    muted: '#713f12',
    accent: '#db2777',
    accentStrong: '#0f766e',
    buttonBg: '#0f766e',
    buttonText: '#ffffff',
    success: '#166534',
    warning: '#854d0e',
    danger: '#b91c1c',
    inputBg: '#fff7ed',
    inputBorder: '#312e81',
    shadow: 'rgba(49, 46, 129, 0.38)'
  },
  {
    name: 'The Printer Ran Out of Sanity',
    bg: '#111111',
    panel: '#fffb00',
    panelStrong: '#ff00c8',
    card: '#00ffea',
    cardBorder: '#ff0000',
    text: '#111111',
    muted: '#4b0082',
    accent: '#ff0000',
    accentStrong: '#0000ff',
    buttonBg: '#ff00c8',
    buttonText: '#111111',
    success: '#166534',
    warning: '#854d0e',
    danger: '#b91c1c',
    inputBg: '#ffffff',
    inputBorder: '#ff0000',
    shadow: 'rgba(255, 0, 200, 0.34)'
  },
  {
    name: 'Principal Walked In',
    bg: '#1f2937',
    panel: '#dc2626',
    panelStrong: '#f97316',
    card: '#fde047',
    cardBorder: '#111827',
    text: '#111827',
    muted: '#7f1d1d',
    accent: '#2563eb',
    accentStrong: '#16a34a',
    buttonBg: '#111827',
    buttonText: '#ffffff',
    success: '#166534',
    warning: '#854d0e',
    danger: '#b91c1c',
    inputBg: '#ffffff',
    inputBorder: '#dc2626',
    shadow: 'rgba(17, 24, 39, 0.4)'
  }
];



function getStoredValue(key){
  try { return window.localStorage.getItem(key); }
  catch (error) { return null; }
}
function setStoredValue(key, value){
  try { window.localStorage.setItem(key, value); }
  catch (error) { /* Theme persistence is optional if storage is blocked. */ }
}
function sanitizeThemeChoice(value){return ['light','dark','chaos'].includes(value) ? value : DEFAULT_THEME;}
function cssVarName(key){return `--${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}`;}
function applyChaosPalette(index){
  const palette = CHAOS_THEMES[index] || CHAOS_THEMES[0];
  Object.entries(palette).forEach(([key, value]) => {
    if(key !== 'name') document.documentElement.style.setProperty(cssVarName(key), value);
  });
  setStoredValue(CHAOS_STORAGE_KEY, String(CHAOS_THEMES.indexOf(palette)));
  return palette;
}
function clearChaosPalette(){
  if(!document.documentElement.style) return;
  CHAOS_THEMES.forEach(palette => {
    Object.keys(palette).forEach(key => {
      if(key !== 'name') document.documentElement.style.removeProperty(cssVarName(key));
    });
  });
}
function randomChaosIndex(excludeIndex = -1){
  if(CHAOS_THEMES.length <= 1) return 0;
  let next = Math.floor(Math.random() * CHAOS_THEMES.length);
  while(next === excludeIndex) next = Math.floor(Math.random() * CHAOS_THEMES.length);
  return next;
}
function updateThemeControls(theme, paletteName = ''){
  document.querySelectorAll('[data-theme-choice]').forEach(button => {
    const selected = button.dataset.themeChoice === theme;
    button.setAttribute('aria-pressed', String(selected));
  });
  const rerollButton = document.getElementById('rerollChaosBtn');
  const message = document.getElementById('themeMessage');
  if(rerollButton) rerollButton.classList.toggle('hidden', theme !== 'chaos');
  if(message){
    if(theme === 'chaos') message.textContent = `You were warned. Palette: ${paletteName}.`;
    else if(theme === 'dark') message.textContent = 'Dark Mode is on by default.';
    else message.textContent = 'Light Mode restored.';
  }
}
function applyTheme(theme, options = {}){
  const safeTheme = sanitizeThemeChoice(theme);
  let paletteName = '';
  document.documentElement.dataset.theme = safeTheme;
  if(safeTheme === 'chaos'){
    const storedIndex = Number(getStoredValue(CHAOS_STORAGE_KEY));
    const currentIndex = Number.isInteger(options.paletteIndex) ? options.paletteIndex : Number.isInteger(storedIndex) && CHAOS_THEMES[storedIndex] ? storedIndex : randomChaosIndex();
    paletteName = applyChaosPalette(currentIndex).name;
  } else {
    clearChaosPalette();
  }
  setStoredValue(THEME_STORAGE_KEY, safeTheme);
  updateThemeControls(safeTheme, paletteName);
}
function initializeThemeControls(){
  applyTheme(sanitizeThemeChoice(getStoredValue(THEME_STORAGE_KEY) || DEFAULT_THEME));
  document.querySelectorAll('[data-theme-choice]').forEach(button => {
    button.addEventListener('click', () => {
      if(button.dataset.themeChoice === 'chaos') applyTheme('chaos', {paletteIndex: randomChaosIndex(Number(getStoredValue(CHAOS_STORAGE_KEY)))});
      else applyTheme(button.dataset.themeChoice);
    });
  });
  const rerollButton = document.getElementById('rerollChaosBtn');
  if(rerollButton){
    rerollButton.addEventListener('click', () => applyTheme('chaos', {paletteIndex: randomChaosIndex(Number(getStoredValue(CHAOS_STORAGE_KEY)))}));
  }
}

function freshRecord(){
  return {attempts:0, status:'Not Started', hintUsed:false, solutionShown:false, firstAttemptCorrect:false, completedWithHelp:false, needsReview:false, originalStatus:'Not Started'};
}
function recordFor(id){if(!state.records[id]) state.records[id] = freshRecord(); return state.records[id];}
function escapeHtml(value){return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
function renderMathText(value){return escapeHtml(value);}
function typesetMath(root = document.body, attempts = 0){
  if(window.MathJax && typeof window.MathJax.typesetPromise === 'function'){
    window.MathJax.typesetClear?.([root]);
    window.MathJax.typesetPromise([root]).catch(error => console.warn('MathJax rendering failed:', error));
    return;
  }
  if(attempts < 20) window.setTimeout(() => typesetMath(root, attempts + 1), 100);
}
function normalize(value){return String(value || '').toLowerCase().replace(/−/g,'-').replace(/[{}\s]/g,'').replace(/∞/g,'infinity');}
function compactMath(value){return normalize(value).replace(/\*\*/g,'^').replace(/√/g,'sqrt').replace(/naturallogof/g,'ln').replace(/log₃/g,'log_3').replace(/log₂/g,'log_2');}
function problemsForTopic(title){return window.PROBLEMS.filter(problem => problem.topic === title);}
function completedCount(problems){return problems.filter(problem => ['Correct','Needs Review','Completed with Help'].includes(recordFor(problem.id).status)).length;}
function getProblem(id){return window.PROBLEMS.find(problem => problem.id === id);}
function problemOrder(id){return window.PROBLEMS.findIndex(problem => problem.id === id);}
function nearlyEqual(a, b, tolerance = DECIMAL_TOLERANCE){return Number.isFinite(a) && Math.abs(a - b) <= tolerance;}
function parseNumber(value){const match = String(value).trim().match(/-?\d+(?:\.\d+)?/);return match ? Number(match[0]) : NaN;}

function showView(view){
  ['landingView','dashboardView','topicView','summaryView'].forEach(id => document.getElementById(id).classList.add('hidden'));
  document.getElementById(`${view}View`).classList.remove('hidden');
  state.view = view;
  updateProgress();
}
function updateProgress(){
  const total = window.PROBLEMS.length;
  const done = completedCount(window.PROBLEMS);
  document.getElementById('progressText').textContent = `${done} of ${total} completed`;
  document.getElementById('progressFill').style.width = `${Math.round((done / total) * 100)}%`;
  document.getElementById('studentBadge').textContent = state.started ? `${state.student.name || 'Student'} • Period ${state.student.period || '?'}` : 'Not started';
}

function renderDashboard(){
  const grid = document.getElementById('topicGrid');
  grid.innerHTML = '';
  window.TOPICS.forEach(topic => {
    const button = document.createElement('button');
    button.className = 'topic-card';
    button.type = 'button';
    if(topic.id === 'final-summary'){
      button.innerHTML = `<p class="eyebrow">Summary</p><h3>${topic.title}</h3><p>${topic.description}</p><div class="count">Open</div>`;
      button.addEventListener('click', renderSummary);
    } else {
      const topicProblems = problemsForTopic(topic.title);
      const done = completedCount(topicProblems);
      button.innerHTML = `<p class="eyebrow">Section ${topic.pageGroup}</p><h3>${topic.title}</h3><p>${topic.description}</p><div class="count">${done}/${topicProblems.length}</div><p class="meta">${Math.ceil(topicProblems.length / PAGE_SIZE)} page(s), up to 4 cards per page</p>`;
      button.addEventListener('click', () => openTopic(topic.title));
    }
    grid.appendChild(button);
  });
  showView('dashboard');
  typesetMath(grid);
}

function openTopic(topicTitle, page = 0){state.currentTopic = topicTitle;state.topicPage = page;renderTopic();}
function renderTopic(){
  const topicProblems = problemsForTopic(state.currentTopic);
  const maxPage = Math.max(0, Math.ceil(topicProblems.length / PAGE_SIZE) - 1);
  state.topicPage = Math.min(state.topicPage, maxPage);
  document.getElementById('topicTitle').textContent = state.currentTopic;
  document.getElementById('topicKicker').textContent = `Topic • ${completedCount(topicProblems)}/${topicProblems.length} completed`;
  document.getElementById('topicMeta').textContent = 'Use these cards in any order. Return to the dashboard whenever you want another topic.';
  const start = state.topicPage * PAGE_SIZE;
  document.getElementById('problemGrid').innerHTML = topicProblems.slice(start, start + PAGE_SIZE).map(renderProblemCard).join('');
  document.getElementById('topicPageLabel').textContent = `Page ${state.topicPage + 1} of ${maxPage + 1}`;
  document.getElementById('prevPageBtn').disabled = state.topicPage === 0;
  document.getElementById('nextPageBtn').disabled = state.topicPage === maxPage;
  attachProblemEvents();
  showView('topic');
  typesetMath(document.getElementById('problemGrid'));
}

function statusClass(status){if(status === 'Correct') return 'correct'; if(status !== 'Not Started') return 'review'; return '';}
function renderTags(tags){return tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');}
function graphFieldsFor(problem){
  const check = GRAPH_CHECKS[problem.graphFeatureId] || {};
  return ['domain','range','verticalAsymptote','horizontalAsymptote','keyPoint','graphNotes'].filter(key => {
    if(['domain','range'].includes(key)) return Boolean(check[key]);
    if(key === 'keyPoint') return Boolean(check.keyPoint);
    if(key === 'graphNotes') return Boolean(check.notes);
    return Boolean(check[key]);
  });
}
function renderIntervalSelect(problem, key, value){
  const options = INTERVAL_CHOICES.map(choice => `<option value="${escapeHtml(choice.value)}" ${choice.value === value ? 'selected' : ''}>${escapeHtml(choice.label)}</option>`).join('');
  return `<select id="${problem.id}-${key}" data-answer-key="${key}">${options}</select>`;
}
function renderAnswerArea(problem){
  const answer = state.answers[problem.id] || {};
  if(problem.answerType === 'graphFeatures'){
    return `<div class="graph-fields">${graphFieldsFor(problem).map(key => {
      const control = ['domain','range'].includes(key)
        ? renderIntervalSelect(problem, key, answer[key] || '')
        : `<input type="text" id="${problem.id}-${key}" data-answer-key="${key}" value="${escapeHtml(answer[key] || '')}" placeholder="${placeholderFor(problem.graphFeatureId, key)}">`;
      return `<div><label for="${problem.id}-${key}">${labelFor(key, problem.graphFeatureId)}</label>${control}</div>`;
    }).join('')}</div>`;
  }
  return `<label for="${problem.id}-answer">Student answer</label><input type="text" id="${problem.id}-answer" data-answer-key="answer" value="${escapeHtml(answer.answer || '')}" placeholder="Type your answer here">`;
}
function labelFor(key, graphId){
  const check = GRAPH_CHECKS[graphId] || {};
  return ({domain:'Domain', range:'Range', verticalAsymptote:'Vertical asymptote', horizontalAsymptote:'Horizontal asymptote', keyPoint:check.keyPoint?.label || 'Key point', graphNotes:'Shape / shift / intercept notes'})[key] || key;
}
function placeholderFor(graphId, key){
  const data = GRAPH_BY_ID[graphId] || {};
  if(key === 'graphNotes') return 'Example: opens up; shift right 3; intercepts...';
  if(key === 'keyPoint') return data.keyPoint || '(0, 0)';
  return data[key] || 'none if not needed';
}
function formatSteps(steps){
  const safeSteps = Array.isArray(steps) ? steps : [String(steps || '')];
  return `<ol>${safeSteps.map(step => `<li>${renderMathText(step)}</li>`).join('')}</ol>`;
}
function renderSolution(solution){
  return `<div class="solution math-area"><h4>Worked solution</h4><p><strong>Short answer:</strong> ${renderMathText(solution.shortAnswer)}</p><div class="solution-steps"><strong>Steps:</strong>${formatSteps(solution.workedSteps)}</div><p><strong>Common mistake:</strong> ${renderMathText(solution.commonMistake)}</p></div>`;
}
function renderProblemCard(problem){
  const rec = recordFor(problem.id);
  const solution = SOLUTIONS_BY_ID[problem.solutionId] || {shortAnswer:'Solution pending.', workedSteps:['Ask your teacher for this worked solution.'], commonMistake:'Check each step carefully.'};
  const feedback = rec.feedback ? `<div class="feedback ${rec.feedbackType || ''} math-area">${renderMathText(rec.feedback)}</div>` : '';
  const strongerHint = rec.attempts > 0 && rec.status === 'Not Started' ? `<div class="feedback hint math-area"><strong>Second hint:</strong> ${renderMathText(problem.hint2)}</div>` : '';
  const practiceNote = state.practice[problem.id] ? `<p class="practice-note">Practice retry #${state.practice[problem.id]}: this does not change your original review record.</p>` : '';
  return `<article class="problem-card ${statusClass(rec.status)}" data-problem-id="${problem.id}">
    <div class="problem-top"><div><p class="eyebrow">Problem ${problem.appNumber}</p><h3>${escapeHtml(problem.topic)}</h3></div><span class="status-pill ${statusClass(rec.status)}">${escapeHtml(rec.status)}</span></div>
    <div class="problem-prompt math-area">${renderMathText(problem.prompt)}</div>
    <div class="tag-row">${renderTags(problem.skillTags)}</div>
    <div class="support-grid"><div class="support-box math-area"><strong>How to start</strong><p>${renderMathText(problem.howTo)}</p></div><div class="support-box math-area"><strong>Watch out</strong><p>${renderMathText(problem.watchOut)}</p></div></div>
    <span class="answer-format math-area">${renderMathText(problem.answerFormat)}</span>
    <div class="answer-area">${renderAnswerArea(problem)}</div>
    ${practiceNote}${feedback}${strongerHint}
    <div class="actions"><button class="btn check-btn" type="button" data-action="check">Check answer</button><button class="btn secondary hint-btn" type="button" data-action="hint">Hint</button>${rec.solutionShown ? `<button class="btn secondary practice-btn" type="button" data-action="practice">Try again for practice</button>` : ''}</div>
    ${rec.solutionShown ? renderSolution(solution) : ''}
  </article>`;
}
function attachProblemEvents(){
  document.querySelectorAll('.problem-card').forEach(card => {
    const id = card.dataset.problemId;
    card.querySelectorAll('[data-answer-key]').forEach(input => {
      input.addEventListener('input', () => saveAnswer(id, card));
      input.addEventListener('change', () => saveAnswer(id, card));
    });
    card.querySelectorAll('[data-action]').forEach(button => {
      button.addEventListener('click', () => {
        saveAnswer(id, card);
        if(button.dataset.action === 'check') checkAnswer(id);
        if(button.dataset.action === 'hint') showHint(id);
        if(button.dataset.action === 'practice') practiceRetry(id);
      });
    });
  });
}
function saveAnswer(id, card){state.answers[id] = readAnswerFromCard(card);}
function readAnswerFromCard(card){
  const values = {};
  card.querySelectorAll('[data-answer-key]').forEach(input => values[input.dataset.answerKey] = input.value);
  return values;
}
function readAnswer(id){return state.answers[id] || {};}

function numericAnswer(value, expected, tolerance = DECIMAL_TOLERANCE){return nearlyEqual(parseNumber(value), expected, tolerance);}
function splitAnswerParts(value){
  return compactMath(value)
    .replace(/x=/g,'')
    .replace(/y=/g,'')
    .replace(/z=/g,'')
    .replace(/and/g,',')
    .split(/[,;]/)
    .map(part => part.trim())
    .filter(Boolean);
}
function symbolicValue(token){
  const cleaned = compactMath(token).replace(/[()]/g,'');
  if(['sqrt2','+sqrt2'].includes(cleaned)) return Math.SQRT2;
  if(cleaned === '-sqrt2') return -Math.SQRT2;
  const fraction65Forms = ['-1+sqrt65/2','sqrt65-1/2'];
  if(fraction65Forms.includes(cleaned)) return (-1 + Math.sqrt(65)) / 2;
  const direct = Number(cleaned);
  return Number.isFinite(direct) ? direct : NaN;
}
function matchNumberSet(value, expected){
  const parts = splitAnswerParts(value).map(symbolicValue);
  if(parts.length !== expected.length || parts.some(number => !Number.isFinite(number))) return false;
  const unmatched = [...expected];
  return parts.every(number => {
    const index = unmatched.findIndex(target => nearlyEqual(number, target));
    if(index === -1) return false;
    unmatched.splice(index, 1);
    return true;
  });
}
function expressionMatches(value, forms, expectedDecimal = null){
  const cleaned = compactMath(value).replace(/\*/g,'');
  if(forms.some(form => cleaned === compactMath(form).replace(/\*/g,''))) return true;
  return expectedDecimal !== null && numericAnswer(value, expectedDecimal);
}
function validateSystem(value, expectedPoints){
  const cleaned = compactMath(value).replace(/\band\b/g,',');
  const matches = [...cleaned.matchAll(/\((-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)(?:,(-?\d+(?:\.\d+)?))?\)/g)];
  let points = matches.map(match => match.slice(1).filter(item => item !== undefined).map(Number));
  if(!points.length){
    const nums = [...cleaned.matchAll(/-?\d+(?:\.\d+)?/g)].map(match => Number(match[0]));
    const size = expectedPoints[0].length;
    if(nums.length === expectedPoints.length * size){
      points = Array.from({length: expectedPoints.length}, (_, i) => nums.slice(i * size, (i + 1) * size));
    }
  }
  if(points.length !== expectedPoints.length) return false;
  const unmatched = expectedPoints.map(point => [...point]);
  return points.every(point => {
    const index = unmatched.findIndex(target => target.length === point.length && target.every((coordinate, i) => nearlyEqual(coordinate, point[i])));
    if(index === -1) return false;
    unmatched.splice(index, 1);
    return true;
  });
}
function validateMultipleInput(problem, values){
  const expected = problem.expectedAnswers || {};
  return Object.entries(expected).every(([key, expectedValue]) => normalize(values[key]) === normalize(expectedValue));
}
function validateCheckbox(problem, values){
  const selected = Object.entries(values).filter(([, value]) => value === true || value === 'true' || value === 'on').map(([key]) => key).sort();
  return JSON.stringify(selected) === JSON.stringify([...(problem.correctChoices || [])].sort());
}
function equivalentInterval(a, b){return normalizeInterval(a) === normalizeInterval(b);}
function normalizeInterval(value){
  return String(value || '').toLowerCase()
    .replace(/∞/g,'infinity')
    .replace(/\binf\b/g,'infinity')
    .replace(/oo/g,'infinity')
    .replace(/∪/g,'union')
    .replace(/\bu\b/g,'union')
    .replace(/\s+/g,'')
    .replace(/,/g,',')
    .replace(/\),\(/g,')union(')
    .replace(/\)\(/g,')union(');
}
function lineMatches(value, expected){
  const left = compactMath(value).replace(/=/g,'');
  const right = compactMath(expected).replace(/=/g,'');
  return left === right;
}
function pointInText(value, point){
  const nums = [...String(value).replace(/−/g,'-').matchAll(/-?\d+(?:\.\d+)?/g)].map(match => Number(match[0]));
  for(let i = 0; i < nums.length - 1; i += 1){
    if(nearlyEqual(nums[i], point[0]) && nearlyEqual(nums[i + 1], point[1])) return true;
  }
  return false;
}
function textContainsAny(value, terms){
  const cleaned = compactMath(value).replace(/-/g,' ');
  return terms.some(term => cleaned.includes(compactMath(term).replace(/-/g,' ')));
}
function graphNotesMatch(value, rule){
  if(!rule) return true;
  if(rule.any && !textContainsAny(value, rule.any)) return false;
  if(rule.all && !rule.all.every(term => textContainsAny(value, [term]))) return false;
  if(rule.points && !rule.points.every(point => pointInText(value, point))) return false;
  return true;
}
function validateGraph(values, graphFeatureId){
  const check = GRAPH_CHECKS[graphFeatureId];
  if(!check) return {correct:false, feedback:'This graph checker is missing setup. Tell your teacher which problem did not load.'};
  if(check.domain && !equivalentInterval(values.domain, check.domain)) return {correct:false, feedback:'Check the domain first: which x-values are allowed?'};
  if(check.range && !equivalentInterval(values.range, check.range)) return {correct:false, feedback:'Check the range: identify the lowest/highest y-values and whether endpoints are included.'};
  if(check.verticalAsymptote && !lineMatches(values.verticalAsymptote, check.verticalAsymptote)) return {correct:false, feedback:'Check the vertical asymptote first. It controls the graph’s boundary.'};
  if(check.horizontalAsymptote && !lineMatches(values.horizontalAsymptote, check.horizontalAsymptote)) return {correct:false, feedback:'Check the horizontal asymptote: what y-value does the graph approach?'};
  if(check.keyPoint && !check.keyPoint.points.every(point => pointInText(values.keyPoint, point))) return {correct:false, feedback:`Check the ${check.keyPoint.label}: use an ordered point like (${check.keyPoint.points[0].join(', ')}).`};
  if(check.notes && !graphNotesMatch(values.graphNotes, check.notes)) return {correct:false, feedback:'Check the shape, shift, or intercept notes. Include the requested direction and key intercepts when asked.'};
  return {correct:true, feedback:'Correct. Review the worked solution below.'};
}
function skillFeedback(problem, values){
  if(problem.id === '3f' && numericAnswer(values.answer, 9)) return '9 comes from squaring, but it is extraneous when checked in the original equation.';
  if(problem.skillTags.includes('rational equations') || problem.skillTags.includes('rational')) return 'Check the excluded values before finalizing your answer.';
  if(problem.skillTags.includes('logarithmic equations') || problem.skillTags.includes('logarithmic')) return 'Make sure all log arguments are positive and recheck the asymptote or domain.';
  if(problem.skillTags.includes('radical equations')) return 'Squaring can create an extraneous solution. Check candidates in the original equation.';
  if(problem.skillTags.includes('systems')) return 'Substitute your solution back into every equation in the system.';
  if(problem.skillTags.includes('function composition')) return 'Work from the inside function outward and keep the entire expression grouped.';
  if(problem.skillTags.includes('exponential equations')) return 'Isolate the exponential expression first, then use matching bases or logarithms.';
  if(problem.answerType === 'graphFeatures') return 'Check the main graph feature that controls the shape before trying details.';
  return 'Review the setup and check your answer in the original problem.';
}
function validate(problem, values){
  if(problem.answerType === 'graphFeatures') return validateGraph(values, problem.graphFeatureId);
  if(problem.answerType === 'multipleInput') return {correct:validateMultipleInput(problem, values)};
  if(problem.answerType === 'checkbox') return {correct:validateCheckbox(problem, values)};
  const answer = values.answer || '';
  const result = (() => {
    switch(problem.id){
      case '3a': return matchNumberSet(answer, [-5, 1]);
      case '3b': return matchNumberSet(answer, [-4, 1]);
      case '3c': return numericAnswer(answer, 5);
      case '3d': return numericAnswer(answer, 5);
      case '3e': return expressionMatches(answer, ['(-1+sqrt(65))/2','(sqrt(65)-1)/2','(-1+√65)/2','(√65-1)/2'], (-1 + Math.sqrt(65)) / 2);
      case '3f': return numericAnswer(answer, 3);
      case '3g': return matchNumberSet(answer, [-6, -Math.SQRT2, Math.SQRT2]);
      case '3h': return numericAnswer(answer, 0);
      case '3i': return expressionMatches(answer, ['4-ln(3)','4-ln3','4-naturallogof3'], 4 - Math.log(3));
      case '4': return numericAnswer(answer, 1.161) || expressionMatches(answer, ['log(25)/(2log(4))','ln(25)/(2ln(4))']);
      case '5a': return numericAnswer(answer, 49);
      case '5b': return numericAnswer(answer, 16);
      case '5c': return expressionMatches(answer, ['(2^x-1)^2','(2**x-1)^2']);
      case '6a': return validateSystem(answer, [[3,-2]]);
      case '6b': return validateSystem(answer, [[3,1],[1,3]]);
      case '6c': return validateSystem(answer, [[3,1,3]]);
      default: return normalize(answer).length > 0;
    }
  })();
  return {correct:result, feedback:result ? 'Correct. Review the worked solution below.' : skillFeedback(problem, values)};
}
function checkAnswer(id){
  const problem = getProblem(id);
  const rec = recordFor(id);
  const values = readAnswer(id);
  const hasAnyAnswer = Object.values(values).some(value => String(value).trim());
  if(!hasAnyAnswer){rec.feedback = 'Enter an answer before checking.';rec.feedbackType = 'hint';renderTopic();return;}
  const result = validate(problem, values);
  rec.attempts += 1;
  if(result.correct){
    rec.status = rec.attempts === 1 && !rec.hintUsed ? 'Correct' : 'Completed with Help';
    rec.firstAttemptCorrect = rec.status === 'Correct';
    rec.completedWithHelp = rec.status === 'Completed with Help';
    rec.solutionShown = true;
    rec.feedback = result.feedback || 'Correct. Review the worked solution below.';
    rec.feedbackType = 'correct';
  } else if(rec.attempts === 1){
    rec.status = 'Not Started';
    rec.feedback = `${result.feedback || skillFeedback(problem, values)} A stronger hint is unlocked below.`;
    rec.feedbackType = 'hint';
  } else {
    rec.status = 'Needs Review';
    rec.needsReview = true;
    rec.solutionShown = true;
    rec.feedback = `${result.feedback || skillFeedback(problem, values)} This is marked Needs Review. Study the worked solution, then try again for practice if you want.`;
    rec.feedbackType = 'review';
  }
  if(rec.originalStatus === 'Not Started') rec.originalStatus = rec.status;
  renderTopic();
}
function showHint(id){
  const problem = getProblem(id);
  const rec = recordFor(id);
  rec.hintUsed = true;
  rec.feedback = `Hint: ${problem.hint1}`;
  rec.feedbackType = 'hint';
  renderTopic();
}
function practiceRetry(id){
  state.practice[id] = (state.practice[id] || 0) + 1;
  state.answers[id] = {};
  const rec = recordFor(id);
  rec.feedback = 'Practice retry started. Your original summary record is still saved.';
  rec.feedbackType = 'hint';
  rec.solutionShown = false;
  renderTopic();
}

function tagStats(){
  const stats = {};
  window.PROBLEMS.forEach(problem => {
    const rec = recordFor(problem.id);
    problem.skillTags.forEach(tag => {
      if(!stats[tag]) stats[tag] = {tag, total:0, completed:0, first:0, helped:0, review:0, hints:0, score:0, problems:new Set()};
      const item = stats[tag];
      item.total += 1;
      if(['Correct','Completed with Help','Needs Review'].includes(rec.status)) item.completed += 1;
      if(rec.firstAttemptCorrect) item.first += 1;
      if(rec.completedWithHelp) item.helped += 1;
      if(rec.status === 'Needs Review' || rec.needsReview){item.review += 1; item.score += 3; item.problems.add(problem.id);}
      if(rec.attempts > 1){item.score += 1; item.problems.add(problem.id);}
      if(rec.hintUsed){item.hints += 1; item.score += 1; item.problems.add(problem.id);}
    });
  });
  return Object.values(stats).map(item => ({...item, problems:[...item.problems].sort((a,b) => problemOrder(a) - problemOrder(b))}));
}
function weakestSkillAreas(){return tagStats().filter(item => item.score > 0).sort((a,b) => b.score - a.score || a.tag.localeCompare(b.tag)).slice(0, 3);}
function recommendedRetryList(weakest){
  const ids = new Set();
  weakest.forEach(skill => skill.problems.forEach(id => ids.add(id)));
  window.PROBLEMS.forEach(problem => {const rec = recordFor(problem.id); if(rec.status === 'Needs Review' || rec.needsReview) ids.add(problem.id);});
  return [...ids].sort((a,b) => problemOrder(a) - problemOrder(b));
}
function summaryData(){
  const total = window.PROBLEMS.length;
  const done = completedCount(window.PROBLEMS);
  const first = window.PROBLEMS.filter(p => recordFor(p.id).firstAttemptCorrect).length;
  const helped = window.PROBLEMS.filter(p => recordFor(p.id).completedWithHelp).length;
  const review = window.PROBLEMS.filter(p => recordFor(p.id).needsReview || recordFor(p.id).status === 'Needs Review').length;
  const weakest = weakestSkillAreas();
  const retryList = recommendedRetryList(weakest);
  const statsRows = tagStats().filter(item => item.completed || item.score).sort((a,b) => b.score - a.score || a.tag.localeCompare(b.tag));
  const fallbackStatsRows = tagStats().slice(0, 8);
  const problemRows = window.PROBLEMS.map(problem => ({problem, record:recordFor(problem.id)}));
  return {total, done, first, helped, review, weakest, retryList, statsRows, fallbackStatsRows, problemRows};
}
function renderStatsTable(rows){
  return `<table class="status-table"><thead><tr><th>Skill</th><th>Completed</th><th>First try</th><th>After help</th><th>Needs review</th><th>Hints</th><th>Retry problems</th></tr></thead><tbody>${rows.map(item => `<tr><td>${escapeHtml(titleCase(item.tag))}</td><td>${item.completed}/${item.total}</td><td>${item.first}</td><td>${item.helped}</td><td>${item.review}</td><td>${item.hints}</td><td>${escapeHtml(item.problems.join(', ') || '—')}</td></tr>`).join('')}</tbody></table>`;
}
function renderProblemStatusTable(problemRows){
  return `<table class="status-table"><thead><tr><th>Problem ID</th><th>Topic</th><th>Status</th><th>Attempts</th><th>Hint used</th></tr></thead><tbody>${problemRows.map(({problem, record}) => `<tr><td>${escapeHtml(problem.id)}</td><td>${escapeHtml(problem.topic)}</td><td>${escapeHtml(record.status)}</td><td>${record.attempts}</td><td>${record.hintUsed ? 'Yes' : 'No'}</td></tr>`).join('')}</tbody></table>`;
}
function renderSummaryMetrics(data){
  return `<div class="summary-grid"><div class="summary-card"><strong>Total completed</strong><span>${data.done}/${data.total}</span></div><div class="summary-card"><strong>Correct first try</strong><span>${data.first}</span></div><div class="summary-card"><strong>Correct after help</strong><span>${data.helped}</span></div><div class="summary-card"><strong>Needs review</strong><span>${data.review}</span></div></div>`;
}
function renderWeakSkillList(weakest){
  return weakest.length ? `<ol class="weak-list">${weakest.map(skill => `<li><strong>${escapeHtml(titleCase(skill.tag))}:</strong> Retry ${escapeHtml(skill.problems.join(', '))}.</li>`).join('')}</ol>` : '<p>No weak skill areas yet. Complete more problems to generate recommendations.</p>';
}
function renderPrintableSummary(data, printedAt){
  const statsRows = data.statsRows.length ? data.statsRows : data.fallbackStatsRows;
  return `<div class="print-title-block"><p class="eyebrow">Final Summary</p><h1>${ASSIGNMENT_TITLE}</h1><p><strong>Student name:</strong> ${escapeHtml(state.student.name || 'Not entered')} &nbsp; <strong>Class period:</strong> ${escapeHtml(state.student.period || 'Not entered')}</p><p><strong>Date/time printed:</strong> ${escapeHtml(printedAt)}</p></div>
    ${renderSummaryMetrics(data)}
    <h2>Top weak skill areas</h2>
    ${renderWeakSkillList(data.weakest)}
    <h2>Recommended retry list</h2><p>${data.retryList.length ? escapeHtml(data.retryList.join(', ')) : 'None yet'}</p>
    <h2>Skill breakdown</h2>
    ${renderStatsTable(statsRows)}
    <h2>Full problem-by-problem status list</h2>
    ${renderProblemStatusTable(data.problemRows)}`;
}
function updatePrintableSummary(data = summaryData()){
  const printSummary = document.getElementById('printSummary');
  if(!printSummary) return;
  printSummary.innerHTML = renderPrintableSummary(data, new Date().toLocaleString());
}
function renderSummary(){
  const data = summaryData();
  const statsRows = data.statsRows.length ? data.statsRows : data.fallbackStatsRows;
  document.getElementById('summaryContent').innerHTML = `<p><strong>Student:</strong> ${escapeHtml(state.student.name || 'Not entered')} &nbsp; <strong>Period:</strong> ${escapeHtml(state.student.period || 'Not entered')}</p>
    <p><strong>Assignment:</strong> ${ASSIGNMENT_TITLE}</p>
    ${renderSummaryMetrics(data)}
    <h3>Most difficult skill areas</h3>
    ${renderWeakSkillList(data.weakest)}
    <h3>Recommended Retry List</h3><p>${data.retryList.length ? escapeHtml(data.retryList.join(', ')) : 'None yet'}</p>
    <h3>Skill breakdown</h3>
    ${renderStatsTable(statsRows)}
    <h3>Problem record</h3>
    ${renderProblemStatusTable(data.problemRows)}`;
  updatePrintableSummary(data);
  showView('summary');
  typesetMath(document.getElementById('summaryView'));
}
function printSummary(){
  updatePrintableSummary();
  window.print();
}
function titleCase(value){return String(value).replace(/\b\w/g, letter => letter.toUpperCase());}
function startOver(){
  if(!window.confirm('Start over? This clears answers, attempts, hints, statuses, and summary data. Name and period will stay.')) return;
  const student = {...state.student};
  state = {started:Boolean(student.name || student.period), student, view:'dashboard', currentTopic:null, topicPage:0, records:{}, practice:{}, answers:{}};
  if(state.started) renderDashboard(); else showView('landing');
}

document.getElementById('startForm').addEventListener('submit', event => {
  event.preventDefault();
  state.student.name = document.getElementById('studentName').value.trim();
  state.student.period = document.getElementById('classPeriod').value.trim();
  state.started = true;
  renderDashboard();
});
document.getElementById('dashboardBtn').addEventListener('click', () => state.started ? renderDashboard() : showView('landing'));
document.getElementById('returnDashboardBtn').addEventListener('click', renderDashboard);
document.getElementById('summaryDashboardBtn').addEventListener('click', renderDashboard);
document.getElementById('printSummaryBtn').addEventListener('click', printSummary);
window.addEventListener('beforeprint', () => {if(state.view === 'summary') updatePrintableSummary();});
document.getElementById('startOverBtn').addEventListener('click', startOver);
document.getElementById('prevPageBtn').addEventListener('click', () => {state.topicPage -= 1;renderTopic();window.scrollTo({top:0, behavior:'smooth'});});
document.getElementById('nextPageBtn').addEventListener('click', () => {state.topicPage += 1;renderTopic();window.scrollTo({top:0, behavior:'smooth'});});
initializeThemeControls();
updateProgress();
