import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import UserMenu from '../components/UserMenu.jsx';

class MenuContainer extends BaseComponent {
  render = () => {
    const {user, reviewer, content} = this.props;
    return (
      <div>
        <UserMenu user={user} reviewer={reviewer} />
        <div id="content-container">{content}</div>
      </div>
    );
  };
}

MenuContainer.propTypes = {
  content: PropTypes.element.isRequired,
};

export default MenuContainer;
