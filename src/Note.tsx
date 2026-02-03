import { Button, Col, Stack, Row, Badge } from "react-bootstrap";
import { useNote } from "./NoteLayout";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import "./NoteListModule.css";

type NoteProps = {
    onDelete: (id: string) => void
}
export function Note({ onDelete }: NoteProps) {
    const note = useNote();
    const navigate = useNavigate();

    return (
        <> 
            <Row className="align-items-center mb-4">
                <Col>
                    <h1>{note.title}</h1>
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
                        <Link to="/">
                            <Button variant="outline-secondary">Back</Button>
                        </Link> 
                    </Stack>
                </Col>
            </Row>
            <ReactMarkdown>{note.markdown}</ReactMarkdown>
        </>
    )
}