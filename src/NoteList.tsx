import { Button, Col, Form, Row, Stack, Card, Badge, Modal } from "react-bootstrap"
import { Link } from "react-router-dom"
import CreateableReactSelect from "react-select/creatable"
import { useMemo, useState } from "react"
import type { NoteType, Tag } from "./App"
import "./NoteListModule.css"

type NoteCardProps = {
    id: string
    title: string
    tags: Tag[]
}

type EditTagsModalProps = {
    availableTags: Tag[]
    show: boolean
    handleClose: () => void
    onUpdateTag: (id: string, label: string) => void
    onDeleteTag: (id: string) => void
}


function NoteCard({ id, title, tags }: NoteCardProps) {
    return (
        <Card 
            as={Link} 
            to={`/${id}`} 
            className="card h-100 text-reset text-decoration-none"
        >
            <Card.Body className="cardBody">
                <span className="cardTitle">{title}</span>
                {tags.length > 0 && (
                    <div className="tagContainer">
                        {tags.map(tag => (
                            <Badge key={tag.id} className="tag">
                                {tag.label}
                            </Badge>
                        ))}
                    </div>
                )}
            </Card.Body>
        </Card>
    )
}


type NoteListProps = {
    availableTags: Tag[]
    notes: NoteType[]
    onUpdateTag: (id: string, label: string) => void
    onDeleteTag: (id: string) => void
}

export function NoteList({ availableTags, notes, onUpdateTag, onDeleteTag }: NoteListProps) {
    const [selectedTags, setSelectedTags] = useState<Tag[]>([])
    const [title, setTitle] = useState("") 
    const [showEditTagsModal, setShowEditTagsModal] = useState(false)
    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            return (title === "" || note.title.toLowerCase().includes(title.toLowerCase())) &&
            (selectedTags.length === 0 || 
                selectedTags.every(tag => 
                    note.tags.some(noteTag => noteTag.id === tag.id)
                )
            )
        })
    }, [title, selectedTags, notes]) 

    return (
        <>
            <Row className="align-items-center mb-4">
                <Col>
                    <h1>Notes</h1>
                </Col>
                <Col xs="auto">
                    <Stack gap={2} direction="horizontal"> 
                        <Link to="/new">
                            <Button variant="primary" className="create-button">Create</Button>   
                        </Link>
                        <Button onClick={()=> setShowEditTagsModal(true) }
                        variant="outline-secondary">Edit Tags</Button>
                    </Stack>
                </Col>
            </Row>
            
            <Form className="form-section">
                <Row className="mb-4">
                    <Col>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control 
                                type="text" 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Search notes by title..."
                            />
                        </Form.Group>
                    </Col> 
                    <Col>
                        <Form.Group controlId="tags">
                            <Form.Label>Tags</Form.Label>
                            <CreateableReactSelect 
                                value={selectedTags.map(tag => ({
                                    label: tag.label, 
                                    value: tag.id
                                }))}
                                options={availableTags.map(tag => ({
                                    label: tag.label, 
                                    value: tag.id
                                }))}
                                onChange={tags => {
                                    setSelectedTags(tags.map(tag => ({
                                        label: tag.label, 
                                        id: tag.value
                                    })))
                                }}
                                isMulti 
                                placeholder="Filter by tags..."
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
            
            <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
                {filteredNotes.map(note => (
                    <Col key={note.id}>
                        <NoteCard 
                            id={note.id}
                            title={note.title}
                            tags={note.tags}
                        />
                    </Col>
                ))}
            </Row>
            <EditTagsModal
            onUpdateTag={onUpdateTag}
            onDeleteTag={onDeleteTag}
                availableTags={availableTags}
                show={showEditTagsModal}
                handleClose={() => setShowEditTagsModal(false)}
            
            />
        </>
    )
}   


function EditTagsModal({ 
 onUpdateTag, onDeleteTag,
    availableTags, show, handleClose }: EditTagsModalProps) {
    return(
 <Modal show={show} onHide={handleClose} >
    <Modal.Header closeButton>
        <Modal.Title>Edit Tags</Modal.Title>
    </Modal.Header>
    <Modal.Body>
 <Form>
    <Stack gap={2}>
        {
            availableTags.map(tag =>(
                <Row key={tag.id}>
                <Col>
                    <Form.Control type="text" value={tag.label}
                     onChange={e => onUpdateTag(tag.id, e.target.value)} />
                </Col>
                <Col xs="auto">
                    <Button variant="outline-danger" onClick={() => onDeleteTag(tag.id)}>&times;</Button>
                </Col>
                </Row>
            ))
        }
    </Stack>
 </Form>

    </Modal.Body>
 </Modal>

    )
}