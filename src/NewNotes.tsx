import { NoteForm } from "./NoteForm"
import type { NoteData, Tag } from "./App"
import { useState } from "react"

type NewNotesProps = {
    onSubmit: (data: NoteData) => Promise<void> | void
    onAddTag: (tag: Tag) => Promise<Tag | undefined>
    availableTags: Tag[]
    templates?: any[]
}

export function NewNotes({ onSubmit, onAddTag, availableTags, templates = [] }: NewNotesProps){
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
    const selectedTemplate = templates.find(t => t.id === selectedTemplateId)

    return (
<>
        <h1 className="mb-4">New notes</h1>
        {templates.length > 0 && (
            <div className="mb-3">
                <label className="form-label">Apply Template</label>
                <div className="d-flex gap-2">
                    <select className="form-select" value={selectedTemplateId ?? ''} onChange={e => setSelectedTemplateId(e.target.value || null)}>
                        <option value="">-- Select template --</option>
                        {templates.map(t => (
                            <option key={t.id} value={t.id}>{t.title || '(untitled)'}</option>
                        ))}
                    </select>
                    <button className="btn btn-outline-secondary" onClick={() => setSelectedTemplateId(null)}>Clear</button>
                </div>
            </div>
        )}
        <NoteForm 
        onSubmit={onSubmit}
        onAddTag={onAddTag}
        availableTags={availableTags}
        title={selectedTemplate?.title}
        content={selectedTemplate?.content}
        tags={selectedTemplate?.tags || []}
        attachments={selectedTemplate?.attachments || []}
        color={selectedTemplate?.color}
        />

</>
    )
}
