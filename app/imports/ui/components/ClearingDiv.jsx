import React, {Component} from 'react';

class ClearingDiv extends Component {
  render() {
    const {set, pre, clear} = this.props;
    return (
      set && (
        <div>
          <hr />
          <p>
            <strong>view {pre}: </strong>
            {set}
            <button onClick={clear} className="btn btn-menu pull-right">
              clear
            </button>
          </p>
        </div>
      )
    );
  }
}

export default ClearingDiv;
