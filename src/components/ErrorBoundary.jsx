import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', overflow: 'auto', width: '100%', wordBreak: 'break-word', marginTop: '20px' }}>
                    <h2 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '10px' }}>Error crítico UI</h2>
                    <p style={{ fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
                    <pre style={{ fontSize: '10px', marginTop: '10px', whiteSpace: 'pre-wrap' }}>
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
