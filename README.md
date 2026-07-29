# AP CSA Java Companion

A local study app covering all 10 units of the AP Computer Science A curriculum: lessons with worked Java examples, practice quizzes, and exam-style free-response questions with model solutions and rubrics. Progress is tracked per-browser in localStorage.

## Running it

No build step or install required. Either:

- Double-click `index.html` to open it directly in your browser, or
- Serve it locally (recommended, avoids any browser file:// quirks):

  ```
  cd ap-csa-java-app
  python -m http.server 8000
  ```

  then open http://localhost:8000

## Structure

- `index.html`, `css/styles.css` — app shell and styling
- `js/app.js` — hash-based router and all page rendering
- `js/progress.js` — localStorage-backed progress tracking
- `js/units/unit1.js` … `unit10.js` — one file per AP CSA unit (Primitive Types, Using Objects, Boolean Expressions and if Statements, Iteration, Writing Classes, Array, ArrayList, 2D Array, Inheritance, Recursion), each exporting lessons, a 10-question quiz, and 2 free-response practice problems

Use **Reset All Progress** on the My Progress page to clear saved quiz scores and completion state.
