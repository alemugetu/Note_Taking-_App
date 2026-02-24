import { Button, Col, Stack, Row, Badge, Modal } from "react-bootstrap";
import { notesApi } from "./api";
import { useState } from "react";
import { useNote } from "./NoteLayout";
import { Link, useNavigate } from "react-router-dom";
import "./NoteListModule.css";
import { Form } from "react-bootstrap";

import { ShareModal } from "./ShareModal";

function FormSelectMoveNotebook({ notebooks, current, onMove }: { notebooks: any[]; current: any; onMove: (id: string | null) => void }) {
    return (
        <Form.Select size="sm" value={current?.id || ''} onChange={e => onMove(e.target.value || null)} style={{ width: 180 }}>
            <option value="">No notebook</option>
            {notebooks.map(nb => (
                <option key={nb.id} value={nb.id}>{nb.name}</option>
            ))}
        </Form.Select>
    )
}

type NoteProps = {
    onDelete: (id: string) => void
    onPinToggle?: (id: string) => void
    onDuplicate?: (id: string) => void
    onSaveTemplate?: (data: any) => void
    templates?: any[]
    notebooks?: any[]
    onMoveNote?: (noteId: string, notebookId: string | null) => void
    onUpdate?: (id: string, data: any) => void
    onRestore?: (id: string) => void
}
export function Note({ onDelete, onPinToggle, onDuplicate, onSaveTemplate, notebooks = [], onMoveNote, onUpdate, onRestore }: NoteProps) {
    const note = useNote();
    const navigate = useNavigate();
    const [showAttachModal, setShowAttachModal] = useState(false)
    const [showShareModal, setShowShareModal] = useState(false)
    const [activeAttachmentIndex, setActiveAttachmentIndex] = useState<number | null>(null)

    function openAttachment(idx: number) {
        setActiveAttachmentIndex(idx)
        setShowAttachModal(true)
    }

    function closeAttachment() {
        setActiveAttachmentIndex(null)
        setShowAttachModal(false)
    }

    function countWords(html: string) {
        const tmp = document.createElement('div')
        tmp.innerHTML = html || ''
        const text = tmp.textContent || tmp.innerText || ''
        const words = text.trim().split(/\s+/).filter(Boolean)
        return words.length
    }

    function formatDate(d?: string) {
        if (!d) return ''
        try { return new Date(d).toLocaleString() } catch { return d }
    }

    return (
        <>
            <Row className="align-items-center mb-4">
                <Col>
                    <div className="d-flex align-items-center mb-2">
                        <div style={{ width: 16, height: 16, background: note.color || '#ffffff', border: '1px solid rgba(0,0,0,0.1)', marginRight: 8, borderRadius: 3 }} />
                        <div>
                            <h1 style={{ margin: 0 }}>{note.title}</h1>
                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>{countWords(note.content)} words • Created {formatDate(note.createdAt)}</div>
                        </div>
                    </div>
                    {note.tags.length > 0 && (
                        <div className="tagContainer">
                            {note.tags.map(tag => (
                                <Badge key={tag.id} className="tag">
                                    {tag.label}
                                </Badge>
                            ))}
                        </div>
                    )}
                </Col>
                <Col xs="auto">
                    <Stack gap={2} direction="horizontal">
                        <Link to={`/${note.id}/edit`}>
                            <Button variant="primary">Edit</Button>
                        </Link>
                        {onPinToggle && (
                            <Button variant={note.pinned ? 'warning' : 'outline-secondary'} onClick={() => onPinToggle(note.id)}>
                                {note.pinned ? 'Unpin' : 'Pin'}
                            </Button>
                        )}
                        {onDuplicate && (
                            <Button variant="outline-secondary" onClick={() => { onDuplicate(note.id); navigate('/') }}>
                                Duplicate
                            </Button>
                        )}
                        {onUpdate && (
                            <Button variant="outline-info" onClick={() => setShowShareModal(true)}>
                                Share
                            </Button>
                        )}
                        {onSaveTemplate && (
                            <Button variant="outline-success" onClick={() => onSaveTemplate({ title: note.title, content: note.content, tags: note.tags, color: note.color })}>
                                Save as template
                            </Button>
                        )}
                        {onMoveNote && (
                            <FormSelectMoveNotebook notebooks={notebooks} current={note.notebook} onMove={(nbId) => onMoveNote(note.id, nbId)} />
                        )}
                        {note.archived && onRestore ? (
                            <Button
                                variant="success"
                                onClick={() => {
                                    onRestore(note.id)
                                    navigate("/")
                                }}
                            >
                                Restore
                            </Button>
                        ) : (
                            <Button
                                variant="outline-danger"
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to delete this note?")) {
                                        onDelete(note.id)
                                        navigate("/")
                                    }
                                }}
                            >
                                Delete
                            </Button>
                        )}
                        <Link to="/">
                            <Button variant="outline-secondary">Back</Button>
                        </Link>
                    </Stack>
                </Col>
            </Row>
            <div dangerouslySetInnerHTML={{ __html: note.content }} />

            {note.attachments && note.attachments.length > 0 && (
                <div className="mt-4">
                    <h5>Attachments</h5>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        {note.attachments.map((a: any, idx: number) => {
                            const item = a as any
                            const url = item.url || item
                            const type = item.fileType || (typeof url === 'string' && (url.includes('.mp4') || url.includes('video') ? 'video' : url.includes('.pdf') ? 'pdf' : url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'other')) || 'other'
                            const publicId = item.publicId || item.public_id || item.publicid || ''
                            const AttachmentWrapper = ({ children }: any) => (
                                <div key={idx} style={{ position: 'relative' }}>
                                    <div onClick={() => openAttachment(idx)} style={{ cursor: 'pointer' }}>{children}</div>
                                    <div style={{ marginTop: 6 }}>
                                        <Button size="sm" variant="outline-danger" onClick={async (e) => {
                                            e.stopPropagation()
                                            if (!window.confirm('Remove this attachment?')) return
                                            try {
                                                const res = await notesApi.removeAttachment(note.id, publicId || url)
                                                console.log('Removed attachment', res)
                                                // Trigger update
                                                window.dispatchEvent(new CustomEvent('note-updated', { detail: { id: note.id, updated: res.data.data } }))

                                                if (activeAttachmentIndex === idx) closeAttachment()
                                            } catch (err) {
                                                console.error('Failed to remove attachment', err)
                                                alert('Failed to remove attachment')
                                            }
                                        }}>Remove</Button>
                                    </div>
                                </div>
                            )

                            if (type === 'image') return AttachmentWrapper({ children: (<div style={{ width: 180 }}><img src={url} alt={item.filename || 'attachment'} style={{ width: '100%', borderRadius: 6 }} /></div>) })
                            if (type === 'video') return AttachmentWrapper({ children: (<div style={{ width: 300 }}><video src={url} controls style={{ width: '100%' }} /></div>) })
                            if (type === 'pdf') return AttachmentWrapper({ children: (<div style={{ width: 360 }}><iframe src={url} style={{ width: '100%', height: 400 }} title={item.filename || 'pdf'} /></div>) })
                            return AttachmentWrapper({ children: (<div><a href={url} target="_blank" rel="noreferrer">{item.filename || url}</a></div>) })
                        })}
                    </div>
                </div>
            )}

            <Modal show={showAttachModal} onHide={closeAttachment} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Attachment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {activeAttachmentIndex !== null && note.attachments && note.attachments[activeAttachmentIndex] && (() => {
                        const item = note.attachments[activeAttachmentIndex] as any
                        const url = item.url || item
                        const type = item.fileType || (typeof url === 'string' && (url.includes('.mp4') || url.includes('video') ? 'video' : url.includes('.pdf') ? 'pdf' : url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'other')) || 'other'
                        if (type === 'image') return (<img src={url} alt={item.filename || 'attachment'} style={{ width: '100%', borderRadius: 6 }} />)
                        if (type === 'video') return (<video src={url} controls style={{ width: '100%' }} />)
                        if (type === 'pdf') return (<iframe src={url} style={{ width: '100%', height: '70vh' }} title={item.filename || 'pdf'} />)
                        return (<div><a href={url} target="_blank" rel="noreferrer">Open attachment</a></div>)
                    })()}
                </Modal.Body>
                <Modal.Footer>
                    {activeAttachmentIndex !== null && note.attachments && note.attachments[activeAttachmentIndex] && (() => {
                        const item = note.attachments[activeAttachmentIndex] as any
                        const url = item.url || item
                        return (
                            <>
                                <a className="btn btn-outline-primary" href={url} target="_blank" rel="noreferrer" download>Download</a>
                                <Button variant="outline-danger" onClick={async () => {
                                    const publicId = item.publicId || item.public_id || item.publicid || ''
                                    if (!window.confirm('Remove this attachment?')) return
                                    try {
                                        const res = await notesApi.removeAttachment(note.id, publicId || url)
                                        console.log('Removed attachment', res)
                                        window.dispatchEvent(new CustomEvent('note-updated', { detail: { id: note.id, updated: res.data.data } }))
                                        closeAttachment()
                                    } catch (err) {
                                        console.error('Failed to remove attachment', err)
                                        alert('Failed to remove attachment')
                                    }
                                }}>Remove</Button>
                            </>
                        )
                    })()}
                    <Button variant="secondary" onClick={closeAttachment}>Close</Button>
                </Modal.Footer>
            </Modal>

            {onUpdate && (
                <ShareModal
                    show={showShareModal}
                    onHide={() => setShowShareModal(false)}
                    note={note}
                    onUpdate={onUpdate}
                />
            )}
        </>
    )
}
