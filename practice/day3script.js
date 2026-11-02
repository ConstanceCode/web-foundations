// ---------------------------------------------------------------
// Notes Toolkit
// ---------------------------------------------------------------

// 1. Starting data
let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

// Allowed categories (the order is also used in the summary)
const CATEGORIES = ["personal", "work", "study"];

// Helper: trim, lower-case and collapse repeated spaces
function normalizeText(text) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

// 2. searchNotes(word): notes whose text contains word, ignoring case
function searchNotes(word) {
  const term = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(term));
}

// 3. longestNote(): the note with the most characters, or null if none
function longestNote() {
  // Handle the empty array first
  if (notes.length === 0) {
    return null;
  }

  // Then compare lengths
  let longest = notes[0];
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

// 4. countByCategory(): e.g. { personal: 2, study: 2, work: 1 }
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

// 5. getSummary(): e.g. "5 notes: 2 personal, 1 work, 2 study."
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

// 6. isDuplicate(text): true if the same text already exists
//    (ignoring case and extra spaces)
function isDuplicate(text) {
  const cleaned = normalizeText(text);
  return notes.some((note) => normalizeText(note.text) === cleaned);
}

// 7. addNote(text, category): adds a valid note, returns true/false,
//    and logs the reason when it is not added
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
  notes.push({ id: nextId, text: cleaned, category: category });
  return true;
}

// ---------------------------------------------------------------
// 8. Tests (open the browser Console to see the results)
// Expected output is written in the comment next to each call.
// ---------------------------------------------------------------

const originalNotes = notes; // so edge-case tests can swap the array and restore it

console.log("=== searchNotes ===");
console.log(searchNotes("JAVASCRIPT")); // [ { id: 4, text: "Revise JavaScript arrays", category: "study" } ]
console.log(searchNotes("the")); // 2 notes: id 2 ("Finish the Day 3 assignment") and id 3 ("Email the project report to Grace")
console.log(searchNotes("xyz")); // [] (no results)

console.log("=== longestNote ===");
console.log(longestNote()); // { id: 3, text: "Email the project report to Grace", category: "work" }
notes = [];
console.log(longestNote()); // null (empty array)
notes = originalNotes;

console.log("=== countByCategory ===");
console.log(countByCategory()); // { personal: 2, study: 2, work: 1 }
notes = [];
console.log(countByCategory()); // {} (empty array)
notes = originalNotes;

console.log("=== getSummary ===");
console.log(getSummary()); // "5 notes: 2 personal, 1 work, 2 study."
notes = [{ id: 1, text: "Only one", category: "work" }];
console.log(getSummary()); // "1 note: 1 work." (singular)
notes = [];
console.log(getSummary()); // "0 notes." (empty array)
notes = originalNotes;

console.log("=== isDuplicate ===");
console.log(isDuplicate("call mum")); // true (different case)
console.log(isDuplicate("  CALL   MUM  ")); // true (extra spaces and case)
console.log(isDuplicate("Call dad")); // false (not in the list)

console.log("=== addNote ===");
console.log(addNote("Water the plants", "personal")); // true
console.log(addNote("water the plants", "personal")); // logs: Not added: "water the plants" already exists. then prints false
console.log(addNote("", "work")); // logs: Not added: text must be 1-200 characters (got 0). then prints false
console.log(addNote("   ", "work")); // logs: Not added: text must be 1-200 characters (got 0). then prints false
console.log(addNote("b".repeat(201), "work")); // logs: Not added: text must be 1-200 characters (got 201). then prints false
console.log(addNote("a".repeat(200), "work")); // true (exactly 200 characters is allowed)
console.log(addNote("Go for a run", "hobby")); // logs: Not added: category must be one of personal, work, study (got "hobby"). then prints false

console.log("=== After adding ===");
console.log(notes.length); // 7
console.log(countByCategory()); // { personal: 3, study: 2, work: 2 }
console.log(getSummary()); // "7 notes: 3 personal, 2 work, 2 study."
