import React from 'react';

const AppNotification = ({icon, msg, desc}) => (
  <div className="notifications">
    <div className="notification">
      {icon && <i className={'fa fa-' + icon} />}
      <div className="meta">
        <div className="title-notification">{msg}</div>
        <div className="description">{desc}</div>
      </div>
    </div>
  </div>
);

export default AppNotification;
