import React from 'react';
import BaseComponent from './BaseComponent.jsx';

class Loading extends BaseComponent {
  render() {
    return <img src="/loading.svg" className="loading-app" alt="loading..." />;
  }
}

export default Loading;
