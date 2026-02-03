
import { useRef, useState, type FormEvent } from "react";
import { Row, Stack, Col, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import CreateableReactSelect from "react-select/creatable"
import type { NoteData, Tag } from "./App";
import { v4 as uuidv4 } from "uuid";



type NoteFormProps = {
    onSubmit: (data: NoteData) => void
    onAddTag: (tag: Tag) => void
    availableTags: Tag[]
} & Partial<NoteData>

export function NoteForm({ onSubmit, onAddTag, availableTags, title = "", markdown = "", tags = [] }: NoteFormProps) {
    const titleRef = useRef<HTMLInputElement>(null)
    const markdownRef = useRef<HTMLTextAreaElement>(null)
    const [selectedTags, setSelectedTags] = useState<Tag[]>(tags)

    const navigate = useNavigate()

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        
        onSubmit({
            title: titleRef.current!.value,
            markdown: markdownRef.current!.value,
            tags: selectedTags
        })
        navigate("..")
    }

    return (
        <Form onSubmit={handleSubmit}>
            <Stack gap={4}>
                <Row>
                    <Col>
                        <Form.Group controlId="title">
                            <Form.Label>Title</Form.Label>
                            <Form.Control ref={titleRef} required defaultValue={title} />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="tags">
                            <Form.Label>Tags</Form.Label>
                            <CreateableReactSelect 
                                onCreateOption={label => {
                                    const newTag = { id: uuidv4(), label }
                                    onAddTag(newTag)
                                    setSelectedTags(prev => [...prev, newTag])
                                }}
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
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Form.Group controlId="markdown">
                    <Form.Label>Body</Form.Label>
                    <Form.Control 
                   defaultValue={markdown}
                    required as="textarea" ref={markdownRef} rows={15} />
                </Form.Group>
                <Stack direction="horizontal" gap={2} className="justify-content-end">
                    <Button type="submit" variant="outline-primary">Save</Button> 
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