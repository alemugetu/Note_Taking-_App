import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { useState, useRef } from 'react';
import { notesApi } from './api';

type ShareModalProps = {
    show: boolean;
    onHide: () => void;
    note: any;
    onUpdate: (id: string, data: any) => void;
}

export function ShareModal({ show, onHide, note, onUpdate }: ShareModalProps) {
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const linkInputRef = useRef<HTMLInputElement>(null);

    const isPublic = note?.share?.public || false;
    const shareLink = `${window.location.origin}/note/shared/${note?.id}`;

    async function handleToggle() {
        setLoading(true);
        try {
            const newPublicState = !isPublic;
            // Update backend
            const res = await notesApi.update(note.id, {
                share: {
                    ...note.share,
                    public: newPublicState
                }
            });
            // Update parent state
            onUpdate(note.id, res.data.data);
        } catch (error) {
            console.error('Failed to update share settings', error);
            alert('Failed to update share settings');
        } finally {
            setLoading(false);
        }
    }

    function copyToClipboard() {
        if (linkInputRef.current) {
            linkInputRef.current.select();
            navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Share Note</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <h6 className="mb-0">Public Access</h6>
                        <small className="text-muted">Allow anyone with the link to view this note.</small>
                    </div>
                    <Form.Check
                        type="switch"
                        id="public-switch"
                        checked={isPublic}
                        onChange={handleToggle}
                        disabled={loading}
                        style={{ fontSize: '1.2rem' }}
                    />
                </div>

                {isPublic && (
                    <div className="mt-3">
                        <Form.Label>Share Link</Form.Label>
                        <InputGroup>
                            <Form.Control
                                ref={linkInputRef}
                                value={shareLink}
                                readOnly
                                onClick={(e) => (e.target as HTMLInputElement).select()}
                            />
                            <Button variant={copied ? "success" : "outline-secondary"} onClick={copyToClipboard}>
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                        </InputGroup>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}
