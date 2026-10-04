// ---------------------------------------------------------------
// Notes Toolkit
// ---------------------------------------------------------------

// Starting data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// Allowed categories (also sets the order used in the summary)
const CATEGORIES = ["personal", "work", "study"];

// Helper: trim, lower-case and collapse repeated spaces
function normalizeText(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

// 1. searchNotes(word): notes whose text contains word, ignoring case
function searchNotes(word) {
  const term = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(term));
}

// 2. longestNote(): the note with the most characters, or null if none
function longestNote() {
  if (notes.length === 0) {
    return null;
  }

  let longest = notes[0];
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

// 3. countByCategory(): { personal: 2, study: 2, work: 1 }
function countByCategory() {
  const counts = {};
  for (const note of notes) {
    if (counts[note.category] === undefined) {
      counts[note.category] = 0;
    }
    counts[note.category] += 1;
  }
  return counts;
}

// 4. getSummary(): "5 notes: 2 personal, 1 work, 2 study."
function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const noun = total === 1 ? "note" : "notes";

  const parts = [];
  for (const category of CATEGORIES) {
    if (counts[category]) {
      parts.push(`${counts[category]} ${category}`);
    }
  }

  if (parts.length === 0) {
    return `${total} ${noun}.`;
  }
  return `${total} ${noun}: ${parts.join(", ")}.`;
}

// 5. isDuplicate(text): same text already exists (ignoring case and extra spaces)
function isDuplicate(text) {
  const cleaned = normalizeText(text);
  return notes.some((note) => normalizeText(note.text) === cleaned);
}

// 6. addNote(text, category): add if valid; return true/false and log the reason
function addNote(text, category) {
  const cleaned = text.trim();

  if (cleaned.length < 1 || cleaned.length > 200) {
    console.log(`Not added: text must be 1-200 characters (got ${cleaned.length}).`);
    return false;
  }

  if (!CATEGORIES.includes(category)) {
    console.log(`Not added: category must be one of ${CATEGORIES.join(", ")} (got "${category}").`);
    return false;
  }

  if (isDuplicate(cleaned)) {
    console.log(`Not added: "${cleaned}" already exists.`);
    return false;
  }

  const nextId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  notes.push({ id: nextId, text: cleaned, category });
  console.log(`Added: "${cleaned}" (${category}).`);
  return true;
}

// ---------------------------------------------------------------
// Tests (open the browser Console to see these)
// ---------------------------------------------------------------

console.log("=== searchNotes ===");
console.log("searchNotes('JAVASCRIPT') -> expect 1 note (id 4):", searchNotes("JAVASCRIPT"));
console.log("searchNotes('the') -> expect 2 notes (ids 2 and 3):", searchNotes("the"));
console.log("searchNotes('xyz') -> expect []:", searchNotes("xyz"));

console.log("=== longestNote ===");
console.log("longestNote() -> expect id 3 (33 characters):", longestNote());
const savedNotes = notes;
notes = [];
console.log("longestNote() on empty array -> expect null:", longestNote());
console.log("getSummary() on empty array -> expect '0 notes.':", getSummary());
notes = savedNotes;

console.log("=== countByCategory ===");
console.log("expect { personal: 2, study: 2, work: 1 }:", countByCategory());

console.log("=== getSummary ===");
console.log("expect '5 notes: 2 personal, 1 work, 2 study.':", getSummary());
notes = [{ id: 1, text: "Only one", category: "work" }];
console.log("one note -> expect '1 note: 1 work.':", getSummary());
notes = savedNotes;

console.log("=== isDuplicate ===");
console.log("isDuplicate('call mum') -> expect true:", isDuplicate("call mum"));
console.log("isDuplicate('  CALL   MUM  ') -> expect true:", isDuplicate("  CALL   MUM  "));
console.log("isDuplicate('Call dad') -> expect false:", isDuplicate("Call dad"));

console.log("=== addNote ===");
console.log("valid note -> expect true:", addNote("Water the plants", "personal"));
console.log("same text, different case -> expect false:", addNote("water the plants", "personal"));
console.log("empty text -> expect false:", addNote("", "work"));
console.log("spaces only -> expect false:", addNote("   ", "work"));
console.log("201 characters -> expect false:", addNote("b".repeat(201), "work"));
console.log("200 characters -> expect true:", addNote("a".repeat(200), "work"));
console.log("bad category -> expect false:", addNote("Go for a run", "hobby"));

console.log("=== After adding ===");
console.log("expect 7 notes:", notes.length);
console.log("expect { personal: 3, study: 2, work: 2 }:", countByCategory());
console.log("expect '7 notes: 3 personal, 2 work, 2 study.':", getSummary());
