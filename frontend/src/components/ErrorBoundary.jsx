import React from 'react';

/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console (in production, you might send this to an error reporting service)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '3rem',
            maxWidth: '500px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😵</div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              marginBottom: '1rem',
              color: '#1e293b'
            }}>
              Something went wrong
            </h1>
            <p style={{ 
              color: '#64748b', 
              marginBottom: '1.5rem',
              lineHeight: 1.6
            }}>
              We're sorry, but something unexpected happened. Please try again.
            </p>
            <button
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Reload Page
            </button>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ 
                marginTop: '2rem', 
                textAlign: 'left',
                backgroundColor: '#fef2f2',
                padding: '1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#991b1b'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ 
                  marginTop: '0.5rem', 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
