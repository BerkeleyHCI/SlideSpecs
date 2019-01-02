import React, {Component} from 'react';
import {Message} from '../components/Message.jsx';
import Loading from '../components/Loading.jsx';

class NotFoundPage extends Component {
  render() {
    return (
      <div className="page not-found">
        <div className="main-content">
          <Message title="page not found" />
        </div>
      </div>
    );
  }
}

export default NotFoundPage;
