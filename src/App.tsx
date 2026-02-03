import type { JSX } from "react";
import "bootstrap/dist/css/bootstrap.min.css"
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { NewNotes } from "./NewNotes";
import { useLocalStorage } from "./useLocalStorage";
import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

export type Note = {
  id: string
} & NoteData

export type RawNote = {
  id: string
} & RawNoteData

export type RawNoteData = {
  title: string
  markdown: string
  tagIds: string[]
}

export type NoteData = {
  title: string
  markdown: string
  tags: Tag[]
}

export type Tag = {
  id: string
  label: string
}

function App(): JSX.Element {
  const [notes, setNotes] = useLocalStorage<RawNote[]>("NOTES", [])
  const [tags, setTags] = useLocalStorage<Tag[]>("TAGS", [])
  
  const notesWithTags = useMemo(() => {
    return notes.map(note => {
      return {
        ...note,
        tags: tags.filter(tag => note.tagIds.includes(tag.id))
      }
    })
  }, [notes, tags])

  function onCreateNote({ tags, ...data }: NoteData) {
    setNotes(prevNotes => {
      return [
        ...prevNotes,
        { ...data, id: uuidv4(), tagIds: tags.map(tag => tag.id) }
      ]
    })
  }

  function addTag(tag: Tag) {
    setTags(prev => [...prev, tag])
  }

  return (
    <div className="container my-4">
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/new" element={
          <NewNotes 
            onSubmit={onCreateNote}
            onAddTag={addTag} 
            availableTags={tags}
          />
        } />

        <Route path="/:id" element={<Layout />}>
          <Route index element={<h1>Show</h1>} />
          <Route path="edit" element={<h1>Edit</h1>} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function Layout(): JSX.Element {
  return (
    <div>
      <h2>ID Page</h2>
      <Outlet />
    </div>
  );
}

export default App;
