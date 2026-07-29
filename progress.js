// Progress tracking backed by localStorage.
// Shape stored under STORAGE_KEY:
// {
//   lessons: { "unit1:u1-l1": true, ... },
//   quizzes: { "unit1": { best: 8, total: 10, lastAttempt: 8 } },
//   frqs:    { "unit1:u1-frq1": true, ... }
// }

const Progress = (() => {
  const STORAGE_KEY = "apcsa_progress_v1";

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { lessons: {}, quizzes: {}, frqs: {} };
      const parsed = JSON.parse(raw);
      return {
        lessons: parsed.lessons || {},
        quizzes: parsed.quizzes || {},
        frqs: parsed.frqs || {},
      };
    } catch (e) {
      return { lessons: {}, quizzes: {}, frqs: {} };
    }
  }

  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function markLessonComplete(unitId, lessonId) {
    const state = load();
    state.lessons[`${unitId}:${lessonId}`] = true;
    save(state);
  }

  function isLessonComplete(unitId, lessonId) {
    const state = load();
    return !!state.lessons[`${unitId}:${lessonId}`];
  }

  function saveQuizResult(unitId, score, total) {
    const state = load();
    const prev = state.quizzes[unitId];
    const best = prev ? Math.max(prev.best, score) : score;
    state.quizzes[unitId] = { best, total, lastAttempt: score };
    save(state);
  }

  function getQuizResult(unitId) {
    const state = load();
    return state.quizzes[unitId] || null;
  }

  function markFRQReviewed(unitId, frqId) {
    const state = load();
    state.frqs[`${unitId}:${frqId}`] = true;
    save(state);
  }

  function isFRQReviewed(unitId, frqId) {
    const state = load();
    return !!state.frqs[`${unitId}:${frqId}`];
  }

  // Returns { completed, total, pct } across lessons + quiz + frqs for a unit definition.
  function unitCompletion(unit) {
    const state = load();
    let completed = 0;
    let total = 0;

    (unit.lessons || []).forEach((lesson) => {
      total += 1;
      if (state.lessons[`${unit.id}:${lesson.id}`]) completed += 1;
    });

    if ((unit.quiz || []).length) {
      total += 1;
      const q = state.quizzes[unit.id];
      if (q && q.best === q.total) completed += 1;
      else if (q) completed += 0.5;
    }

    (unit.frqs || []).forEach((frq) => {
      total += 1;
      if (state.frqs[`${unit.id}:${frq.id}`]) completed += 1;
    });

    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { completed, total, pct };
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return {
    markLessonComplete,
    isLessonComplete,
    saveQuizResult,
    getQuizResult,
    markFRQReviewed,
    isFRQReviewed,
    unitCompletion,
    resetAll,
  };
})();
