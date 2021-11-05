import React, { Component } from "react";

class Expandable extends Component {
    constructor(props) {
        super(props);
        this.state = { open: this.props.defaultOpen };
    }

    toggleOpen = () => {
        const { open } = this.state;
        this.setState({ open: !open });
    };

    render() {
        const { open } = this.state;
        let expander = open ? " [ − ] " : " [ + ] ";
        const eClass = open ? "expandable-open" : "expandable-closed";
        return (
            <div className={`padded expandable ${eClass}`}>
                <span className="pull-right note" onClick={this.toggleOpen}>
                    {expander}
                </span>
                {this.props.children}
            </div>
        );
    }
}

Expandable.defaultProps = {
    defaultOpen: false,
};

export default Expandable;
