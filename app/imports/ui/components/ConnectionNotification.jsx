import React from 'react';

const ConnectionNotification = () => (
  <div className="notifications">
    <div className="notification">
      <span className="icon-sync" />
      <div className="meta">
        <div className="title-notification">trying To Connect</div>
        <div className="description">connection issue</div>
      </div>
    </div>
  </div>
);

export default ConnectionNotification;
