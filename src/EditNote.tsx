import { NoteForm } from "./NoteForm"
import type { NoteData, Tag } from "./App"
import { useNote } from "./NoteLayout"

type EditNoteProps = {
    onSubmit: (id: string, data: NoteData) => Promise<void> | void
    onAddTag: (tag: Tag) => Promise<Tag | undefined>
    availableTags: Tag[]
}

export function EditNote({ onSubmit, onAddTag, availableTags  }: EditNoteProps){
  const note = useNote()

    return (
<>
        <h1 className="mb-4">Edit Note</h1>
        <NoteForm 
        id={note.id}
        title ={note.title}
        content={note.content}
        tags={note.tags}
        attachments={note.attachments || []}
        onSubmit={(data) =>
             onSubmit(note.id, data)}
         onAddTag={onAddTag} 
        availableTags={availableTags}
        />

</>
    )
}
