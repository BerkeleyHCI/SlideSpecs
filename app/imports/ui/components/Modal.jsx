import React, {Component} from 'react';
import PropTypes from 'prop-types';

export class ModalButton extends Component {
  render() {
    return (
      <button
        type="button"
        class="btn btn-primary"
        data-target="#appModal"
        data-toggle="modal">
        Launch demo modal
      </button>
    );
  }
}

export class Modal extends Component {
  render() {
    const {mtitle, mtext, accept, deny, act} = this.props;
    return (
      <div id="appModal" class="modal fade">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{mtitle}</h5>
            </div>
            <div class="modal-body">{mtext}</div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-primary"
                onClick={accept}
                data-dismiss="modal">
                confirm {act}
              </button>
              <button
                type="button"
                class="btn btn-danger"
                onClick={deny}
                data-dismiss="modal">
                cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
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
