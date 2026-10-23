// ---------------------------------------------------------
// Todo List App — logique principale
// Les tâches sont persistées dans le localStorage du navigateur
// ---------------------------------------------------------

const STORAGE_KEY = "todo-app-tasks";
const THEME_STORAGE_KEY = "todo-app-theme";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countLabel = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeToggleBtn = document.getElementById("theme-toggle");

let todos = loadTodos();
let currentFilter = "all";

/**
 * Charge les tâches depuis le localStorage.
 * @returns {Array<{id: string, text: string, completed: boolean, priority?: boolean}>}
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
 * Retourne les tâches filtrées selon le filtre actif, avec les tâches
 * prioritaires remontées en tête de liste (tri stable).
 */
function getFilteredTodos() {
  let filtered;

  switch (currentFilter) {
    case "active":
      filtered = todos.filter((todo) => !todo.completed);
      break;
    case "completed":
      filtered = todos.filter((todo) => todo.completed);
      break;
    default:
      filtered = todos;
  }

  return [...filtered].sort(
    (a, b) => (b.priority ? 1 : 0) - (a.priority ? 1 : 0)
  );
}

/**
 * Retourne le message à afficher lorsque la liste filtrée est vide.
 * @returns {string}
 */
function getEmptyStateMessage() {
  switch (currentFilter) {
    case "active":
      return "Aucune tâche en cours. Bien joué ! 🎉";
    case "completed":
      return "Aucune tâche terminée pour le moment.";
    default:
      return "Votre liste est vide. Ajoutez votre première tâche ! ✨";
  }
}

/**
 * Remplace le texte d'une tâche par un champ de saisie éditable.
 * @param {HTMLElement} li
 * @param {{id: string, text: string}} todo
 */
function enableEditMode(li, todo) {
  const span = li.querySelector("span");

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;

  li.replaceChild(editInput, span);
  editInput.focus();
  editInput.setSelectionRange(editInput.value.length, editInput.value.length);

  const commitEdit = () => {
    updateTodoText(todo.id, editInput.value);
  };

  editInput.addEventListener("blur", commitEdit);
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      editInput.blur();
    } else if (event.key === "Escape") {
      event.preventDefault();
      render(); // annule l'édition sans sauvegarder
    }
  });
}

/**
 * Affiche la liste des tâches dans le DOM.
 */
function render() {
  list.innerHTML = "";

  const filteredTodos = getFilteredTodos();

  if (filteredTodos.length === 0) {
    const emptyState = document.createElement("li");
    emptyState.className = "empty-state";
    emptyState.textContent = getEmptyStateMessage();
    list.appendChild(emptyState);
  } else {
    filteredTodos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = `todo-item${todo.completed ? " completed" : ""}${
        todo.priority ? " priority" : ""
      }`;
      li.dataset.id = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => toggleTodo(todo.id));

      const priorityBtn = document.createElement("button");
      priorityBtn.className = "priority-btn";
      priorityBtn.textContent = todo.priority ? "⭐" : "☆";
      priorityBtn.setAttribute(
        "aria-label",
        todo.priority ? "Retirer la priorité" : "Marquer comme prioritaire"
      );
      priorityBtn.title = todo.priority
        ? "Retirer la priorité"
        : "Marquer comme prioritaire";
      priorityBtn.addEventListener("click", () => togglePriority(todo.id));

      const span = document.createElement("span");
      span.textContent = todo.text;
      span.title = "Double-cliquez pour modifier";
      span.addEventListener("dblclick", () => enableEditMode(li, todo));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "✕";
      deleteBtn.setAttribute("aria-label", "Supprimer la tâche");
      deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

      li.append(checkbox, priorityBtn, span, deleteBtn);
      list.appendChild(li);
    });
  }

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

  todos.push({
    id: generateId(),
    text: trimmed,
    completed: false,
    priority: false,
  });
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
 * Bascule l'état "prioritaire" d'une tâche.
 * @param {string} id
 */
function togglePriority(id) {
  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, priority: !todo.priority } : todo
  );
  saveTodos();
  render();
}

/**
 * Met à jour le texte d'une tâche existante.
 * Si le nouveau texte est vide, la tâche est supprimée.
 * @param {string} id
 * @param {string} newText
 */
function updateTodoText(id, newText) {
  const trimmed = newText.trim();

  if (!trimmed) {
    deleteTodo(id);
    return;
  }

  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, text: trimmed } : todo
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

// --- Gestion du thème (clair / sombre) ---

/**
 * Applique le thème donné au document et met à jour l'icône du bouton.
 * @param {"light" | "dark"} theme
 */
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  themeToggleBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

/**
 * Initialise le thème depuis le localStorage, ou selon les préférences système.
 */
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const theme = savedTheme || (prefersDark ? "dark" : "light");
  applyTheme(theme);
}

/**
 * Bascule entre thème clair et sombre, et sauvegarde le choix.
 */
function toggleTheme() {
  const isDark = document.body.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  localStorage.setItem(THEME_STORAGE_KEY, newTheme);
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

themeToggleBtn.addEventListener("click", toggleTheme);

// --- Initialisation ---
initTheme();
render();
