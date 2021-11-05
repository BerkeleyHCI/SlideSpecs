import React from "react";
import BaseComponent from "../components/BaseComponent.jsx";

class LocalLink extends BaseComponent {
    render() {
        const { to, className } = this.props;
        return (
            this.renderRedirect() || (
                <span
                    className={`span-link ${className || ""}`}
                    onClick={() => this.redirectTo(to)}
                >
                    {this.props.children}
                </span>
            )
        );
    }
}

export default LocalLink;
