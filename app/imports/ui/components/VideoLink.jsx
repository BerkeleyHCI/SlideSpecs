import React, { Component } from "react";

//<VideoLink video={'hrCHEy5k_rU'} />
//<VideoLink video={'mHI9E5xycc4'} />

export default class VideoLink extends Component {
    render() {
        const { video } = this.props;
        return (
            <div className="embed-container">
                <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${video}?rel=0&autohide=2`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                />
            </div>
        );
    }
}
