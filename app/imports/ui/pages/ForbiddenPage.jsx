import React from 'react';
import MenuContainer from '../containers/MenuContainer.jsx';
import BaseComponent from '../components/BaseComponent.jsx';
import {Message} from '../components/Message.jsx';

class ForbiddenPage extends BaseComponent {
  render() {
    const content = (
      <div className="page not-found">
        <div className="main-content">
          <Message title="Forbidden Access" />
        </div>
      </div>
    );

    return <MenuContainer {...this.props} content={content} />;
  }
}

export default ForbiddenPage;
