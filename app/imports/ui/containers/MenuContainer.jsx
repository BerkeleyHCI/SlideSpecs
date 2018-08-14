import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from '../components/BaseComponent.jsx';
import UserMenu from '../components/UserMenu.jsx';

class MenuContainer extends BaseComponent {
  render = () => {
    console.log(this.props);
    const {user, guest, reviewer, logout, content} = this.props;
    return (
      <div>
        <UserMenu
          user={user}
          guest={guest}
          reviewer={reviewer}
          logout={logout}
        />
        <div id="content-container">{content}</div>
      </div>
    );
  };
}

MenuContainer.propTypes = {
  content: PropTypes.element.isRequired,
};

//logout: PropTypes.fn.isRequired,

export default MenuContainer;
