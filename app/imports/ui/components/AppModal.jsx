import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Modal, Button} from 'react-bootstrap';

class AppModal extends Component {
  render() {
    const {mtitle, mtext, accept, deny, denyText, isOpen, act} = this.props;
    return (
      <Modal show={isOpen} onHide={deny}>
        <Modal.Header closeButton>
          <Modal.Title>{mtitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{mtext}</Modal.Body>
        <Modal.Footer>
          {accept && (
            <Button className="btn btn-primary" onClick={accept}>
              {act}
            </Button>
          )}
          {deny && (
            <Button className="btn btn-danger" onClick={deny}>
              {denyText}
            </Button>
          )}
        </Modal.Footer>
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
  act: PropTypes.string,
};

AppModal.defaultProps = {
  mtitle: '',
  mtext: '',
  accept: console.log,
  deny: console.log,
  denyText: 'cancel',
  act: '',
};

export default AppModal;
