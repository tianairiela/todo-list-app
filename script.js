// ---------------------------------------------------------
// Todo List App — logique principale
// Les tâches sont persistées dans le localStorage du navigateur
// ---------------------------------------------------------

const STORAGE_KEY = "todo-app-tasks";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countLabel = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");

let todos = loadTodos();
let currentFilter = "all";

/**
 * Charge les tâches depuis le localStorage.
 * @returns {Array<{id: string, text: string, completed: boolean}>}
 */
function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Sauvegarde les tâches dans le localStorage.
 */
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/**
 * Génère un identifiant unique pour chaque tâche.
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Retourne les tâches filtrées selon le filtre actif.
 */
function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

/**
 * Affiche la liste des tâches dans le DOM.
 */
function render() {
  list.innerHTML = "";

  const filteredTodos = getFilteredTodos();

  filteredTodos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = `todo-item${todo.completed ? " completed" : ""}`;
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const span = document.createElement("span");
    span.textContent = todo.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "✕";
    deleteBtn.setAttribute("aria-label", "Supprimer la tâche");
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.append(checkbox, span, deleteBtn);
    list.appendChild(li);
  });

  const remaining = todos.filter((todo) => !todo.completed).length;
  countLabel.textContent = `${remaining} tâche(s) restante(s)`;
}

/**
 * Ajoute une nouvelle tâche.
 * @param {string} text
 */
function addTodo(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.push({ id: generateId(), text: trimmed, completed: false });
  saveTodos();
  render();
}

/**
 * Bascule l'état "terminé" d'une tâche.
 * @param {string} id
 */
function toggleTodo(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  saveTodos();
  render();
}

/**
 * Supprime une tâche.
 * @param {string} id
 */
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  render();
}

/**
 * Supprime toutes les tâches terminées.
 */
function clearCompleted() {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
}

// --- Écouteurs d'évènements ---

form.addEventListener("submit", (event) => {
  event.preventDefault();
  addTodo(input.value);
  input.value = "";
  input.focus();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.dataset.filter;
    render();
  });
});

// --- Rendu initial ---
render();
