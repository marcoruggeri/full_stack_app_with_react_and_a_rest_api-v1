import React, { Component } from 'react';
import { Redirect, Link } from 'react-router-dom';

export default () => (
    <div className="bounds">
        <h1>Error</h1>
        <p>Sorry! We just encountered an unexpected error.</p>
        <Link className="button" to="/">Return Home</Link>
    </div>
);


export class ErrorBoundary extends Component {
    constructor(props) {
      super(props);
      this.state = { error: null, errorInfo: null };
    }
    
    componentDidCatch(error, errorInfo) {
      // Catch errors in any components below and re-render with error message
      this.setState({
        error: error,
        errorInfo: errorInfo
      })
    }
    
    render() {
      if (this.state.errorInfo) {
        // Error path
        return (
          <div>
            <Redirect to="/error" />
          </div>
        );
      }
      // Normally, just render children
      return this.props.children;
    }  
  }