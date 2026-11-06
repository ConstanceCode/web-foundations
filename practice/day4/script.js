// Note Counter

// ----- Select elements -----
const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

// ----- Constants -----
const MAX_CHARS = 200;
const WARNING_AT = 180;
const DRAFT_KEY = "note-draft";
const THEME_KEY = "theme";

// ----- localStorage helpers (safe if storage is blocked) -----
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error("Could not save to localStorage:", error);
  }
}

function removeStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Could not remove from localStorage:", error);
  }
}

// ----- Counters -----
function countWords(text) {
  const trimmed = text.trim();
  if (trimmed === "") {
    return 0;
  }
  return trimmed.split(/\s+/).length;
}

function updateCounts() {
  const text = noteText.value;
  const chars = text.length;
  const words = countWords(text);

  charCount.textContent = `${chars} / ${MAX_CHARS} characters`;
  wordCount.textContent = `${words} words`;

  charCount.classList.toggle("warning", chars > WARNING_AT);
  charCount.classList.toggle("over", chars > MAX_CHARS);
}

// ----- Draft -----
function saveDraft() {
  if (noteText.value === "") {
    removeStorage(DRAFT_KEY);
  } else {
    writeStorage(DRAFT_KEY, noteText.value);
  }
}

function clearNote() {
  noteText.value = "";
  removeStorage(DRAFT_KEY);
  updateCounts();
  noteText.focus();
}

// ----- Theme -----
function applyTheme(isDark) {
  document.body.classList.toggle("dark", isDark);
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
}

// ----- Events -----
noteText.addEventListener("input", () => {
  updateCounts();
  saveDraft();
});

noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearNote();
  }
});

clearBtn.addEventListener("click", clearNote);

themeToggle.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark");
  applyTheme(isDark);
  writeStorage(THEME_KEY, isDark ? "dark" : "light");
});

// ----- On page load: restore draft and theme, then update counters -----
const savedDraft = readStorage(DRAFT_KEY);
if (savedDraft !== null) {
  noteText.value = savedDraft;
}
applyTheme(readStorage(THEME_KEY) === "dark");
updateCounts();