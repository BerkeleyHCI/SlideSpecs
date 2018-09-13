import React, {Component} from 'react';
import Message from '../components/Message.jsx';

class ForbiddenPage extends Component {
  render() {
    return (
      <div className="page not-found">
        <div className="main-content">
          <Message title="forbidden" />
        </div>
      </div>
    );
  }
}

export default ForbiddenPage;
