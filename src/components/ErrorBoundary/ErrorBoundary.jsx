import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <h1 className="error-title">Something went wrong</h1>
            <p className="error-message">
              We encountered an unexpected error. Please try again or contact support.
            </p>
            <button className="reset-button" onClick={this.resetError}>
              Reset
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error details (dev only)</summary>
                <pre className="error-stack">
                  {this.state.error?.toString()}
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
```

```css
.error-boundary-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
  padding: 1rem;
  box-sizing: border-box;
}

.error-boundary-content {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background-color: var(--bg2);
  text-align: center;
}

.error-title {
  font-size: 1.5rem;
  margin: 0 0 1rem 0;
  color: var(--green);
}

.error-message {
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 1.5rem 0;
  color: var(--t2);
}

.reset-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--green);
  color: var(--bg);
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
}

.reset-button:hover {
  background-color: #00e67a;
}

.error-details {
  margin-top: 1.5rem;
  text-align: left;
  font-size: 0.8rem;
}

.error-details summary {
  cursor: pointer;
  color: var(--t3);
  margin-bottom: 0.5rem;
}

.error-stack {
  white-space: pre-wrap;
  word-wrap: break-word;
  background-color: rgba(0, 255, 136, 0.1);
  padding: 0.5rem;
  border-radius: 4px;
  color: var(--t2);
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}