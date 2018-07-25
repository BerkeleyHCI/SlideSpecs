import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import MobileMenu from '../components/MobileMenu.jsx';
import Message from '../components/Message.jsx';

class NotFoundPage extends BaseComponent {
  render() {
    return (
      <div className="page not-found">
        <nav>
          <MobileMenu menuOpen={this.props.menuOpen} />
        </nav>
        <div className="content-scrollable">
          <Message title="page Not Found" />
        </div>
      </div>
    );
  }
}

NotFoundPage.propTypes = {
  menuOpen: PropTypes.object.isRequired,
};

export default NotFoundPage;
