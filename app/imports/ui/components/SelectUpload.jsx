import React from "react";
import PropTypes from "prop-types";
import BaseComponent from "./BaseComponent.jsx";

class SelectUpload extends BaseComponent {
    componentDidMount() {
        this.myRef = React.createRef();
    }
    render() {
        const { handleUpload, labelText, className, inProgress } = this.props;
        return (
            <label className={`btn ${className}`}>
                {labelText}
                <input
                    ref={this.myRef}
                    type={"file"}
                    id={"fileinput"}
                    disabled={inProgress}
                    onChange={handleUpload}
                    multiple
                />
            </label>
        );
    }
}

SelectUpload.propTypes = {
    handleUpload: PropTypes.func.isRequired,
    labelText: PropTypes.string,
};

SelectUpload.defaultProps = {
    labelText: "+ select",
};

export default SelectUpload;
