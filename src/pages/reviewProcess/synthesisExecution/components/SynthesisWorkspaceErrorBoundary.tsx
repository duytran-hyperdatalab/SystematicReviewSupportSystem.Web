import React from "react";

interface SynthesisWorkspaceErrorBoundaryProps {
  children: React.ReactNode;
}

interface SynthesisWorkspaceErrorBoundaryState {
  hasError: boolean;
}

export default class SynthesisWorkspaceErrorBoundary extends React.Component<
  SynthesisWorkspaceErrorBoundaryProps,
  SynthesisWorkspaceErrorBoundaryState
> {
  state: SynthesisWorkspaceErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Synthesis workspace crashed", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-red-900">Synthesis workspace failed to render</h2>
          <p className="mt-2 text-sm text-red-700">
            Refresh the page or return to the project workflow if the problem persists.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}