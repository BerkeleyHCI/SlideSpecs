import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';

class Modal extends Component {
  render() {
    //console.log(this.props);
    const {mtitle, mtext, accept, deny, isOpen, act} = this.props;
    return (
      <ReactModal isOpen={isOpen} className="modal">
        <h1>{mtitle}</h1>
        <div className="modal-body">{mtext}</div>
        <div className="modal-footer">
          <button onClick={accept}>confirm {act}</button>
          <button onClick={this.deny}>cancel</button>
        </div>
      </ReactModal>
    );
  }
}

Modal.propTypes = {
  isOpen: PropTypes.bool,
  mtitle: PropTypes.string,
  mtext: PropTypes.string,
  accept: PropTypes.func,
  deny: PropTypes.func,
};

Modal.defaultProps = {
  mtitle: 'FILLER TITLE',
  mtext: 'FILLER TEXT',
  accept: console.log,
  deny: console.log,
  act: '',
};

export default Modal;
