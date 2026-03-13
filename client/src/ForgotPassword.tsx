import { useState, type FormEvent } from 'react';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { authApi } from './api';

export function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setError('Please enter your email address.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await authApi.forgotPassword({ email: trimmedEmail });
            setSuccessMessage(res.data.message || 'If that email is registered, a reset link has been sent.');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '420px', maxWidth: '100%' }} className="shadow-sm">
                <Card.Body className="p-4">
                    <h2 className="text-center mb-2">Forgot Password</h2>
                    <p className="text-center text-muted mb-4" style={{ fontSize: '0.92rem' }}>
                        Enter your account email and we'll send you a reset link.
                    </p>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {successMessage && (
                        <Alert variant="success">
                            <strong>Check your inbox!</strong>
                            <br />
                            {successMessage}
                        </Alert>
                    )}

                    {!successMessage && (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-4" controlId="forgotEmail">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                    disabled={isLoading}
                                />
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        {' '}Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </Button>
                        </Form>
                    )}

                    <div className="text-center mt-2">
                        <small className="text-muted">
                            Remember your password? <Link to="/login">Log in</Link>
                        </small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
