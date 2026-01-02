import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full">
            <h2 className="text-xl font-bold text-slate-800 mb-2">문제가 발생했습니다 😢</h2>
            <p className="text-sm text-slate-500 mb-6">
              앱을 실행하는 도중 오류가 발생했습니다.<br/>
              {this.state.error?.message && <span className="text-red-400 text-xs block mt-2 bg-red-50 p-2 rounded">Error: {this.state.error.message}</span>}
            </p>
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }} 
              className="w-full bg-slate-800 text-white py-3 rounded-xl font-medium hover:bg-slate-900 transition mb-3"
            >
              데이터 초기화 및 새로고침
            </button>
            <p className="text-[10px] text-slate-400">
              * 초기화 시 저장된 기록이 삭제됩니다.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);