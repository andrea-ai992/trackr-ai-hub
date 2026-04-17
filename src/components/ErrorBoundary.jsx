
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
    this.handleReset = this.handleReset.bind(this);
    this.handleReload = this.handleReload.bind(this);
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState((prev) => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    try {
      const errorLog = {
        message: error?.message || 'Unknown error',
        stack: error?.stack || '',
        componentStack: errorInfo?.componentStack || '',
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      const existing = JSON.parse(
        localStorage.getItem('trackr_error_log') || '[]'
      );
      existing.push(errorLog);
      if (existing.length > 10) existing.shift();
      localStorage.setItem('trackr_error_log', JSON.stringify(existing));
    } catch (_) {
      // silent
    }

    if (process.env.NODE_ENV === 'development') {
      console.group('[ErrorBoundary] Caught error');
      console.error('Error:', error);
      console.error('Component stack:', errorInfo?.componentStack);
      console.groupEnd();
    }
  }

  handleReset() {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  handleReload() {
    window.location.reload();
  }

  render() {
    const { hasError, error, errorCount } = this.state;
    const { fallback, children, isolate } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback) {
      return typeof fallback === 'function'
        ? fallback({ error, reset: this.handleReset, reload: this.handleReload })
        : fallback;
    }

    const isIsolated = isolate === true;

    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          position: isIsolated ? 'relative' : 'fixed',
          inset: isIsolated ? 'auto' : 0,
          zIndex: isIsolated ? 'auto' : 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isIsolated ? '200px' : '100dvh',
          width: '100%',
          background: isIsolated
            ? 'transparent'
            : 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 50%, #0a0a0f 100%)',
          fontFamily:
            "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
          padding: '1rem',
          boxSizing: 'border-box',
        }}
      >
        <style>{`
          @keyframes eb-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          @keyframes eb-scanline {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100vh); }
          }
          @keyframes eb-glitch {
            0%, 100% { clip-path: inset(0 0 100% 0); }
            20% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 0); }
            40% { clip-path: inset(50% 0 30% 0); transform: translate(2px, 0); }
            60% { clip-path: inset(70% 0 10% 0); transform: translate(-1px, 0); }
            80% { clip-path: inset(10% 0 80% 0); transform: translate(1px, 0); }
          }
          @keyframes eb-fadeIn {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes eb-borderGlow {
            0%, 100% { box-shadow: 0 0 8px #ff2d55, 0 0 24px rgba(255,45,85,0.3), inset 0 0 8px rgba(255,45,85,0.05); }
            50% { box-shadow: 0 0 16px #ff2d55, 0 0 48px rgba(255,45,85,0.5), inset 0 0 16px rgba(255,45,85,0.1); }
          }
          .eb-card {
            animation: eb-fadeIn 0.4s ease-out forwards, eb-borderGlow 3s ease-in-out infinite;
          }
          .eb-icon-pulse {
            animation: eb-pulse 2s ease-in-out infinite;
          }
          .eb-btn-primary:hover {
            background: linear-gradient(135deg, #ff2d55 0%, #ff6b8a 100%) !important;
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 20px rgba(255,45,85,0.5) !important;
          }
          .eb-btn-primary:active {
            transform: translateY(0) !important;
          }
          .eb-btn-secondary:hover {
            background: rgba(255,255,255,0.08) !important;
            border-color: rgba(255,255,255,0.3) !important;
          }
          .eb-details summary:hover {
            color: #a78bfa !important;
          }
        `}</style>

        {!isIsolated && (
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background:
                'linear-gradient(90deg, transparent, rgba(255,45,85,0.4), transparent)',
              animation: 'eb-scanline 4s linear infinite',
              pointerEvents: 'none',
            }}
          />
        )}

        <div
          className="eb-card"
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '480px',
            background:
              'linear-gradient(145deg, rgba(255,45,85,0.06) 0%, rgba(13,13,26,0.95) 40%, rgba(10,10,15,0.98) 100%)',
            border: '1px solid rgba(255,45,85,0.4)',
            borderRadius: '16px',
            padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            overflow: 'hidden',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,45,85,0.8) 30%, rgba(255,107,138,0.6) 50%, rgba(255,45,85,0.8) 70%, transparent 100%)',
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '180px',
              height: '180px',
              background:
                'radial-gradient(circle, rgba(255,45,85,0.12) 0%, transparent 70%)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '0',
            }}
          >
            <div
              className="eb-icon-pulse"
              role="img"
              aria-label="Error icon"
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background:
                  'linear-gradient(135deg, rgba(255,45,85,0.15) 0%, rgba(255,45,85,0.05) 100%)',
                border: '1px solid rgba(255,45,85,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                flexShrink: 0,
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 2L2 20h20L12 2z"
                  stroke="#ff2d55"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 9v5"
                  stroke="#ff2d55"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="17" r="0.75" fill="#ff2d55" />
              </svg>
            </div>

            <h1
              style={{
                margin: '0 0 0.5rem',
                fontSize: 'clamp(1.25rem, 4vw, 1.625rem)',
                fontWeight: '700',
                letterSpacing: '-0.02em',
                color: '#ffffff',
                lineHeight: '1.2',
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                margin: '0 0 0.75rem',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: '1.5',
                maxWidth: '340px',
              }}
            >
              Trackr encountered an unexpected error. Your data is safe.
            </p>

            {error?.message && (
              <div
                style={{
                  width: '100%',
                  marginBottom: '1.25rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255,45,85,0.06)',
                  border: '1px solid rgba(255,45,85,0.2)',
                  borderRadius: '8px',
                  textAlign: 'left',
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.8125rem',
                    color: 'rgba(255,107,138,0.9)',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    wordBreak: 'break-word',
                    lineHeight: '1.5',
                  }}
                >
                  <span style={{ color: 'rgba(255,255,255,0.3)', marginRight: '0.5rem' }}>
                    ⚡
                  </span>
                  {error.message}
                </p>
              </div>
            )}

            {errorCount > 1 && (
              <p
                style={{
                  margin: '0 0 1rem',
                  fontSize: '0.75rem',
                  color: 'rgba(255,165,0,0.7)',
                }}
              >
                ⚠️ Error occurred {errorCount} times
              </p>
            )}

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                width: '100%',
                flexDirection: 'column',
              }}
            >
              <button
                className="eb-btn-primary"
                onClick={this.handleReset}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  background:
                    'linear-gradient(135deg, rgba(255,45,85,0.85) 0%, rgba(220,30,70,0.9) 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  letterSpacing: '0.01em',
                  boxShadow: '0 2px 12px rgba(255,45,85,0.3)',
                }}
              >
                Try again
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  className="eb-btn-secondary"
                  onClick={this.handleReload}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Reload page
                </button>

                <button
                  className="eb-btn-secondary"
                  onClick={() => {
                    window.location.href = '/';
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '10px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Go home
                </button>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details
                className="eb-details"
                style={{
                  width: '100%',
                  marginTop: '1.25rem',
                  textAlign: 'left',
                }}
              >
                <summary
                  style={{
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    color: 'rgba(167,139,250,0.7)',
                    userSelect: 'none',
                    transition: 'color 0.2s',
                    listStyle: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Stack trace (dev only)
                </summary>
                <pre
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.875rem',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    fontSize: '0.6875rem',
                    color: 'rgba(255,255,255,0.45)',
                    overflow: 'auto',
                    maxHeight: '180px',
                    lineHeight: '1.6',
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {this.state.error?.stack}
                  {'\n\nComponent Stack:'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <p
              style={{
                marginTop: '1.25rem',
                fontSize: '0.6875rem',
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Trackr · Error Boundary v1
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;