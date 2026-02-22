import type { JSX } from "react";
import "bootstrap/dist/css/bootstrap.min.css"
import { Routes, Route, Navigate } from "react-router-dom";
import { NewNotes } from "./NewNotes";
import { NoteList } from "./NoteList";
import { useMemo, useState, useEffect } from "react";
import { NoteLayout } from "./NoteLayout";
import { Note } from "./Note";
import { EditNote } from "./EditNote";
import { notesApi, tagsApi } from "./api";

export type NoteType = {
  id: string
} & NoteData

export type NoteData = {
  title: string
  content: string
  tags: Tag[]
}

export type Tag = {
  id: string
  label: string
}

function App(): JSX.Element {
  const [notes, setNotes] = useState<NoteType[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notesRes, tagsRes] = await Promise.all([
          notesApi.getAll(),
          tagsApi.getAll()
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
          }))
        }))

        setTags(mappedTags)
        setNotes(mappedNotes)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  async function onCreateNote(data: NoteData) {
    try {
      const res = await notesApi.create({
        title: data.title,
        content: data.content,
        tags: data.tags.map(tag => tag.id)
      })
      
      const createdNote = res.data.data;
      const newNote = {
        id: createdNote._id,
        title: createdNote.title || "",
        content: createdNote.content || "",
        tags: (createdNote.tags || []).map((tag: any) => ({
          id: tag?._id || tag,
          label: tag?.name || "Unknown Tag"
        }))
      }
      
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (error) {
      console.error("Error creating note:", error)
    }
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
        tags: data.tags.map(tag => tag.id)
      })

      const updatedNoteData = res.data.data;
      const updatedNote = {
        id: updatedNoteData._id,
        title: updatedNoteData.title || "",
        content: updatedNoteData.content || "",
        tags: (updatedNoteData.tags || []).map((tag: any) => ({
          id: tag?._id || tag,
          label: tag?.name || "Unknown Tag"
        }))
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
      return newTag // Ensure we return the tag for the UI to update
    } catch (error) {
      console.error("Error adding tag:", error)
      throw error // Re-throw to handle in UI
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

  if (loading) return <div>Loading...</div>


  return (
    <div className="container my-4">
      <Routes>
        <Route path="/" element={<NoteList availableTags={tags} notes={notes} 
        onUpdateTag={updateTag} onDeleteTag={deleteTag}
        />} />
        <Route path="/new" element={
          <NewNotes 
            onSubmit={onCreateNote}
            onAddTag={addTag} 
            availableTags={tags}
          />
        } />

        <Route path="/:id" element={<NoteLayout notes=
        {notes} />}>
          <Route index element={<Note 
            onDelete = {onDeleteNote}
            />} />
          <Route path="edit" element={<EditNote
            onSubmit={onUpdateNote}
            onAddTag={addTag} 
            availableTags={tags}
            />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

// function Layout(): JSX.Element {
//   return (
//     <div>
//       <h2>ID Page</h2>
//       <Outlet />
//     </div>
//   );
// }

export default App;
