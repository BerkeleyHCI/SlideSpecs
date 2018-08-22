import React, {Component} from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';

// maybve needed for parent element

class AppModal extends Component {
  componentDidMount = () => {
    Modal.setAppElement('body');
  };

  render() {
    const {mtitle, mtext, accept, deny, isOpen, act} = this.props;
    return (
      <Modal
        className="Modal__Bootstrap modal-dialog"
        isOpen={isOpen}
        className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title">{mtitle}</h1>
          </div>
          <div className="modal-body">{mtext}</div>
          <div className="modal-footer">
            <button onClick={accept}>confirm {act}</button>
            <button onClick={this.deny}>cancel</button>
          </div>
        </div>
      </Modal>
    );
  }
}

AppModal.propTypes = {
  isOpen: PropTypes.bool,
  mtitle: PropTypes.string,
  mtext: PropTypes.string,
  accept: PropTypes.func,
  deny: PropTypes.func,
};

AppModal.defaultProps = {
  mtitle: 'FILLER TITLE',
  mtext: 'FILLER TEXT',
  accept: console.log,
  deny: console.log,
  act: '',
};

export default AppModal;
