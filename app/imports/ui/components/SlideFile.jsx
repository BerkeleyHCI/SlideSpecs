import React, { Component } from "react";
import { deleteFile } from "../../api/files/methods.js";
import Img from "../components/Image.jsx";

class SlideFile extends Component {
    removeFile = () => {
        const { fileId } = this.props;
        deleteFile.call({ fileId });
    };

    render() {
        const { iter, fileUrl, handleLoad } = this.props;
        return (
            <div className="file-item file-item-review">
                <div className="slide-container">
                    <div className="overlay">
                        <p>{iter}</p>
                    </div>
                    <Img
                        className="slide"
                        source={fileUrl}
                        onLoad={handleLoad}
                    />
                </div>
            </div>
        );
    }
}

export default SlideFile;
