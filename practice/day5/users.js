// User Directory

// ----- Select elements -----
const loadButton = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusMessage = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// ----- Constants and state -----
const USERS_URL = "https://jsonplaceholder.typicode.com/users";

// All loaded users are stored here, so filtering never needs a new request
let users = [];

// ----- Helpers -----
function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = type;
}

// Create a <p> with a label and a value, using textContent only
function createLine(label, value) {
  const line = document.createElement("p");
  line.textContent = `${label}: ${value}`;
  return line;
}

// ----- Rendering -----
// Draws any array of users into the list
function renderUsers(list) {
  usersList.textContent = "";

  if (list.length === 0) {
    // Only say "no match" when users are loaded but none pass the filter
    if (users.length > 0) {
      const message = document.createElement("li");
      message.textContent = "No users match your filter.";
      usersList.appendChild(message);
    }
    return;
  }

  for (const user of list) {
    const item = document.createElement("li");

    const name = document.createElement("h2");
    name.textContent = user.name;

    const city = user.address && user.address.city ? user.address.city : "Unknown";
    const company = user.company && user.company.name ? user.company.name : "Unknown";

    item.append(
      name,
      createLine("Email", user.email),
      createLine("City", city),
      createLine("Company", company)
    );
    usersList.appendChild(item);
  }
}

// Filter the stored array by name (not case-sensitive) and redraw
function applyFilter() {
  const term = filterInput.value.trim().toLowerCase();
  const matches = users.filter((user) => user.name.toLowerCase().includes(term));
  renderUsers(matches);
}

// ----- Loading -----
async function loadUsers() {
  loadButton.disabled = true;
  setStatus("Loading users...", "loading");

  try {
    const response = await fetch(USERS_URL);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    users = await response.json();
    applyFilter();
    setStatus(`Loaded ${users.length} users.`, "success");
  } catch (error) {
    console.error("Could not load users:", error);
    setStatus("Could not load users. Please check your connection and try again.", "error");
  } finally {
    loadButton.disabled = false;
  }
}

// ----- Events -----
loadButton.addEventListener("click", loadUsers);
filterInput.addEventListener("input", applyFilter);