import React from 'react';
import PropTypes from 'prop-types';

export const Message = ({title, subtitle}) => (
  <div className="wrapper-message">
    <div className="title-message">{title}</div>
    {subtitle ? <div className="subtitle-message">{subtitle}</div> : null}
  </div>
);

Message.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

Message.defaultProps = {
  title: '',
  subtitle: '',
};

// Spacing alternative.

export const FullMessage = ({title, subtitle}) => (
  <div className="rel-wrapper wrapper-message">
    <div className="title-message">{title}</div>
    {subtitle ? <div className="subtitle-message">{subtitle}</div> : null}
  </div>
);

FullMessage.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

FullMessage.defaultProps = {
  title: '',
  subtitle: '',
};
