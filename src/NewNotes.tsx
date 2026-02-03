import { NoteForm } from "./NoteForm"
import type { NoteData, Tag } from "./App"

type NewNotesProps = {
    onSubmit: (data: NoteData) => void
    onAddTag: (tag: Tag) => void
    availableTags: Tag[]
}

export function NewNotes({ onSubmit, onAddTag, availableTags  }: NewNotesProps){
    return (
<>
        <h1 className="mb-4">New notes</h1>
        <NoteForm 
        onSubmit={onSubmit} onAddTag={onAddTag} 
        availableTags={availableTags}
        />

</>
    )
}
