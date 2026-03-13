import { useState, type FormEvent } from 'react';
import { Form, Button, Card, Container, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { authApi } from './api';

export function ResetPassword() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        // Client-side validation
        if (!password) {
            setError('Please enter a new password.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!token) {
            setError('Invalid reset link. Please request a new one.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await authApi.resetPassword(token, { password });
            setSuccessMessage(res.data.message || 'Password reset successful!');
            // Auto-redirect to login after 3 seconds
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again or request a new reset link.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
            <Card style={{ width: '420px', maxWidth: '100%' }} className="shadow-sm">
                <Card.Body className="p-4">
                    <h2 className="text-center mb-2">Reset Password</h2>
                    <p className="text-center text-muted mb-4" style={{ fontSize: '0.92rem' }}>
                        Enter your new password below.
                    </p>

                    {error && (
                        <Alert variant="danger">
                            {error}
                            {error.toLowerCase().includes('expired') || error.toLowerCase().includes('invalid') ? (
                                <div className="mt-2">
                                    <Link to="/forgot-password">Request a new reset link</Link>
                                </div>
                            ) : null}
                        </Alert>
                    )}

                    {successMessage ? (
                        <Alert variant="success">
                            <strong>Success!</strong> {successMessage}
                            <div className="mt-2">
                                Redirecting to <Link to="/login">login</Link>...
                            </div>
                        </Alert>
                    ) : (
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="resetPassword">
                                <Form.Label>New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="At least 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoFocus
                                    disabled={isLoading}
                                />
                            </Form.Group>

                            <Form.Group className="mb-4" controlId="confirmPassword">
                                <Form.Label>Confirm New Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Re-enter your new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    isInvalid={confirmPassword.length > 0 && password !== confirmPassword}
                                />
                                <Form.Control.Feedback type="invalid">
                                    Passwords do not match.
                                </Form.Control.Feedback>
                            </Form.Group>

                            <Button variant="primary" type="submit" className="w-100 mb-3" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                        {' '}Resetting...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>
                        </Form>
                    )}

                    <div className="text-center mt-2">
                        <small className="text-muted">
                            <Link to="/login">Back to Login</Link>
                        </small>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
