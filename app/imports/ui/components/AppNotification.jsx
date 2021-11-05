import React from "react";
import PropTypes from "prop-types";

const AppNotification = ({ icon, msg, desc }) => (
    <div className="notifications">
        <div className="notification">
            {icon && <i className={"fa fa-" + icon} />}
            <div className="meta">
                <div className="title-notification">{msg}</div>
                <div className="description">{desc}</div>
            </div>
        </div>
    </div>
);

AppNotification.propTypes = {
    icon: PropTypes.string,
    msg: PropTypes.string,
    desc: PropTypes.string,
};

export default AppNotification;
