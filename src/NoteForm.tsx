
import { useRef, useState, type FormEvent, useEffect, useCallback } from "react";
import { Row, Stack, Col, Form, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import CreateableReactSelect from "react-select/creatable"
import type { NoteData, Tag } from "./App";
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

export function NoteForm({ onSubmit, onAddTag, availableTags, title = "", content = "", tags = [], id }: NoteFormProps) {
    const [currentTitle, setCurrentTitle] = useState(title)
    const [currentContent, setCurrentContent] = useState(content)
    const [selectedTags, setSelectedTags] = useState<Tag[]>(tags)
    const [isSaving, setIsSaving] = useState(false)

    const navigate = useNavigate()

    // Add tooltips on mount
    useEffect(() => {
        setTimeout(addToolbarTooltips, 100);
    }, []);

    // Auto-save function
    const debouncedSave = useCallback(
        debounce((data: NoteData) => {
            console.log("Auto-saving...", data)
            onSubmit(data)
            setIsSaving(false)
        }, 2000),
        [onSubmit]
    )

    useEffect(() => {
        // Trigger auto-save only if we have an id (edit mode)
        if (id && (currentTitle !== title || currentContent !== content || selectedTags !== tags)) {
            setIsSaving(true)
            debouncedSave({
                title: currentTitle,
                content: currentContent,
                tags: selectedTags
            })
        }
        return () => debouncedSave.cancel()
    }, [id, currentTitle, currentContent, selectedTags, debouncedSave])

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault()
        
        try {
            setIsSaving(true)
            await onSubmit({
                title: currentTitle,
                content: currentContent,
                tags: selectedTags
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
                <Form.Group controlId="content">
                    <Form.Label>Body {isSaving && <span className="text-muted ms-2" style={{ fontSize: '0.8rem' }}>(Saving...)</span>}</Form.Label>
                    <ReactQuill 
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