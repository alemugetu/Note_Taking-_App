
import { useRef, useState, type FormEvent, useEffect, useCallback, useMemo } from "react";
import { Row, Stack, Col, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import CreateableReactSelect from "react-select/creatable"
import type { NoteData, Tag } from "./App";
import { tagsApi } from "./api";
import { uploadsApi } from "./api";
import { v4 as uuidv4 } from "uuid";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import debounce from "lodash.debounce";

// Toolbar tooltips titles
const TOOLBAR_TITLES: Record<string, string> = {
    'ql-bold': 'Bold',
    'ql-italic': 'Italic',
    'ql-underline': 'Underline',
    'ql-strike': 'Strike',
    'ql-blockquote': 'Blockquote',
    'ql-list': 'List',
    'ql-header': 'Header',
    'ql-link': 'Link',
    'ql-image': 'Image',
    'ql-clean': 'Clear Formatting',
    'ql-indent': 'Indent'
};

function addToolbarTooltips() {
    const toolbar = document.querySelector('.ql-toolbar');
    if (!toolbar) return;

    const buttons = toolbar.querySelectorAll('button, .ql-picker');
    buttons.forEach(button => {
        const className = Array.from(button.classList).find(cls => TOOLBAR_TITLES[cls]);
        if (className) {
            button.setAttribute('title', TOOLBAR_TITLES[className]);
        } else if (button.classList.contains('ql-picker')) {
            const label = button.querySelector('.ql-picker-label');
            if (label) {
                // Check if it's a header picker
                if (button.classList.contains('ql-header')) {
                    button.setAttribute('title', 'Text Size');
                }
            }
        }
        
        // Handle specific list buttons which might not have the base class
        if (button.getAttribute('value') === 'ordered') {
            button.setAttribute('title', 'Ordered List');
        } else if (button.getAttribute('value') === 'bullet') {
            button.setAttribute('title', 'Bullet List');
        } else if (button.getAttribute('value') === '+1') {
            button.setAttribute('title', 'Increase Indent');
        } else if (button.getAttribute('value') === '-1') {
            button.setAttribute('title', 'Decrease Indent');
        }
    });
}

type NoteFormProps = {
    onSubmit: (data: NoteData) => Promise<void> | void
    onAddTag: (tag: Tag) => Promise<Tag | undefined>
    availableTags: Tag[]
    id?: string
} & Partial<NoteData>

export function NoteForm({ onSubmit, onAddTag, availableTags, title = "", content = "", tags = [], id, color = '#ffffff', attachments = [], reminder }: NoteFormProps) {
    const [currentTitle, setCurrentTitle] = useState(title)
    const [currentContent, setCurrentContent] = useState(content)
    const [selectedTags, setSelectedTags] = useState<Tag[]>(tags)
    const [tagOptions, setTagOptions] = useState<{ label: string; value: string }[]>(availableTags.map(t => ({ label: t.label, value: t.id })))
    const [currentColor, setCurrentColor] = useState<string>(color)
    const [isSaving, setIsSaving] = useState(false)
    const [attachmentsState, setAttachmentsState] = useState<Array<any>>(attachments || [])
    const [reminderDate, setReminderDate] = useState<string | ''>("")
    const [reminderTime, setReminderTime] = useState<string | ''>("")
    const quillRef = useRef<any>(null)
    const [uploading, setUploading] = useState(false)
    const onSubmitRef = useRef(onSubmit)
    const lastSavedSnapshotRef = useRef<string>("")

    const navigate = useNavigate()

    // Add tooltips on mount
    useEffect(() => {
        setTimeout(addToolbarTooltips, 100);
    }, []);

    // Keep latest onSubmit without recreating debounced function
    useEffect(() => {
        onSubmitRef.current = onSubmit
    }, [onSubmit])

    // Initialize local state when switching to a different note (id changes)
    useEffect(() => {
        setCurrentTitle(title)
        setCurrentContent(content)
        setSelectedTags(tags)
        setCurrentColor(color)
        setAttachmentsState(attachments || [])

        // initialize reminder inputs from prop
        if (reminder && (reminder as any).date) {
            try {
                const d = new Date((reminder as any).date)
                setReminderDate(d.toISOString().slice(0,10))
                setReminderTime(d.toTimeString().slice(0,5))
            } catch (e) {
                setReminderDate("")
                setReminderTime("")
            }
        } else {
            setReminderDate("")
            setReminderTime("")
        }

        // set the "last saved" snapshot to what we just loaded
        const initialSnapshot = JSON.stringify({
            title,
            content,
            tags: (tags || []).map(t => t.id).sort(),
            color,
            attachments: (attachments || []).map((a: any) => ({
                url: a?.url,
                publicId: a?.publicId || a?.public_id || a?.publicid,
                filename: a?.filename,
                fileType: a?.fileType,
                size: a?.size,
            })).sort((a: any, b: any) => String(a.publicId || a.url || '').localeCompare(String(b.publicId || b.url || ''))),
            reminder: (reminder && (reminder as any).date) ? { date: (reminder as any).date } : null,
        })
        lastSavedSnapshotRef.current = initialSnapshot
    }, [id])

    // Auto-save function
    const debouncedSave = useMemo(() => {
        return debounce(async (data: NoteData, snapshot: string) => {
            try {
                await onSubmitRef.current(data)
                lastSavedSnapshotRef.current = snapshot
            } catch (e) {
                console.error('Auto-save failed', e)
            } finally {
                setIsSaving(false)
            }
        }, 2000)
    }, [])

    const fetchTagSuggestions = useCallback(
        debounce(async (q: string) => {
            try {
                const res = await tagsApi.search(q, 10)
                const items = (res.data.data || []).map((t: any) => ({ label: t.name, value: t._id }))
                setTagOptions(prev => {
                    const map = new Map(prev.map(p => [p.value, p]))
                    items.forEach((it: any) => map.set(it.value, it))
                    return Array.from(map.values())
                })
            } catch (e) {
                // ignore
            }
        }, 300),
        []
    )

    useEffect(() => {
        // keep tag options in sync with prop
        setTagOptions(availableTags.map(t => ({ label: t.label, value: t.id })))
    }, [availableTags])

    useEffect(() => {
        // Trigger auto-save only if we have an id (edit mode)
        if (!id) return

        const reminderPayload = reminderDate
            ? { date: (reminderDate + 'T' + (reminderTime || '00:00') + ':00.000Z'), notified: false }
            : undefined

        const normalizedAttachments = (attachmentsState || []).map((a: any) => ({
            url: a?.url,
            publicId: a?.publicId || a?.public_id || a?.publicid,
            filename: a?.filename,
            fileType: a?.fileType,
            size: a?.size,
        })).sort((a: any, b: any) => String(a.publicId || a.url || '').localeCompare(String(b.publicId || b.url || '')))

        const snapshot = JSON.stringify({
            title: currentTitle,
            content: currentContent,
            tags: (selectedTags || []).map(t => t.id).sort(),
            color: currentColor,
            attachments: normalizedAttachments,
            reminder: reminderPayload ? { date: reminderPayload.date } : null,
        })

        if (snapshot !== lastSavedSnapshotRef.current) {
            setIsSaving(true)
            debouncedSave({
                title: currentTitle,
                content: currentContent,
                tags: selectedTags,
                color: currentColor,
                attachments: attachmentsState,
                reminder: reminderPayload
            }, snapshot)
        }

        return () => debouncedSave.cancel()
    }, [id, currentTitle, currentContent, selectedTags, currentColor, attachmentsState, reminderDate, reminderTime, debouncedSave])

    useEffect(() => {
        return () => {
            fetchTagSuggestions.cancel()
        }
    }, [fetchTagSuggestions])

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        
        try {
            setIsSaving(true)
            const reminderPayload = reminderDate ? { date: (reminderDate + 'T' + (reminderTime || '00:00') + ':00.000Z'), notified: false } : undefined
            await onSubmit({
                title: currentTitle,
                content: currentContent,
                tags: selectedTags,
                color: currentColor,
                attachments: attachmentsState,
                reminder: reminderPayload
            })
            setIsSaving(false)
            navigate("/") 
        } catch (error) {
            console.error("Save failed:", error)
            setIsSaving(false)
            alert("Failed to save note. Please check your connection and try again.")
        }
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    }

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ]

    return (
        <Form onSubmit={handleSubmit}>
            <Stack gap={4}>
                <Row>
                    <Col>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                                required 
                                value={currentTitle} 
                                onChange={e => setCurrentTitle(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="tags">
                            <Form.Label>Tags</Form.Label>
                            <CreateableReactSelect 
                                onCreateOption={async label => {
                                    const newTagPlaceholder = { id: uuidv4(), label }
                                    const createdTag = await onAddTag(newTagPlaceholder)
                                    if (createdTag) {
                                        setSelectedTags(prev => [...prev, createdTag])
                                    }
                                }}
                                value={selectedTags.map(tag => ({
                                    label: tag.label, 
                                    value: tag.id
                                }))}
                                options={tagOptions}
                                onInputChange={(input) => {
                                    if (!input) return input
                                    fetchTagSuggestions(input)
                                    return input
                                }}
                                onChange={tags => {
                                    setSelectedTags(tags.map(tag => ({
                                        label: tag.label, 
                                        id: tag.value
                                    })))
                                }}
                                isMulti 
                            />
                        </Form.Group>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <Form.Group controlId="color">
                            <Form.Label>Color</Form.Label>
                            <div>
                                <Form.Control 
                                    type="color"
                                    value={currentColor}
                                    onChange={e => setCurrentColor(e.target.value)}
                                    style={{ width: '48px', height: '36px', padding: 0 }}
                                />
                            </div>
                        </Form.Group>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <Form.Group controlId="reminderDate">
                            <Form.Label>Reminder Date</Form.Label>
                            <Form.Control type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} />
                        </Form.Group>
                    </Col>
                    <Col xs="auto" className="d-flex align-items-end">
                        <Form.Group controlId="reminderTime">
                            <Form.Label>Reminder Time</Form.Label>
                            <Form.Control type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} />
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group controlId="content">
                    <Form.Label>Body {isSaving && <span className="text-muted ms-2" style={{ fontSize: '0.8rem' }}>(Saving...)</span>}</Form.Label>
                            <div style={{ marginBottom: 8 }}>
                        <input type="file" accept="image/*,video/*,application/pdf" onChange={async (e) => {
                            const file = e.target.files && e.target.files[0]
                            if (!file) return
                            try {
                                setUploading(true)
                                const fd = new FormData()
                                fd.append('file', file)
                                const res = await uploadsApi.uploadFile(fd)
                                        const url = res.data?.data?.url
                                        const publicId = res.data?.data?.public_id || res.data?.data?.publicId
                                        const filename = file.name
                                        const fileType = file.type
                                        const size = file.size
                                        if (url && quillRef.current) {
                                            const editor = quillRef.current.getEditor()
                                            const range = editor.getSelection(true) || { index: editor.getLength() }
                                            // insert appropriate embed (images for now)
                                            if (file.type.startsWith('image/')) editor.insertEmbed(range.index, 'image', url)
                                            else editor.insertText(range.index, url)
                                            // update content state from editor
                                            setCurrentContent(editor.root.innerHTML)
                                        }
                                        // record attachment metadata locally so it will be submitted with the note
                                        const newAttachment = { url, publicId, filename, fileType, size }
                                        setAttachmentsState(prev => [newAttachment, ...prev])
                            } catch (err) {
                                console.error('Upload failed', err)
                                alert('Upload failed')
                            } finally { setUploading(false); if (e.currentTarget) e.currentTarget.value = '' }
                        }} />
                        {uploading && <div className="text-muted">Uploading...</div>}
                    </div>
                            {attachmentsState.length > 0 && (
                                <div className="mb-2">
                                    <strong>Attachments</strong>
                                    <div className="d-flex flex-wrap" style={{ gap: 8, marginTop: 8 }}>
                                        {attachmentsState.map((a, i) => (
                                            <div key={i} style={{ border: '1px solid #eee', padding: 8, borderRadius: 6 }}>
                                                <div style={{ fontSize: '0.85rem' }}>{a.filename || a.url}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#666' }}>{(a.size || 0) > 0 ? `${Math.round((a.size/1024))} KB` : ''}</div>
                                                <div className="mt-1"><button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setAttachmentsState(prev => prev.filter((_, idx) => idx !== i))}>Remove</button></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    <ReactQuill 
                        ref={quillRef}
                        theme="snow"
                        value={currentContent}
                        onChange={setCurrentContent}
                        modules={modules}
                        formats={formats}
                        style={{ height: '400px', marginBottom: '50px' }}
                    />
                </Form.Group>
                <Stack direction="horizontal" gap={2} className="justify-content-end">
                    <Button type="submit" variant="outline-primary">Save & Exit</Button> 
                    <Link to="..">
                        <Button type="button" variant="outline-secondary">
                            Cancel
                        </Button>
                    </Link>
                </Stack>
            </Stack>
        </Form>
    )
}
