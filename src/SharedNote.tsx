import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { notesApi } from './api';

export function SharedNote() {
    const { id } = useParams();
    const [note, setNote] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchNote() {
            try {
                if (!id) return;
                const res = await notesApi.getShared(id);
                setNote(res.data.data);
            } catch (err: any) {
                console.error("Failed to load shared note", err);
                if (err.response && err.response.status === 403) {
                    setError('This note is private or does not exist.');
                } else {
                    setError('Failed to load note.');
                }
            } finally {
                setLoading(false);
            }
        }
        fetchNote();
    }, [id]);

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <Spinner animation="border" />
        </Container>
    );

    if (error) return (
        <Container className="mt-5">
            <Alert variant="danger">
                <h4>Error</h4>
                <p>{error}</p>
                <Link to="/">Go Home</Link>
            </Alert>
        </Container>
    );

    if (!note) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <div className="bg-white shadow-sm py-3 mb-4">
                <Container className="d-flex justify-content-between align-items-center">
                    <span className="h5 mb-0 text-primary">NoteApp</span>
                    <div>
                        <Link to="/register"><Button variant="primary" size="sm" className="me-2">Sign Up</Button></Link>
                        <Link to="/login"><Button variant="outline-primary" size="sm">Log In</Button></Link>
                    </div>
                </Container>
            </div>

            <Container>
                <div className="bg-white p-5 rounded shadow-sm" style={{ maxWidth: '800px', margin: '0 auto', borderTop: `6px solid ${note.color || '#fff'}` }}>
                    <h1 className="mb-3">{note.title}</h1>
                    <div className="mb-4 d-flex gap-2">
                        {note.tags && note.tags.map((tag: any) => (
                            <Badge key={tag._id} bg="secondary" className="fw-normal">{tag.name}</Badge>
                        ))}
                    </div>
                    <hr />
                    <div className="note-content mt-4" dangerouslySetInnerHTML={{ __html: note.content }} />

                    {note.attachments && note.attachments.length > 0 && (
                        <div className="mt-5 pt-3 border-top">
                            <h5 className="mb-3">Attachments</h5>
                            <div className="d-flex flex-wrap gap-3">
                                {note.attachments.map((a: any, i: number) => (
                                    <div key={i} className="border p-2 rounded">
                                        <a href={a.url} target="_blank" rel="noreferrer">{a.filename || 'Attachment ' + (i + 1)}</a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-center mt-5 pb-5 text-muted">
                    <small>Shared via NoteApp</small>
                </div>
            </Container>
        </div>
    );
}
