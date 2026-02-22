import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function LandingPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Hero Section */}
            <div className="bg-light py-5 flex-grow-1 d-flex align-items-center">
                <Container>
                    <Row className="align-items-center">
                        <Col lg={6} className="mb-5 mb-lg-0">
                            <h1 className="display-4 fw-bold mb-4">Master Your Thoughts, <br /> <span className="text-primary">Organize Your Life</span></h1>
                            <p className="lead text-muted mb-5">
                                The modern note-taking app for professionals. Capture ideas, create lists, and track tasks in one beautiful place.
                                experience the power of organized thinking.
                            </p>
                            <div className="d-flex gap-3">
                                <Link to="/register">
                                    <Button variant="primary" size="lg" className="px-5">Get Started Free</Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="outline-secondary" size="lg" className="px-5">Log In</Button>
                                </Link>
                            </div>
                        </Col>
                        <Col lg={6}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    transform: 'rotate(-2deg)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                                }}>
                                    <Card className="border-0 shadow-lg" style={{ transform: 'rotate(2deg)' }}>
                                        <Card.Body className="p-4">
                                            <h4 className="mb-3">Weekly Goals 🚀</h4>
                                            <div className="d-flex align-items-center mb-3">
                                                <input type="checkbox" checked readOnly className="form-check-input me-2" />
                                                <span className="text-decoration-line-through text-muted">Complete project proposal</span>
                                            </div>
                                            <div className="d-flex align-items-center mb-3">
                                                <input type="checkbox" className="form-check-input me-2" />
                                                <span>Review design mockups</span>
                                            </div>
                                            <div className="d-flex align-items-center mb-3">
                                                <input type="checkbox" className="form-check-input me-2" />
                                                <span>Team sync meeting</span>
                                            </div>
                                            <div className="mt-3 p-3 bg-light rounded">
                                                <small className="text-muted d-block mb-1">Note</small>
                                                <strong>Don't forget to send the invoice by Friday!</strong>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Features Section */}
            <div className="py-5 bg-white">
                <Container>
                    <Row className="text-center mb-5">
                        <Col>
                            <h2 className="fw-bold">Everything you need</h2>
                            <p className="text-muted">Powerful features to boost your productivity</p>
                        </Col>
                    </Row>
                    <Row className="g-4">
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm text-center p-4">
                                <div className="display-6 text-primary mb-3">📝</div>
                                <h5>Rich Text Editor</h5>
                                <p className="text-muted">Format your notes your way with our powerful rich text editor. Support for images, lists, and more.</p>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm text-center p-4">
                                <div className="display-6 text-primary mb-3">🏷️</div>
                                <h5>Organize</h5>
                                <p className="text-muted">Keep everything structured with notebooks and tags. Find what you need instantly.</p>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="h-100 border-0 shadow-sm text-center p-4">
                                <div className="display-6 text-primary mb-3">☁️</div>
                                <h5>Sync Everywhere</h5>
                                <p className="text-muted">Access your notes from any device. Your data is strictly synced and secure.</p>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* Footer */}
            <footer className="bg-light py-4 border-top">
                <Container className="text-center text-muted">
                    <small>&copy; 2024 NoteApp. All rights reserved.</small>
                </Container>
            </footer>
        </div>
    );
}
