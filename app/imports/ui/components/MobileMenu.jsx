import React from 'react';
import PropTypes from 'prop-types';
import BaseComponent from './BaseComponent.jsx';

class MobileMenu extends BaseComponent {
  constructor(props) {
    super(props);
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.props.menuOpen.set(!this.props.menuOpen.get());
  }

  render() {
    return (
      <div className="nav-group">
        <a href="#toggle-menu" className="nav-item" onClick={this.toggleMenu}>
          <span className="icon-list-unordered" title="showMenu" />
        </a>
      </div>
    );
  }
}

MobileMenu.propTypes = {
  menuOpen: PropTypes.object.isRequired,
};

export default MobileMenu;
