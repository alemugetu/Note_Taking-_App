import type { JSX } from "react";
import "bootstrap/dist/css/bootstrap.min.css"
import { Routes, Route, Navigate, Link } from "react-router-dom";
import { NewNotes } from "./NewNotes";
import { NoteList } from "./NoteList";
import { useState, useEffect } from "react";
import { NoteLayout } from "./NoteLayout";
import { Note } from "./Note";
import { EditNote } from "./EditNote";
import { notesApi, tagsApi, notebooksApi, notificationsApi } from "./api";
import { Notifications } from './Notifications';
import { NotificationCenter } from './NotificationCenter';
import { Toasts } from './Toasts';
import { PushSettings } from './PushSettings';
import { Settings } from './Settings';
import { v4 as uuidv4 } from "uuid";
import { AuthProvider, useAuth } from './AuthContext';
import { Login } from './Login';
import { Register } from './Register';
import { LandingPage } from './LandingPage';
import { SharedNote } from './SharedNote';
import { Button } from "react-bootstrap"; // Added for logout button

export type NoteType = {
  id: string
} & NoteData

export type NoteData = {
  title: string
  content: string
  tags: Tag[]
  color?: string
  pinned?: boolean
  createdAt?: string
  updatedAt?: string
  attachments?: Array<{ url: string; publicId?: string; filename?: string; fileType?: string; size?: number }>
  reminder?: { date?: string; notified?: boolean }
  notebook?: { id: string; name: string } | null
  share?: { public: boolean; link?: string; access?: string }
}

export type Tag = {
  id: string
  label: string
}



function MainApp() {
  const [notes, setNotes] = useState<NoteType[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [notebooks, setNotebooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<any[]>([])
  const [toasts, setToasts] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>(() => {
    try {
      const raw = localStorage.getItem('note_templates')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, tagsRes, notebooksRes] = await Promise.all([
          notesApi.getAll(),
          tagsApi.getAll(),
          notebooksApi.getAll()
        ])

        const mappedTags = tagsRes.data.data.map((tag: any) => ({
          id: tag._id,
          label: tag.name
        }))

        const mappedNotes = notesRes.data.data.map((note: any) => ({
          id: note._id,
          title: note.title || "",
          content: note.content || "",
          tags: (note.tags || []).map((tag: any) => ({
            id: tag?._id || tag,
            label: tag?.name || "Unknown Tag"
          })),
          color: note.color || '#ffffff',
          pinned: note.pinned || false,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
          reminder: note.reminder || null,
          notebook: note.notebook ? { id: note.notebook._id, name: note.notebook.name } : null,
          attachments: (note.attachments || []).map((a: any) => ({ url: a.url, publicId: a.publicId, filename: a.filename, fileType: a.fileType, size: a.size }))
        }))

        const mappedNotebooks = (notebooksRes.data.data || []).map((nb: any) => ({ id: nb._id, name: nb.name, parent: nb.parent || null }))

        setTags(mappedTags)
        setNotes(mappedNotes)
        setNotebooks(mappedNotebooks)
        // fetch notifications for current user (optional)
        try {
          const notifRes = await notificationsApi.getAll()
          setNotifications(notifRes.data.data || [])
        } catch (e) {
          // ignore if unauthenticated or endpoint fails
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Poll for notifications every 30s and create toasts for new items
  useEffect(() => {
    let mounted = true
    let prevIds = new Set(notifications.map((n: any) => n._id))

    async function poll() {
      try {
        const res = await notificationsApi.getAll()
        if (!mounted) return
        const list = res.data.data || []
        // find new ids
        const added = list.filter((n: any) => !prevIds.has(n._id))
        if (added.length > 0) {
          // show toasts for newly added notifications
          setToasts(prev => [...added, ...prev].slice(0, 6))
        }
        prevIds = new Set(list.map((n: any) => n._id))
        setNotifications(list)
      } catch (err) {
        // ignore
      }
    }

    const id = setInterval(poll, 30000)
    // run once after mount
    poll()
    return () => { mounted = false; clearInterval(id) }
  }, []) // eslint-disable-next-line react-hooks/exhaustive-deps

  async function searchNotes(params: any) {
    try {
      const res = await notesApi.getAll(params)
      const mappedNotes = res.data.data.map((note: any) => ({
        id: note._id,
        title: note.title || "",
        content: note.content || "",
        tags: (note.tags || []).map((tag: any) => ({
          id: tag?._id || tag,
          label: tag?.name || "Unknown Tag"
        })),
        color: note.color || '#ffffff',
        pinned: note.pinned || false,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        reminder: note.reminder || null,
        notebook: note.notebook ? { id: note.notebook._id, name: note.notebook.name } : null,
        attachments: (note.attachments || []).map((a: any) => ({ url: a.url, publicId: a.publicId, filename: a.filename, fileType: a.fileType, size: a.size }))
      }))
      setNotes(mappedNotes)
    } catch (err) {
      console.error('Search error', err)
    }
  }

  useEffect(() => {
    function handler(e: any) {
      const { id, updated } = e.detail || {}
      if (!id) return
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n))
    }
    window.addEventListener('note-updated', handler as EventListener)
    return () => window.removeEventListener('note-updated', handler as EventListener)
  }, [])

  async function onCreateNote(data: NoteData) {
    try {
      const res = await notesApi.create({
        title: data.title,
        content: data.content,
        tags: data.tags.map(tag => tag.id),
        color: data.color || '#ffffff',
        attachments: (data.attachments || []).map(a => ({ url: a.url, filename: a.filename, publicId: a.publicId, fileType: a.fileType, size: a.size }))
      })

      const createdNote = res.data.data;
      const newNote = {
        id: createdNote._id,
        title: createdNote.title || "",
        content: createdNote.content || "",
        tags: (createdNote.tags || []).map((tag: any) => ({
          id: tag?._id || tag,
          label: tag?.name || "Unknown Tag"
        })),
        color: createdNote.color || '#ffffff'
        ,
        pinned: createdNote.pinned || false
        ,
        attachments: (createdNote.attachments || []).map((a: any) => ({ url: a.url, publicId: a.publicId, filename: a.filename, fileType: a.fileType, size: a.size })),
        reminder: createdNote.reminder || null
      }

      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (error) {
      console.error("Error creating note:", error)
    }
  }

  async function createNotebook(data: { name: string; description?: string; parent?: string }) {
    try {
      const res = await notebooksApi.create(data)
      const nb = res.data.data
      setNotebooks(prev => [{ id: nb._id, name: nb.name, parent: nb.parent || null }, ...prev])
      return nb
    } catch (err) { console.error('Error creating notebook', err) }
  }

  async function updateNotebook(id: string, data: any) {
    try {
      const res = await notebooksApi.update(id, data)
      const nb = res.data.data
      setNotebooks(prev => prev.map(n => n.id === id ? { id: nb._id, name: nb.name, parent: nb.parent || null } : n))
    } catch (err) { console.error('Error updating notebook', err) }
  }

  async function deleteNotebook(id: string) {
    try {
      await notebooksApi.delete(id)
      setNotebooks(prev => prev.filter(n => n.id !== id))
    } catch (err) { console.error('Error deleting notebook', err) }
  }

  async function moveNoteToNotebook(noteId: string, notebookId: string | null) {
    try {
      const res = await notesApi.update(noteId, { notebook: notebookId })
      const updated = res.data.data
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, notebook: updated.notebook ? { id: updated.notebook._id, name: updated.notebook.name } : null } : n))
    } catch (err) { console.error('Error moving note:', err) }
  }

  async function onPinToggle(id: string) {
    try {
      const note = notes.find(n => n.id === id)
      if (!note) return
      const res = await notesApi.update(id, { pinned: !note.pinned })
      const updated = res.data.data
      setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: updated.pinned } : n))
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  async function onDuplicateNote(id: string) {
    try {
      const note = notes.find(n => n.id === id)
      if (!note) return
      const res = await notesApi.create({
        title: note.title + ' (copy)',
        content: note.content,
        tags: note.tags.map(t => t.id),
        color: note.color || '#ffffff'
      })
      const created = res.data.data
      const newNote = {
        id: created._id,
        title: created.title || '',
        content: created.content || '',
        tags: (created.tags || []).map((tag: any) => ({ id: tag?._id || tag, label: tag?.name || 'Unknown Tag' })),
        color: created.color || '#ffffff'
        ,
        reminder: created.reminder || null
        ,
        attachments: (created.attachments || []).map((a: any) => ({ url: a.url, publicId: a.publicId, filename: a.filename, fileType: a.fileType, size: a.size }))
      }
      setNotes(prev => [newNote, ...prev])
    } catch (error) {
      console.error('Error duplicating note:', error)
    }
  }

  function saveTemplate(data: NoteData) {
    const template = { id: uuidv4(), title: data.title, content: data.content, tags: data.tags, color: data.color || '#ffffff' }
    const next = [template, ...templates]
    setTemplates(next)
    try { localStorage.setItem('note_templates', JSON.stringify(next)) } catch (e) { }
  }

  async function onDeleteNote(id: string) {
    try {
      await notesApi.delete(id)
      setNotes(prev => prev.filter(note => note.id !== id))
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  async function onUpdateNote(id: string, data: NoteData) {
    try {
      const res = await notesApi.update(id, {
        title: data.title,
        content: data.content,
        tags: data.tags.map(tag => tag.id),
        color: data.color || '#ffffff',
        attachments: (data.attachments || []).map(a => ({ url: a.url, filename: a.filename, publicId: a.publicId, fileType: a.fileType, size: a.size }))
      })

      const updatedNoteData = res.data.data;
      const updatedNote = {
        id: updatedNoteData._id,
        title: updatedNoteData.title || "",
        content: updatedNoteData.content || "",
        tags: (updatedNoteData.tags || []).map((tag: any) => ({
          id: tag?._id || tag,
          label: tag?.name || "Unknown Tag"
        })),
        color: updatedNoteData.color || '#ffffff'
        ,
        pinned: updatedNoteData.pinned || false
        ,
        attachments: (updatedNoteData.attachments || []).map((a: any) => ({ url: a.url, publicId: a.publicId, filename: a.filename, fileType: a.fileType, size: a.size })),
        reminder: updatedNoteData.reminder || null
      }

      setNotes(prev => prev.map(note => note.id === id ? updatedNote : note))
    } catch (error) {
      console.error("Error updating note:", error)
    }
  }

  async function addTag(tag: Tag) {
    try {
      const res = await tagsApi.create({ name: tag.label })
      const newTag = { id: res.data.data._id, label: res.data.data.name }
      setTags(prev => [...prev, newTag])
      return newTag
    } catch (error) {
      console.error("Error adding tag:", error)
      throw error
    }
  }

  async function updateTag(id: string, label: string) {
    try {
      await tagsApi.update(id, { name: label })
      setTags(prev => prev.map(tag => tag.id === id ? { ...tag, label } : tag))
    } catch (error) {
      console.error("Error updating tag:", error)
    }
  }

  async function deleteTag(id: string) {
    try {
      await tagsApi.delete(id)
      setTags(prev => prev.filter(tag => tag.id !== id))
    } catch (error) {
      console.error("Error deleting tag:", error)
    }
  }

  const { logout, user } = useAuth(); // Hooks must be inside component

  if (loading) return <div>Loading...</div>


  return (
    <div className="container my-4">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="text-muted small">Hello, {user?.profile?.name || user?.email}</span>
          <PushSettings />
          <Link to="/settings" className="btn btn-outline-secondary btn-sm">Settings</Link>
          <Notifications notifications={notifications} onMarkRead={async (id: string) => {
            try {
              await notificationsApi.markRead(id)
              setNotifications(prev => prev.map((n: any) => n._id === id ? { ...n, read: true } : n))
            } catch (err) {
              // ignore
            }
          }} />
          <Button variant="outline-danger" size="sm" onClick={logout}>Logout</Button>
        </div>
      </div>
      <Toasts toasts={toasts} onDismiss={(id: string) => setToasts(prev => prev.filter(t => t._id !== id))} />
      <Routes>
        <Route path="/" element={<NoteList availableTags={tags} notes={notes}
          onUpdateTag={updateTag} onDeleteTag={deleteTag}
          onPinToggle={onPinToggle} onDuplicate={onDuplicateNote}
          notebooks={notebooks}
          onCreateNotebook={createNotebook}
          onUpdateNotebook={updateNotebook}
          onDeleteNotebook={deleteNotebook}
          onSearch={searchNotes}
          onNoteUpdated={(id: string, updated: any) => setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updated } : n))}
        />} />
        <Route path="/new" element={
          <NewNotes
            onSubmit={onCreateNote}
            onAddTag={addTag}
            availableTags={tags}
            templates={templates}
            onSaveTemplate={saveTemplate}
          />
        } />

        <Route path="/:id" element={<NoteLayout notes=
          {notes} />}>
          <Route index element={<Note
            onDelete={onDeleteNote}
            onPinToggle={onPinToggle}
            onDuplicate={onDuplicateNote}
            onSaveTemplate={saveTemplate}
            templates={templates}
            notebooks={notebooks}
            onMoveNote={moveNoteToNotebook}
            onUpdate={onUpdateNote}
          />} />
          <Route path="edit" element={<EditNote
            onSubmit={onUpdateNote}
            onAddTag={addTag}
            availableTags={tags}
          />} />
        </Route>
        <Route path="/notifications" element={<NotificationCenter />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function RoutesComp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
      <Route path="/note/shared/:id" element={<SharedNote />} />

      {/* App Routes - Catch all */}
      {/* If authenticated, MainApp handles routing. If not, show LandingPage */}
      <Route path="/*" element={isAuthenticated ? <MainApp /> : <LandingPage />} />
    </Routes>
  )
}

function App(): JSX.Element {
  return (
    <AuthProvider>
      <RoutesComp />
    </AuthProvider>
  )
}

export default App;
