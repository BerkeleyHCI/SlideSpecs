import React, {Component} from 'react';
import PropTypes from 'prop-types';

const ClearingDiv = ({set, pre, clear}) => {
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
};

ClearingDiv.propTypes = {
  pre: PropTypes.string,
  clear: PropTypes.func,
};

export default ClearingDiv;
