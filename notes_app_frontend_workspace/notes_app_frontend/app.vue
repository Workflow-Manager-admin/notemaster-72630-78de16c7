<template>
  <div :class="['app-container', { 'sidebar-collapsed': sidebarCollapsed }]">
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="logo">📝</span>
        <span class="app-title">NoteMaster</span>
      </div>
      <nav>
        <ul>
          <li :class="{active: activeNoteId === null}" @click="createNewNote">
            <span class="plus-icon">+</span> New Note
          </li>
          <li
            v-for="note in notes"
            :key="note.id"
            :class="{ active: note.id === activeNoteId }"
            @click="selectNote(note.id)"
          >
            <span class="note-title">{{ note.title || 'Untitled' }}</span>
            <span
              class="delete-btn"
              title="Delete note"
              @click.stop="deleteNote(note.id)"
            >×</span>
          </li>
        </ul>
      </nav>
    </aside>
    <div class="main-content">
      <header class="header">
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <span v-if="!sidebarCollapsed">☰</span>
          <span v-else>→</span>
        </button>
        <span class="header-title">
          {{ headerTitle }}
        </span>
      </header>
      <section class="content">
        <form v-if="editingNote" class="note-form" @submit.prevent="saveNote">
          <input
            v-model="editingNote.title"
            class="note-title-input"
            placeholder="Note Title"
            :style="{ borderColor: theme.primary }"
            maxlength="64"
            required
            autocomplete="off"
          />
          <textarea
            v-model="editingNote.content"
            class="note-content-input"
            placeholder="Type your note here..."
            rows="13"
            :style="{ borderColor: theme.primary }"
            required
          ></textarea>
          <div class="note-form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :style="{background: theme.primary, color: '#fff'}"
            >Save</button>
            <button
              type="button"
              class="btn btn-accent"
              :style="{background: theme.accent, color: '#222'}"
              @click="cancelEdit"
            >Cancel</button>
          </div>
        </form>
        <div v-else-if="selectedNote" class="note-view">
          <h2 class="view-title">{{ selectedNote.title }}</h2>
          <pre class="view-content">{{ selectedNote.content }}</pre>
          <button
            class="btn btn-secondary"
            :style="{background: theme.secondary, color: '#fff'}"
            @click="startEdit(selectedNote)"
          >Edit</button>
        </div>
        <div v-else class="empty-state">
          <span class="empty-icon">🗒️</span>
          <div>No note selected</div>
          <button
            class="btn btn-primary"
            :style="{background: theme.primary, color: '#fff'}"
            @click="createNewNote"
          >Create Note</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
// PUBLIC_INTERFACE
/**
 * NoteMaster - Nuxt Notes App Main Component
 * - Sidebar for navigation + notes list
 * - Main area for viewing/editing notes
 * - Minimal, modern, light theme
 */

import { ref, computed } from 'vue'

type Note = { id: number, title: string, content: string }

const LOCAL_STORAGE_KEY = 'notemaster-notes'
const notes = ref<Note[]>([])
const selectedNoteId = ref<number|null>(null)
const editing = ref(false)
const editingNote = ref<Note|null>(null)
const sidebarCollapsed = ref(false)
const theme = {
  primary: '#42b883',
  secondary: '#35495e',
  accent: '#ffca28',
}

function loadNotes() {
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
  notes.value = raw ? JSON.parse(raw) : []
}
function saveNotes() {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes.value))
}
function createNewNote() {
  editing.value = true
  editingNote.value = { id: 0, title: '', content: '' }
  selectedNoteId.value = null
}
function selectNote(id: number) {
  editing.value = false
  editingNote.value = null
  selectedNoteId.value = id
}
function startEdit(note: Note) {
  editing.value = true
  // clone the note, so changes don't affect stored version before save
  editingNote.value = { ...note }
}
function saveNote() {
  if (!editingNote.value) return
  if (editingNote.value.id) {
    // Update
    const idx = notes.value.findIndex(n => n.id === editingNote.value!.id)
    if (idx !== -1) notes.value[idx] = { ...editingNote.value }
    selectedNoteId.value = editingNote.value.id
  } else {
    // Create
    const id = Date.now()
    const note = { ...editingNote.value, id }
    notes.value.unshift(note)
    selectedNoteId.value = id
  }
  saveNotes()
  editing.value = false
  editingNote.value = null
}
function deleteNote(id: number) {
  if (!confirm('Delete this note?')) return
  notes.value = notes.value.filter(n => n.id !== id)
  if (selectedNoteId.value === id) selectedNoteId.value = null
  saveNotes()
}
function cancelEdit() {
  editing.value = false
  editingNote.value = null
}
const activeNoteId = computed(() => {
  return editing.value ? null : selectedNoteId.value
})
const selectedNote = computed(() => {
  return selectedNoteId.value ? notes.value.find(n => n.id === selectedNoteId.value) || null : null
})
const headerTitle = computed(() => {
  if (editing.value) return editingNote.value!.id ? 'Edit Note' : 'New Note'
  if (selectedNote.value) return selectedNote.value.title || 'Untitled'
  return 'Welcome!'
})

onMounted(() => {
  loadNotes()
})
watch(notes, saveNotes, { deep: true })
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafb;
  font-family: 'Inter', 'Segoe UI', 'Helvetica', Arial, sans-serif;
}
.sidebar {
  min-width: 220px;
  width: 224px;
  background: #fff;
  border-right: 1.5px solid #eaecef;
  display: flex;
  flex-direction: column;
  transition: width 0.2s;
}
.sidebar-collapsed .sidebar {
  width: 52px;
  min-width: 52px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 24px 18px 12px 18px;
  color: #35495e;
  font-weight: 700;
  font-size: 1.19rem;
  border-bottom: 1px solid #f1f1f3;
}
.logo {
  font-size: 1.42em;
}
.app-title {
  letter-spacing: 0.01em;
  transition: opacity 0.3s;
}
.sidebar-collapsed .app-title {
  opacity: 0;
}
.sidebar nav {
  flex: 1 1;
  overflow-y: auto;
}
.sidebar ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.sidebar li {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  transition: background 0.18s;
  padding: 0.7em 1.15em;
  font-weight: 500;
  color: #35495e;
  font-size: 1.03em;
}
.sidebar li.active, .sidebar li:hover {
  background: #f6f8fa;
  color: #42b883;
}
.plus-icon {
  font-size: 1.1em;
  color: #ffca28;
  margin-right: 0.5em;
}
.note-title {
  flex: 1 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.delete-btn {
  color: #e57373;
  font-size: 1.2em;
  margin-left: 0.6em;
  padding: 2px 6px;
  border-radius: 3px;
  transition: background 0.1s;
}
.delete-btn:hover {
  background: #fee;
  color: #b50928;
}
.main-content {
  flex: 1 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #f8fafb;
}
.header {
  display: flex;
  align-items: center;
  height: 63px;
  border-bottom: 1.5px solid #eaecef;
  padding: 0 2rem;
  background: #fff;
  gap: 1.7rem;
}
.collapse-btn {
  font-size: 1.45em;
  background: transparent;
  border: none;
  color: #42b883;
  cursor: pointer;
  margin-right: 0.2em;
}
.header-title {
  font-size: 1.13em;
  color: #35495e;
  font-weight: 600;
  opacity: 0.91;
}
.content {
  flex: 1 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2.4em 1em 1em 1em;
}
.note-form, .note-view, .empty-state {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 4px 0 #e0edec35;
  padding: 2.2em 2.3em 1.6em 2.3em;
  max-width: 550px;
  width: 100%;
  min-height: 360px;
  display: flex;
  flex-direction: column;
  gap: 1.25em;
}
.note-title-input, .note-content-input {
  border: 1.5px solid #eaecef;
  border-radius: 6px;
  padding: 10px 1em;
  width: 100%;
  resize: none;
  margin-bottom: 0.7em;
  font-size: 1.015em;
  background: #f9fdfc;
  color: #222;
  transition: border-color 0.22s;
  outline: none;
}
.note-title-input:focus,
.note-content-input:focus {
  border-color: #42b883;
  background: #fff;
}
.note-form-actions {
  margin-top: 1.2em;
  display: flex;
  gap: 1em;
  justify-content: flex-end;
}
.btn {
  border: none;
  border-radius: 4px;
  padding: 0.56em 1.7em;
  font-size: 1.01em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.16s;
}
.btn-primary { background: #42b883; color: #fff; }
.btn-secondary { background: #35495e; color: #fff; }
.btn-accent { background: #ffca28; color: #222; }
.btn:active { filter: brightness(0.93); }
.note-view .view-title {
  margin: 0 0 0.6em 0;
  color: #42b883;
  font-weight: 700;
  font-size: 1.5em;
}
.note-view .view-content {
  margin-bottom: 1.3em;
  background: #f7f7ff;
  border-radius: 8px;
  font-family: inherit;
  font-size: 1.03em;
  padding: 9px 12px;
  color: #333;
  white-space: pre-wrap;
  min-height: 125px;
}
.empty-state {
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  color: #aaa;
  min-height: 320px;
  gap: 1em;
}
.empty-icon {
  font-size: 2.45em;
  color: #42b883;
}
@media (max-width: 900px) {
  .content {
    padding: 1.4em .4em 1em .4em;
  }
  .note-form, .note-view, .empty-state {
    max-width: 98vw;
    padding: 1.4em 0.4em 1em 0.4em;
  }
  .sidebar { min-width: 52px; width: 14vw; }
}
@media (max-width: 600px) {
  .app-container { flex-direction: column; }
  .sidebar {
    width: 100vw;
    min-width: 0;
    flex-direction: row;
    border-right: none;
    border-bottom: 1.5px solid #eaecef;
    height: 55px;
    padding: 0;
    z-index: 2;
  }
  .sidebar-header { display: none; }
  .sidebar nav { flex: 1 1; }
  .sidebar ul {
    display: flex;
    flex-direction: row;
    width: 100vw;
    justify-content: space-around;
    align-items: center;
    gap: 0.5em;
  }
  .sidebar li { padding: 0.9em 0.7em; font-size: 0.99em; }
  .main-content { margin-top: 0; }
  .header { padding: 0 1.1em; }
}
::-webkit-scrollbar { width: 8px; background: #f1f1f1;}
::-webkit-scrollbar-thumb { background: #e2e2e2; border-radius: 7px;}
</style>
