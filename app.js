// AP CSA Java Companion — router + rendering. No build step, no dependencies.

const UNIT_ORDER = [
  "unit1", "unit2", "unit3", "unit4", "unit5",
  "unit6", "unit7", "unit8", "unit9", "unit10",
];

function getUnits() {
  return UNIT_ORDER
    .map((id) => window.APCSA_UNITS && window.APCSA_UNITS[id])
    .filter(Boolean);
}

function getUnit(id) {
  return window.APCSA_UNITS && window.APCSA_UNITS[id];
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function el(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  return wrapper;
}

function codeBlock(code) {
  if (!code) return "";
  return `<pre class="code-block"><code>${escapeHtml(code)}</code></pre>`;
}

function outputBlock(output) {
  if (!output) return "";
  return `<div class="output-block"><div class="output-label">Output</div><pre class="output">${escapeHtml(output)}</pre></div>`;
}

// ---------- Sidebar ----------

let openUnitId = null;

function renderSidebar(route) {
  const sidebar = document.getElementById("sidebar");
  const units = getUnits();

  const html = units
    .map((unit) => {
      const completion = Progress.unitCompletion(unit);
      const isOpen = openUnitId === unit.id;

      const lessonItems = (unit.lessons || [])
        .map((lesson) => {
          const done = Progress.isLessonComplete(unit.id, lesson.id);
          const active = route.type === "lesson" && route.unitId === unit.id && route.itemId === lesson.id;
          return `<li><a href="#/unit/${unit.id}/lesson/${lesson.id}" class="${active ? "active" : ""}">
            <span class="check ${done ? "done" : ""}"></span>${escapeHtml(lesson.title)}
          </a></li>`;
        })
        .join("");

      const quizResult = Progress.getQuizResult(unit.id);
      const quizDone = quizResult && quizResult.best === quizResult.total;
      const quizActive = route.type === "quiz" && route.unitId === unit.id;
      const quizItem = (unit.quiz || []).length
        ? `<li><a href="#/unit/${unit.id}/quiz" class="${quizActive ? "active" : ""}">
            <span class="check ${quizDone ? "done" : ""}"></span>Quiz${quizResult ? ` (${quizResult.best}/${quizResult.total})` : ""}
          </a></li>`
        : "";

      const frqActive = (route.type === "frq" || route.type === "frq-list") && route.unitId === unit.id;
      const frqItem = (unit.frqs || []).length
        ? `<li><a href="#/unit/${unit.id}/frq" class="${frqActive ? "active" : ""}">
            <span class="check"></span>Free Response
          </a></li>`
        : "";

      return `<div class="unit-block ${isOpen ? "open" : ""}" data-unit-id="${unit.id}">
        <button class="unit-header" data-toggle="${unit.id}">
          <span class="unit-num">${unit.number}</span>
          <span>${escapeHtml(unit.title)}</span>
          <span class="unit-progress-mini">${completion.pct}%</span>
          <span class="unit-caret">&#9656;</span>
        </button>
        <ul class="unit-items">
          ${lessonItems}
          ${quizItem}
          ${frqItem}
        </ul>
      </div>`;
    })
    .join("");

  sidebar.innerHTML = html;

  sidebar.querySelectorAll("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-toggle");
      openUnitId = openUnitId === id ? null : id;
      renderSidebar(currentRoute);
    });
  });
}

// ---------- Views ----------

function renderHome() {
  const units = getUnits();
  const cards = units
    .map((unit) => {
      const completion = Progress.unitCompletion(unit);
      return `<a class="nav-card" href="#/unit/${unit.id}">
        <div class="nav-card-kind">Unit ${unit.number}</div>
        <div class="nav-card-title">${escapeHtml(unit.title)}</div>
        <div class="nav-card-meta">${completion.pct}% complete</div>
      </a>`;
    })
    .join("");

  return `
    <h1>AP CSA Java Companion</h1>
    <p class="unit-summary">A complete walkthrough of the AP Computer Science A curriculum: ten units,
    worked Java examples, practice quizzes, and exam-style free-response questions with model solutions.</p>
    <div class="card-grid">${cards}</div>
  `;
}

function renderUnitOverview(unit) {
  const lessonCards = (unit.lessons || [])
    .map((lesson) => {
      const done = Progress.isLessonComplete(unit.id, lesson.id);
      return `<a class="nav-card" href="#/unit/${unit.id}/lesson/${lesson.id}">
        <div class="nav-card-kind">Lesson</div>
        <div class="nav-card-title">${escapeHtml(lesson.title)}</div>
        <div class="nav-card-meta">${done ? "Completed" : "Not started"}</div>
      </a>`;
    })
    .join("");

  const quizResult = Progress.getQuizResult(unit.id);
  const quizCard = (unit.quiz || []).length
    ? `<a class="nav-card" href="#/unit/${unit.id}/quiz">
        <div class="nav-card-kind">Practice Quiz</div>
        <div class="nav-card-title">${unit.quiz.length} multiple-choice questions</div>
        <div class="nav-card-meta">${quizResult ? `Best score: ${quizResult.best}/${quizResult.total}` : "Not attempted"}</div>
      </a>`
    : "";

  const frqCard = (unit.frqs || []).length
    ? `<a class="nav-card" href="#/unit/${unit.id}/frq">
        <div class="nav-card-kind">Free Response</div>
        <div class="nav-card-title">${unit.frqs.length} exam-style question${unit.frqs.length > 1 ? "s" : ""}</div>
        <div class="nav-card-meta">With model solutions &amp; rubrics</div>
      </a>`
    : "";

  return `
    <div class="breadcrumb"><a href="#/">Home</a> &rsaquo; Unit ${unit.number}</div>
    <h1>Unit ${unit.number}: ${escapeHtml(unit.title)}</h1>
    <p class="unit-summary">${escapeHtml(unit.summary || "")}</p>
    ${(unit.objectives || []).length ? `
      <div class="objectives">
        <h3>What you'll learn</h3>
        <ul>${unit.objectives.map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ul>
      </div>
    ` : ""}
    <div class="card-grid">${lessonCards}${quizCard}${frqCard}</div>
  `;
}

function renderLesson(unit, lesson) {
  Progress.markLessonComplete(unit.id, lesson.id);

  const sections = (lesson.sections || [])
    .map((s) => `
      <div class="lesson-section">
        ${s.heading ? `<h2>${escapeHtml(s.heading)}</h2>` : ""}
        ${s.body ? `<div>${s.body}</div>` : ""}
        ${codeBlock(s.code)}
        ${outputBlock(s.output)}
        ${s.explanation ? `<div class="explanation">${s.explanation}</div>` : ""}
      </div>
    `)
    .join("");

  const lessons = unit.lessons || [];
  const idx = lessons.findIndex((l) => l.id === lesson.id);
  const prev = idx > 0 ? lessons[idx - 1] : null;
  const next = idx < lessons.length - 1 ? lessons[idx + 1] : null;

  let nextHref = null;
  let nextLabel = null;
  if (next) {
    nextHref = `#/unit/${unit.id}/lesson/${next.id}`;
    nextLabel = next.title;
  } else if ((unit.quiz || []).length) {
    nextHref = `#/unit/${unit.id}/quiz`;
    nextLabel = "Practice Quiz";
  } else {
    nextHref = `#/unit/${unit.id}`;
    nextLabel = "Unit overview";
  }

  return `
    <div class="breadcrumb"><a href="#/">Home</a> &rsaquo; <a href="#/unit/${unit.id}">Unit ${unit.number}</a> &rsaquo; Lesson</div>
    <h1>${escapeHtml(lesson.title)}</h1>
    ${sections}
    <div class="lesson-nav">
      ${prev
        ? `<a href="#/unit/${unit.id}/lesson/${prev.id}"><span class="dir">&larr; Previous</span>${escapeHtml(prev.title)}</a>`
        : `<a href="#/unit/${unit.id}"><span class="dir">&larr; Back</span>Unit overview</a>`}
      <a href="${nextHref}"><span class="dir">Next &rarr;</span>${escapeHtml(nextLabel)}</a>
    </div>
  `;
}

function renderQuiz(unit) {
  const container = document.createElement("div");
  const prevResult = Progress.getQuizResult(unit.id);

  container.innerHTML = `
    <div class="breadcrumb"><a href="#/">Home</a> &rsaquo; <a href="#/unit/${unit.id}">Unit ${unit.number}</a> &rsaquo; Quiz</div>
    <h1>${escapeHtml(unit.title)}: Practice Quiz</h1>
    ${prevResult ? `<p class="unit-summary">Best score so far: ${prevResult.best}/${prevResult.total}</p>` : ""}
    <div id="quiz-questions"></div>
    <button class="btn" id="quiz-submit">Check Answers</button>
    <div id="quiz-result"></div>
  `;

  const qWrap = container.querySelector("#quiz-questions");
  (unit.quiz || []).forEach((q, qi) => {
    const choices = q.choices
      .map((choice, ci) => `
        <label class="quiz-choice" data-q="${qi}" data-c="${ci}">
          <input type="radio" name="q${qi}" value="${ci}">
          <span>${escapeHtml(choice)}</span>
        </label>
      `)
      .join("");
    const div = document.createElement("div");
    div.className = "quiz-question";
    div.innerHTML = `
      <div class="q-title">${qi + 1}. ${escapeHtml(q.question)}</div>
      ${choices}
      <div class="quiz-feedback" id="feedback-${qi}"></div>
    `;
    qWrap.appendChild(div);
  });

  const submitBtn = container.querySelector("#quiz-submit");
  submitBtn.addEventListener("click", () => {
    const quiz = unit.quiz || [];
    let score = 0;
    quiz.forEach((q, qi) => {
      const selected = container.querySelector(`input[name="q${qi}"]:checked`);
      const feedback = container.querySelector(`#feedback-${qi}`);
      const labels = container.querySelectorAll(`.quiz-choice[data-q="${qi}"]`);
      labels.forEach((label) => {
        const ci = Number(label.getAttribute("data-c"));
        if (ci === q.answer) label.classList.add("correct");
        else if (selected && Number(selected.value) === ci) label.classList.add("incorrect");
      });
      if (selected && Number(selected.value) === q.answer) {
        score += 1;
        feedback.innerHTML = `<div class="quiz-feedback correct">Correct.</div><div class="quiz-explanation">${escapeHtml(q.explanation || "")}</div>`;
      } else {
        feedback.innerHTML = `<div class="quiz-feedback incorrect">${selected ? "Not quite." : "No answer selected."}</div><div class="quiz-explanation">${escapeHtml(q.explanation || "")}</div>`;
      }
    });
    Progress.saveQuizResult(unit.id, score, quiz.length);
    container.querySelector("#quiz-result").innerHTML = `
      <div class="quiz-summary"><div class="score">${score} / ${quiz.length}</div>Best: ${Progress.getQuizResult(unit.id).best}/${quiz.length}</div>
      <button class="btn secondary" id="quiz-retake">Retake Quiz</button>
    `;
    submitBtn.disabled = true;
    container.querySelector("#quiz-retake").addEventListener("click", () => {
      renderRoute(currentRoute);
    });
    renderSidebar(currentRoute);
  });

  const content = document.getElementById("content");
  content.innerHTML = "";
  content.appendChild(container);
}

function renderFRQList(unit) {
  const cards = (unit.frqs || [])
    .map((frq) => {
      const reviewed = Progress.isFRQReviewed(unit.id, frq.id);
      return `<a class="nav-card" href="#/unit/${unit.id}/frq/${frq.id}">
        <div class="nav-card-kind">Free Response</div>
        <div class="nav-card-title">${escapeHtml(frq.title)}</div>
        <div class="nav-card-meta">${reviewed ? "Reviewed" : "Not reviewed"}</div>
      </a>`;
    })
    .join("");

  return `
    <div class="breadcrumb"><a href="#/">Home</a> &rsaquo; <a href="#/unit/${unit.id}">Unit ${unit.number}</a> &rsaquo; Free Response</div>
    <h1>${escapeHtml(unit.title)}: Free Response Practice</h1>
    <p class="unit-summary">Exam-style free-response questions. Write your own solution, then compare it against the model solution and rubric.</p>
    <div class="card-grid">${cards}</div>
  `;
}

function renderFRQ(unit, frq) {
  const reviewed = Progress.isFRQReviewed(unit.id, frq.id);
  const container = el(`
    <div class="breadcrumb"><a href="#/">Home</a> &rsaquo; <a href="#/unit/${unit.id}">Unit ${unit.number}</a> &rsaquo; <a href="#/unit/${unit.id}/frq">Free Response</a> &rsaquo; ${escapeHtml(frq.title)}</div>
    <h1>${escapeHtml(frq.title)}</h1>
    <div class="frq-prompt">${escapeHtml(frq.prompt)}</div>
    ${frq.starterCode ? `<h2>Starter Code</h2>${codeBlock(frq.starterCode)}` : ""}
    <h2>Your Attempt</h2>
    <textarea class="frq-answer" placeholder="Write your Java solution here. This is for your own practice and is not saved."></textarea>
    <details class="solution-panel" id="solution-panel">
      <summary>Show Model Solution &amp; Rubric</summary>
      <div class="solution-body">
        ${codeBlock(frq.solution)}
        <h3>Rubric</h3>
        <ul class="rubric-list">${(frq.rubric || []).map((r) => `<li>${escapeHtml(r)}</li>`).join("")}</ul>
        ${frq.notes ? `<div class="explanation">${escapeHtml(frq.notes)}</div>` : ""}
      </div>
    </details>
    <div class="reset-row">
      <button class="btn" id="mark-reviewed" ${reviewed ? "disabled" : ""}>${reviewed ? "Marked as Reviewed" : "Mark as Reviewed"}</button>
    </div>
  `);

  container.querySelector("#mark-reviewed").addEventListener("click", () => {
    Progress.markFRQReviewed(unit.id, frq.id);
    renderRoute(currentRoute);
    renderSidebar(currentRoute);
  });

  const content = document.getElementById("content");
  content.innerHTML = "";
  content.appendChild(container);
}

function renderDashboard() {
  const units = getUnits();
  const rows = units
    .map((unit) => {
      const c = Progress.unitCompletion(unit);
      return `<div class="dash-unit-row">
        <span class="unit-num">${unit.number}</span>
        <a href="#/unit/${unit.id}">${escapeHtml(unit.title)}
          <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${c.pct}%"></div></div>
        </a>
        <span class="dash-unit-pct">${c.pct}%</span>
      </div>`;
    })
    .join("");

  const overallPct = Math.round(
    units.reduce((sum, u) => sum + Progress.unitCompletion(u).pct, 0) / (units.length || 1)
  );

  const container = el(`
    <h1>My Progress</h1>
    <p class="unit-summary">Overall course completion: <strong>${overallPct}%</strong></p>
    ${rows}
    <div class="reset-row">
      <button class="btn" id="reset-progress">Reset All Progress</button>
    </div>
  `);

  container.querySelector("#reset-progress").addEventListener("click", () => {
    if (confirm("Reset all lesson, quiz, and free-response progress? This cannot be undone.")) {
      Progress.resetAll();
      renderRoute(currentRoute);
      renderSidebar(currentRoute);
    }
  });

  const content = document.getElementById("content");
  content.innerHTML = "";
  content.appendChild(container);
}

// ---------- Router ----------

let currentRoute = { type: "home" };

function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const parts = hash.split("/").filter(Boolean);

  if (parts[0] === "dashboard") return { type: "dashboard" };
  if (parts[0] === "unit" && parts[1]) {
    const unitId = parts[1];
    if (parts[2] === "lesson" && parts[3]) return { type: "lesson", unitId, itemId: parts[3] };
    if (parts[2] === "quiz") return { type: "quiz", unitId };
    if (parts[2] === "frq" && parts[3]) return { type: "frq", unitId, itemId: parts[3] };
    if (parts[2] === "frq") return { type: "frq-list", unitId };
    return { type: "unit", unitId };
  }
  return { type: "home" };
}

function renderRoute(route) {
  const content = document.getElementById("content");

  if (route.type === "home") {
    content.innerHTML = renderHome();
  } else if (route.type === "dashboard") {
    renderDashboard();
  } else if (route.type === "unit") {
    const unit = getUnit(route.unitId);
    content.innerHTML = unit ? renderUnitOverview(unit) : "<h1>Unit not found</h1>";
  } else if (route.type === "lesson") {
    const unit = getUnit(route.unitId);
    const lesson = unit && (unit.lessons || []).find((l) => l.id === route.itemId);
    content.innerHTML = unit && lesson ? renderLesson(unit, lesson) : "<h1>Lesson not found</h1>";
  } else if (route.type === "quiz") {
    const unit = getUnit(route.unitId);
    if (unit) renderQuiz(unit);
    else content.innerHTML = "<h1>Unit not found</h1>";
  } else if (route.type === "frq-list") {
    const unit = getUnit(route.unitId);
    content.innerHTML = unit ? renderFRQList(unit) : "<h1>Unit not found</h1>";
  } else if (route.type === "frq") {
    const unit = getUnit(route.unitId);
    const frq = unit && (unit.frqs || []).find((f) => f.id === route.itemId);
    if (unit && frq) renderFRQ(unit, frq);
    else content.innerHTML = "<h1>Question not found</h1>";
  } else {
    content.innerHTML = renderHome();
  }

  content.scrollTop = 0;
  content.focus();
}

function handleRouteChange() {
  currentRoute = parseHash();
  if (currentRoute.unitId) openUnitId = currentRoute.unitId;
  renderRoute(currentRoute);
  renderSidebar(currentRoute);
  document.getElementById("sidebar").classList.remove("open");
}

window.addEventListener("hashchange", handleRouteChange);
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sidebar-toggle").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
  handleRouteChange();
});
