let notes = [];
let editingNoteId = null;

// =========================
// Load Notes
// =========================
async function loadNotes() {
  try {
    const res = await fetch('/api/notes');
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    console.error('Error loading notes:', err);
    return [];
  }
}

// =========================
// Save Note (Create or Update)
// =========================
async function saveNote(event) {
  event.preventDefault();

  const title = document.getElementById("noteTitle").value.trim();
  const content = document.getElementById("noteContent").value.trim();
  const color = document.getElementById("noteColor").value;

  const payload = { title, content, color };

  try {
    if (editingNoteId) {
      // Update existing note
      const res = await fetch(`/api/notes/${editingNoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update note');

      editingNoteId = null;
    } else {
      // Create new note
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create note');
    }

    closeNoteDialog();
    await refreshNotes();
  } catch (err) {
    alert('Error saving note: ' + err.message);
  }
}

// =========================
// Refresh Notes
// =========================
async function refreshNotes() {
  notes = await loadNotes();
  renderNotes();
}

// =========================
// Delete Note
// =========================
async function deleteNote(noteId) {
  if (!confirm('Are you sure you want to delete this note?')) return;

  try {
    const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete note');

    await refreshNotes();
  } catch (err) {
    alert('Error deleting note: ' + err.message);
  }
}

// =========================
// Render Notes
// =========================
function renderNotes() {
  const notesContainer = document.getElementById("notesContainer");

  if (notes.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <h2>No Notes Yet</h2>
        <p>Create your first note by clicking the "Add Note" button.</p>
        <button class="add-note-btn" onclick="openNoteDialog()">Add First Note</button>
      </div>
    `;
    return;
  }

  // Detect if a color is light or dark
  function isColorLight(hex) {
    const c = hex.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  }

  notesContainer.innerHTML = notes.map(note => {
    const light = isColorLight(note.color);

    // Dark text for light notes, light text for dark notes
    const textColor = light ? "#1A1624" : "#F2ECFF";

    return `
      <div class="note-card" style="background:${note.color}; color:${textColor}">
        
        <h3 class="note-title" style="color:${textColor}">${note.title}</h3>

        <p class="note-content" style="color:${textColor}">${note.content}</p>
        <div class="note-actions">
          <button class="edit-btn" onclick="openNoteDialog('${note._id}')">
            <i class="fa-solid fa-pen" style="color:${textColor}"></i>
          </button>
          <button class="delete-btn" onclick="deleteNote('${note._id}')">
            <i class="fa-solid fa-trash" style="color:${textColor}"></i>
          </button>
        </div>

      </div>
    `;
  }).join('');
}

// =========================
// Open Note Dialog
// =========================
function openNoteDialog(noteId = null) {
  const dialog = document.getElementById("noteDialog");
  const titleInput = document.getElementById("noteTitle");
  const contentInput = document.getElementById("noteContent");
  const colorInput = document.getElementById("noteColor");

  if (noteId) {
    const note = notes.find(n => n._id === noteId);
    editingNoteId = noteId;

    document.getElementById('dialogTitle').textContent = "Edit Note";
    titleInput.value = note.title;
    contentInput.value = note.content;
    colorInput.value = note.color || "#ffffff";
  } else {
    editingNoteId = null;

    document.getElementById('dialogTitle').textContent = "Add New Note";
    titleInput.value = "";
    contentInput.value = "";
    colorInput.value = "#ffffff";
  }

  dialog.showModal();
  titleInput.focus();
}

// =========================
// Close Note Dialog
// =========================
function closeNoteDialog() {
  const dialog = document.getElementById("noteDialog");
  dialog.close();
}

// =========================
// Theme Toggle
// =========================
function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  document.getElementById("themeToggleBtn").textContent = isDark ? "☀️" : "🌙";
}

function applyStoredTheme() {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
    document.getElementById("themeToggleBtn").textContent = "☀️";
  }
}

// =========================
// Color Palette Click Handler
// =========================
function setupColorPalette() {
  document.querySelectorAll(".color-swatch").forEach(swatch => {
    swatch.addEventListener("click", () => {
      document.getElementById("noteColor").value = swatch.dataset.color;
    });
  });
}

// =========================
// DOM Ready
// =========================
document.addEventListener("DOMContentLoaded", async function () {
  applyStoredTheme();
  setupColorPalette();

  notes = await loadNotes();
  renderNotes();

  document.getElementById('noteForm').addEventListener('submit', saveNote);
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

  document.getElementById('noteDialog').addEventListener('close', function (event) {
    if (event.target === this) closeNoteDialog();
  });
});

// Expose functions globally
window.openNoteDialog = openNoteDialog;
window.closeNoteDialog = closeNoteDialog;
window.deleteNote = deleteNote;
window.saveNote = saveNote;