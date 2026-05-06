const ASSIGNMENT_TITLE = 'Algebra 2 Honors Unit 12 Review';
const PAGE_SIZE = 4;
const EXACT_ANSWERS = {
  '3a':['{-5,1}','-5,1'], '3b':['{-4,1}','-4,1'], '3c':['5'], '3d':['5'], '3f':['3'], '3h':['0'], '4':['1.161'],
  '5a':['49'], '5b':['16'], '5c':['(2^x-1)^2'], '6a':['(3,-2)','3,-2'], '6c':['(3,1,3)','3,1,3']
};
const GRAPH_BY_ID = Object.fromEntries((window.GRAPH_DATA || []).map(item => [item.id, item]));
const SOLUTIONS_BY_ID = window.SOLUTIONS || {};

let state = {
  started:false,
  student:{name:'', period:''},
  view:'landing',
  currentTopic:null,
  topicPage:0,
  records:{},
  practice:{},
  answers:{}
};

function freshRecord(){return {attempts:0, status:'Not Started', hintUsed:false, solutionShown:false, firstAttemptCorrect:false, completedWithHelp:false, needsReview:false, originalStatus:'Not Started'};}
function recordFor(id){if(!state.records[id]) state.records[id] = freshRecord(); return state.records[id];}
function normalize(value){return String(value || '').toLowerCase().replace(/[{}\s]/g,'').replace(/−/g,'-').replace(/∞/g,'infinity');}
function escapeHtml(value){return String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));}
function problemsForTopic(title){return window.PROBLEMS.filter(problem => problem.topic === title);}
function completedCount(problems){return problems.filter(problem => ['Correct','Needs Review','Completed with Help'].includes(recordFor(problem.id).status)).length;}
function showView(view){['landingView','dashboardView','topicView','summaryView'].forEach(id => document.getElementById(id).classList.add('hidden'));document.getElementById(`${view}View`).classList.remove('hidden');state.view = view;updateProgress();}
function updateProgress(){const total = window.PROBLEMS.length; const done = completedCount(window.PROBLEMS);document.getElementById('progressText').textContent = `${done} of ${total} completed`;document.getElementById('progressFill').style.width = `${Math.round((done/total)*100)}%`;document.getElementById('studentBadge').textContent = state.started ? `${state.student.name || 'Student'} • Period ${state.student.period || '?'}` : 'Not started';}

function renderDashboard(){const grid = document.getElementById('topicGrid');grid.innerHTML = '';window.TOPICS.forEach(topic => {const button = document.createElement('button');button.className = 'topic-card';button.type = 'button';if(topic.id === 'final-summary'){button.innerHTML = `<p class="eyebrow">Summary</p><h3>${topic.title}</h3><p>${topic.description}</p><div class="count">Open</div>`;button.addEventListener('click', renderSummary);} else {const topicProblems = problemsForTopic(topic.title);const done = completedCount(topicProblems);button.innerHTML = `<p class="eyebrow">Section ${topic.pageGroup}</p><h3>${topic.title}</h3><p>${topic.description}</p><div class="count">${done}/${topicProblems.length}</div><p class="meta">${Math.ceil(topicProblems.length/PAGE_SIZE)} page(s), up to 4 cards per page</p>`;button.addEventListener('click', () => openTopic(topic.title));}grid.appendChild(button);});showView('dashboard');}

function openTopic(topicTitle, page = 0){state.currentTopic = topicTitle;state.topicPage = page;renderTopic();}
function renderTopic(){const topicProblems = problemsForTopic(state.currentTopic);const maxPage = Math.max(0, Math.ceil(topicProblems.length/PAGE_SIZE)-1);state.topicPage = Math.min(state.topicPage, maxPage);document.getElementById('topicTitle').textContent = state.currentTopic;document.getElementById('topicKicker').textContent = `Topic • ${completedCount(topicProblems)}/${topicProblems.length} completed`;document.getElementById('topicMeta').textContent = 'Use these cards in any order. Return to the dashboard whenever you want another topic.';const start = state.topicPage * PAGE_SIZE;document.getElementById('problemGrid').innerHTML = topicProblems.slice(start, start + PAGE_SIZE).map(renderProblemCard).join('');document.getElementById('topicPageLabel').textContent = `Page ${state.topicPage + 1} of ${maxPage + 1}`;document.getElementById('prevPageBtn').disabled = state.topicPage === 0;document.getElementById('nextPageBtn').disabled = state.topicPage === maxPage;attachProblemEvents();showView('topic');}

function statusClass(status){if(status === 'Correct') return 'correct'; if(status !== 'Not Started') return 'review'; return '';}
function renderTags(tags){return tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');}
function renderAnswerArea(problem){const answer = state.answers[problem.id] || {};if(problem.answerType === 'graphFeatures'){return `<div class="graph-fields">
  ${['domain','range','verticalAsymptote','horizontalAsymptote','keyPoint','graphNotes'].map(key => `<div><label for="${problem.id}-${key}">${labelFor(key)}</label><input type="text" id="${problem.id}-${key}" data-answer-key="${key}" value="${escapeHtml(answer[key] || '')}" placeholder="${placeholderFor(problem.graphFeatureId,key)}"></div>`).join('')}
</div>`;}return `<label for="${problem.id}-answer">Student answer</label><input type="text" id="${problem.id}-answer" data-answer-key="answer" value="${escapeHtml(answer.answer || '')}" placeholder="Type your answer here">`;}
function labelFor(key){return ({domain:'Domain',range:'Range',verticalAsymptote:'Vertical asymptote',horizontalAsymptote:'Horizontal asymptote',keyPoint:'Vertex / start / center / intercept',graphNotes:'Shape notes'})[key] || key;}
function placeholderFor(graphId,key){const data = GRAPH_BY_ID[graphId] || {};return key === 'graphNotes' ? 'opens up/down, shift, branch notes...' : (data[key] || 'none if not needed');}
function renderProblemCard(problem){const rec = recordFor(problem.id);const solution = SOLUTIONS_BY_ID[problem.solutionId] || {shortAnswer:'Solution coming in Stage 2.', workedSteps:['TODO: complete worked solution.'], commonMistake:'TODO'};const strongerHint = rec.attempts >= 1 && rec.status !== 'Correct' ? `<div class="feedback hint"><strong>Stronger hint:</strong> ${escapeHtml(problem.hint2)}</div>` : '';const solutionBlock = rec.solutionShown ? `<div class="solution"><strong>Worked solution:</strong><p><strong>Short answer:</strong> ${escapeHtml(solution.shortAnswer)}</p><ol>${solution.workedSteps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol><p><strong>Common mistake:</strong> ${escapeHtml(solution.commonMistake)}</p><button class="btn secondary practice-btn" data-problem-id="${problem.id}" type="button">Try Again for Practice</button></div>` : '';const feedback = rec.feedback ? `<div class="feedback ${rec.feedbackType || ''}">${escapeHtml(rec.feedback)}</div>` : '';return `<article class="problem-card" data-problem-id="${problem.id}">
  <div class="problem-top"><div><p class="eyebrow">Problem ${escapeHtml(problem.appNumber)} • original ${escapeHtml(problem.originalLabel)}</p><h3>${escapeHtml(problem.topic)}</h3></div><span class="status-pill ${statusClass(rec.status)}">${escapeHtml(rec.status)}</span></div>
  <div>${renderTags(problem.skillTags)}</div>
  <div class="problem-prompt">${escapeHtml(problem.prompt)}</div>
  <div class="support"><div class="support-box"><strong>How this type works:</strong> ${escapeHtml(problem.howTo)}</div><div class="support-box"><strong>Watch out for:</strong> ${escapeHtml(problem.watchOut)}</div></div>
  <span class="answer-format">Answer format: ${escapeHtml(problem.answerFormat)}</span>
  <div class="answer-area">${renderAnswerArea(problem)}</div>
  <div class="actions"><button class="btn check-btn" data-problem-id="${problem.id}" type="button">Check Answer</button><button class="btn secondary hint-btn" data-problem-id="${problem.id}" type="button">Hint</button></div>
  ${feedback}${strongerHint}${solutionBlock}
</article>`;}

function attachProblemEvents(){document.querySelectorAll('.check-btn').forEach(btn => btn.addEventListener('click', () => checkAnswer(btn.dataset.problemId)));document.querySelectorAll('.hint-btn').forEach(btn => btn.addEventListener('click', () => showHint(btn.dataset.problemId)));document.querySelectorAll('.practice-btn').forEach(btn => btn.addEventListener('click', () => practiceRetry(btn.dataset.problemId)));document.querySelectorAll('[data-answer-key]').forEach(input => input.addEventListener('input', () => {const card = input.closest('.problem-card');if(!state.answers[card.dataset.problemId]) state.answers[card.dataset.problemId] = {};state.answers[card.dataset.problemId][input.dataset.answerKey] = input.value;}));}

function getProblem(id){return window.PROBLEMS.find(problem => problem.id === id);}
function readAnswer(id){const card = document.querySelector(`.problem-card[data-problem-id="${CSS.escape(id)}"]`);const values = {};card.querySelectorAll('[data-answer-key]').forEach(input => values[input.dataset.answerKey] = input.value);state.answers[id] = values;return values;}
function validate(problem, values){if(problem.answerType === 'graphFeatures'){const data = GRAPH_BY_ID[problem.graphFeatureId];if(!data) return false;const required = ['domain','range'];let matched = required.every(key => normalize(values[key]) === normalize(data[key]));if(data.verticalAsymptote !== 'none') matched = matched && normalize(values.verticalAsymptote) === normalize(data.verticalAsymptote);if(data.horizontalAsymptote !== 'none') matched = matched && normalize(values.horizontalAsymptote) === normalize(data.horizontalAsymptote);return matched;}
  if(problem.validatorStub === 'placeholderStage1') return normalize(values.answer).length > 0 && ['show solution','help','?'].every(blocked => normalize(values.answer) !== blocked);
  return (EXACT_ANSWERS[problem.id] || []).some(answer => normalize(values.answer) === normalize(answer));
}
function checkAnswer(id){const problem = getProblem(id);const rec = recordFor(id);const values = readAnswer(id);const hasAnyAnswer = Object.values(values).some(value => String(value).trim());if(!hasAnyAnswer){rec.feedback = 'Enter an answer before checking.';rec.feedbackType = 'hint';renderTopic();return;}const correct = validate(problem, values);rec.attempts += 1;if(correct){rec.status = rec.attempts === 1 && !rec.hintUsed ? 'Correct' : 'Completed with Help';rec.firstAttemptCorrect = rec.status === 'Correct';rec.completedWithHelp = rec.status === 'Completed with Help';rec.solutionShown = true;rec.feedback = problem.validatorStub === 'placeholderStage1' ? 'Stage 1 placeholder accepted this nonblank answer. Use the worked solution to self-check.' : 'Correct. Review the worked solution below.';rec.feedbackType = 'correct';} else if(rec.attempts === 1){rec.status = 'Not Started';rec.feedback = 'Not quite. A stronger hint is unlocked below.';rec.feedbackType = 'hint';} else {rec.status = 'Needs Review';rec.needsReview = true;rec.solutionShown = true;rec.feedback = 'This is marked Needs Review. Study the worked solution, then try again for practice if you want.';rec.feedbackType = 'review';}rec.originalStatus = rec.originalStatus === 'Not Started' ? rec.status : rec.originalStatus;renderTopic();}
function showHint(id){const problem = getProblem(id);const rec = recordFor(id);rec.hintUsed = true;rec.feedback = `Hint: ${problem.hint1}`;rec.feedbackType = 'hint';renderTopic();}
function practiceRetry(id){state.practice[id] = (state.practice[id] || 0) + 1;state.answers[id] = {};const rec = recordFor(id);rec.feedback = 'Practice retry started. Your original summary record is still saved.';rec.feedbackType = 'hint';rec.solutionShown = false;renderTopic();}

function renderSummary(){const total = window.PROBLEMS.length;const done = completedCount(window.PROBLEMS);const first = window.PROBLEMS.filter(p => recordFor(p.id).firstAttemptCorrect).length;const helped = window.PROBLEMS.filter(p => recordFor(p.id).completedWithHelp).length;const review = window.PROBLEMS.filter(p => recordFor(p.id).needsReview || recordFor(p.id).status === 'Needs Review').length;const difficultTags = weakestTags();const retryList = window.PROBLEMS.filter(p => recordFor(p.id).status === 'Needs Review').map(p => p.id).join(', ') || 'None yet';document.getElementById('summaryContent').innerHTML = `<p><strong>Student:</strong> ${escapeHtml(state.student.name || 'Not entered')} &nbsp; <strong>Period:</strong> ${escapeHtml(state.student.period || 'Not entered')}</p><p><strong>Assignment:</strong> ${ASSIGNMENT_TITLE}</p><div class="summary-grid"><div class="summary-card"><strong>Total completed</strong><span>${done}/${total}</span></div><div class="summary-card"><strong>Correct first try</strong><span>${first}</span></div><div class="summary-card"><strong>Correct after help</strong><span>${helped}</span></div><div class="summary-card"><strong>Needs review</strong><span>${review}</span></div></div><div class="placeholder"><strong>Print/export placeholder:</strong> Stage 2 will add printable/PDF export after exact validators are complete.</div><h3>Most difficult skill tags</h3><p>${escapeHtml(difficultTags.join(', ') || 'None yet')}</p><h3>Recommended problems to retry</h3><p>${escapeHtml(retryList)}</p><table class="status-table"><thead><tr><th>Problem</th><th>Topic</th><th>Status</th><th>Attempts</th></tr></thead><tbody>${window.PROBLEMS.map(p => {const rec = recordFor(p.id);return `<tr><td>${escapeHtml(p.id)}</td><td>${escapeHtml(p.topic)}</td><td>${escapeHtml(rec.status)}</td><td>${rec.attempts}</td></tr>`;}).join('')}</tbody></table>`;showView('summary');}
function weakestTags(){const counts = {};window.PROBLEMS.forEach(problem => {const rec = recordFor(problem.id);if(rec.status === 'Needs Review' || rec.attempts > 1){problem.skillTags.forEach(tag => counts[tag] = (counts[tag] || 0) + 1);}});return Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5).map(([tag,count]) => `${tag} (${count})`);}
function startOver(){if(!window.confirm('Start over? This clears answers, attempts, hints, statuses, and summary data. Name and period will stay.')) return;const student = {...state.student};state = {started:Boolean(student.name || student.period), student, view:'dashboard', currentTopic:null, topicPage:0, records:{}, practice:{}, answers:{}};if(state.started) renderDashboard(); else showView('landing');}

document.getElementById('startForm').addEventListener('submit', event => {event.preventDefault();state.student.name = document.getElementById('studentName').value.trim();state.student.period = document.getElementById('classPeriod').value.trim();state.started = true;renderDashboard();});
document.getElementById('dashboardBtn').addEventListener('click', () => state.started ? renderDashboard() : showView('landing'));
document.getElementById('returnDashboardBtn').addEventListener('click', renderDashboard);
document.getElementById('summaryDashboardBtn').addEventListener('click', renderDashboard);
document.getElementById('startOverBtn').addEventListener('click', startOver);
document.getElementById('prevPageBtn').addEventListener('click', () => {state.topicPage -= 1;renderTopic();window.scrollTo({top:0,behavior:'smooth'});});
document.getElementById('nextPageBtn').addEventListener('click', () => {state.topicPage += 1;renderTopic();window.scrollTo({top:0,behavior:'smooth'});});
updateProgress();
