

let notes=[];
let editingNoteId = null;

async function loadNotes(){
    try {
        const res = await fetch('/api/notes');
        if (!res.ok) {
            console.error('Error loading notes:', res.status, res.statusText);
            return [];
        }
        const data = await res.json();
        console.log('Loaded notes:', data);
        return data;
    } catch (err) {
        console.error('Error loading notes:', err);
        return [];
    }
}

async function saveNote(event){
    event.preventDefault();

    const title = document.getElementById("noteTitle").value.trim();
    const content = document.getElementById("noteContent").value.trim();

    try {
        if(editingNoteId){
            // update existing note
            console.log('Updating note:', editingNoteId);
            const res = await fetch(`/api/notes/${editingNoteId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to update note');
            }
            console.log('Note updated successfully');
            editingNoteId = null;
        } else {
            // create new note
            console.log('Creating new note');
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to create note');
            }
            console.log('Note created successfully');
        }
        closeNoteDialog();
        await refreshNotes();
    } catch (err) {
        console.error('Error saving note:', err);
        alert('Error saving note: ' + err.message);
    }
}

async function refreshNotes(){
    notes = await loadNotes();
    renderNotes();
}

async function deleteNote(noteId){
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
        const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete note');
        await refreshNotes();
    } catch (err) {
        alert('Error deleting note: ' + err.message);
    }
}

function renderNotes(){
    const notesContainer = document.getElementById("notesContainer");

    if(notes.length === 0){
        notesContainer.innerHTML = `
        <div class="empty-state">
        <h2>No Notes Yet</h2>
        <p>Create your first note by clicking the "Add Note" button.</p>
        <button class="add-note-btn" onclick="openNoteDialog()">Add First Note</button>
        </div>
        `;
        return; 
    }

    notesContainer.innerHTML = notes.map(note => `
        <div class="note-card">
            <h3 class="note-title">${note.title}</h3>
            <p class="note-content">${note.content}</p>
            <div class="note-actions">
                <button class="edit-btn" onclick="openNoteDialog('${note._id}')" title="Edit Note">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button class="delete-btn" onclick="deleteNote('${note._id}')" title="Delete Note">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>
    `).join('');

}

function openNoteDialog(noteId = null){
    const dialog = document.getElementById("noteDialog");
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");

    if(noteId){
        //editing existing note
        const noteToEdit = notes.find(note => note._id === noteId);
        editingNoteId = noteId;
        document.getElementById('dialogTitle').textContent = "Edit Note";
        titleInput.value = noteToEdit.title;
        contentInput.value = noteToEdit.content;
    } else {
        //creating new note
        editingNoteId = null;
        document.getElementById('dialogTitle').textContent = "Add New Note";
        titleInput.value = "";
        contentInput.value = "";
    }    

    dialog.showModal();
    titleInput.focus();

}

function closeNoteDialog(){
    const dialog = document.getElementById("noteDialog");
    dialog.close();
}



function toggleTheme(){
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    document.getElementById("themeToggleBtn").textContent = isDark ? "☀️" : "🌙";
}

function applyStoredTheme(){
    if(localStorage.getItem("theme") === "dark"){
        document.body.classList.add("dark-theme");
        document.getElementById("themeToggleBtn").textContent = "☀️";
    }
}

document.addEventListener("DOMContentLoaded", async function(){
    applyStoredTheme();
    notes = await loadNotes();
    renderNotes();

    document.getElementById('noteForm').addEventListener('submit', saveNote);
    document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

    document.getElementById('noteDialog').addEventListener('close', function(event){
        if(event.target === this){
            closeNoteDialog();
        }
    });

});

window.openNoteDialog = openNoteDialog;
window.closeNoteDialog = closeNoteDialog;
window.deleteNote = deleteNote;
window.saveNote = saveNote;