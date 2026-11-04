// ---------------------------------------------------------
// Todo List App — logique principale
// Les tâches sont persistées dans le localStorage du navigateur
// ---------------------------------------------------------

const STORAGE_KEY = "todo-app-tasks";
const THEME_STORAGE_KEY = "todo-app-theme";
const UNDO_TIMEOUT_MS = 6000;

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const countLabel = document.getElementById("todo-count");
const clearCompletedBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filter-btn");
const themeToggleBtn = document.getElementById("theme-toggle");
const undoSnackbar = document.getElementById("undo-snackbar");
const undoMessage = document.getElementById("undo-message");
const undoBtn = document.getElementById("undo-btn");

let todos = loadTodos();
let currentFilter = "all";

/**
 * Suivi de la dernière suppression annulable.
 * @type {{ entries: Array<{todo: object, index: number}>, timeoutId: number } | null}
 */
let pendingUndo = null;

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
      li.className = `todo-item${todo.completed ? " completed" : ""}`;
      li.dataset.id = todo.id;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => toggleTodo(todo.id));

      const span = document.createElement("span");
      span.textContent = todo.text;
      span.title = "Double-cliquez pour modifier la tâche";
      span.addEventListener("dblclick", () => enterEditMode(li, todo));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "✕";
      deleteBtn.setAttribute("aria-label", "Supprimer la tâche");
      deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

      li.append(checkbox, span, deleteBtn);
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
 * Supprime une tâche et propose son annulation via un snackbar.
 * @param {string} id
 */
function deleteTodo(id) {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return;

  const [removed] = todos.splice(index, 1);
  saveTodos();
  render();
  showUndoSnackbar("Tâche supprimée.", [{ todo: removed, index }]);
}

/**
 * Met à jour le texte d'une tâche existante.
 * Si le nouveau texte est vide, la modification est ignorée
 * et le texte précédent est conservé.
 * @param {string} id
 * @param {string} newText
 */
function updateTodoText(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) {
    render();
    return;
  }

  todos = todos.map((todo) =>
    todo.id === id ? { ...todo, text: trimmed } : todo
  );
  saveTodos();
  render();
}

/**
 * Transforme le texte d'une tâche en champ de saisie éditable.
 * Validation : touche "Entrée" ou perte de focus.
 * Annulation : touche "Échap".
 * @param {HTMLLIElement} li
 * @param {{id: string, text: string, completed: boolean}} todo
 */
function enterEditMode(li, todo) {
  const span = li.querySelector("span");
  if (!span) return;

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = todo.text;

  li.replaceChild(editInput, span);
  editInput.focus();
  editInput.select();

  let isCancelled = false;

  const commitEdit = () => {
    if (isCancelled) return;
    updateTodoText(todo.id, editInput.value);
  };

  editInput.addEventListener("blur", commitEdit);
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      editInput.blur();
    } else if (event.key === "Escape") {
      isCancelled = true;
      render();
    }
  });
}

/**
 * Supprime toutes les tâches terminées et propose leur restauration
 * groupée via un snackbar.
 */
function clearCompleted() {
  const removedEntries = [];

  todos = todos.filter((todo, index) => {
    if (!todo.completed) return true;
    removedEntries.push({ todo, index });
    return false;
  });

  if (removedEntries.length === 0) return;

  saveTodos();
  render();

  const label =
    removedEntries.length === 1
      ? "1 tâche terminée supprimée."
      : `${removedEntries.length} tâches terminées supprimées.`;
  showUndoSnackbar(label, removedEntries);
}

// --- Annulation de suppression (snackbar "Annuler") ---

/**
 * Affiche le snackbar d'annulation avec le message donné, et programme
 * sa disparition automatique après un délai. Toute suppression en attente
 * d'annulation précédente est définitivement perdue (son timer est annulé).
 * @param {string} message
 * @param {Array<{todo: object, index: number}>} removedEntries
 */
function showUndoSnackbar(message, removedEntries) {
  if (pendingUndo) {
    clearTimeout(pendingUndo.timeoutId);
  }

  undoMessage.textContent = message;
  undoSnackbar.classList.add("visible");

  const timeoutId = window.setTimeout(hideUndoSnackbar, UNDO_TIMEOUT_MS);
  pendingUndo = { entries: removedEntries, timeoutId };
}

/**
 * Masque le snackbar d'annulation et oublie la suppression en attente.
 */
function hideUndoSnackbar() {
  if (pendingUndo) {
    clearTimeout(pendingUndo.timeoutId);
    pendingUndo = null;
  }
  undoSnackbar.classList.remove("visible");
}

/**
 * Restaure la ou les tâches de la dernière suppression, à leur position
 * d'origine dans la liste, puis masque le snackbar.
 */
function undoLastDeletion() {
  if (!pendingUndo) return;

  [...pendingUndo.entries]
    .sort((a, b) => a.index - b.index)
    .forEach(({ todo, index }) => {
      todos.splice(Math.min(index, todos.length), 0, todo);
    });

  saveTodos();
  render();
  hideUndoSnackbar();
}

/**
 * Charge le thème sauvegardé par l'utilisateur.
 * @returns {"light"|"dark"}
 */
function loadTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
}

/**
 * Applique le thème donné au document et met à jour le bouton toggle.
 * @param {"light"|"dark"} theme
 */
function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);
  themeToggleBtn.textContent = isDark ? "☀️" : "🌙";
  themeToggleBtn.setAttribute(
    "aria-label",
    isDark ? "Activer le mode clair" : "Activer le mode sombre"
  );
}

/**
 * Bascule entre le mode clair et le mode sombre,
 * puis sauvegarde le choix dans le localStorage.
 */
function toggleTheme() {
  const newTheme = document.body.classList.contains("dark-theme")
    ? "light"
    : "dark";
  localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  applyTheme(newTheme);
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

undoBtn.addEventListener("click", undoLastDeletion);

// --- Initialisation ---
applyTheme(loadTheme());
render();
