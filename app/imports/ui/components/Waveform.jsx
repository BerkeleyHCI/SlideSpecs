// components/waveform.js
import React from "react";
import ReactDOM from "react-dom";
import _ from "lodash";

// exposed through main.html. npm broken
//import WaveSurfer from 'wavesurfer.js';
//import CursorPlugin from 'wavesurfer.js/src/plugin/cursor.js';

// wavesurfer docs
// https://wavesurfer-js.org/docs/methods.html
// https://wavesurfer-js.org/docs/options.html

// wavesurfer plugins
// https://wavesurfer-js.org/example/regions/index.html
// https://wavesurfer-js.org/example/annotation/index.html
// https://wavesurfer-js.org/example/elan/index.html?fill

export default class Waveform extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            wavesurfer: {},
            playing: false,
            visible: false,
            currentTime: 0,
            audioSpeed: 1,
            duration: 0,
        };
    }

    componentDidMount() {
        this.$el = ReactDOM.findDOMNode(this);
        this.$waveform = this.$el.querySelector(".wave");
        try {
            let cursor = WaveSurfer.cursor.create({
                formatTime: this.formatTime,
                showTime: true,
                opacity: 1,
                customShowTimeStyle: {
                    "background-color": "rgba(100, 100, 100, 0.9)",
                    "font-family": "monospace",
                    "margin-bottom": "0px",
                    padding: "0px 4px",
                    color: "#eee",
                },
            });

            let regions = WaveSurfer.regions.create({
                dragSelection: false,
                region: {},
            });

            const options = {
                height: 80,
                normalize: true,
                responsive: true,
                container: this.$waveform,
                waveColor: "#ccc",
                progressColor: "aliceblue",
                cursorColor: "white",
                plugins: [cursor, regions],
            };

            let wavesurfer = WaveSurfer.create(options);
            let st, source, length;
            var seekingPos = null;
            var seekingDiff = 0;

            wavesurfer.on("ready", () => {
                const duration = wavesurfer.getDuration();
                const audioSet = this.props.handleAudioSet;
                if (audioSet) audioSet(duration);
                this.setState({ duration, visible: true });
                st = new window.soundtouch.SoundTouch(
                    wavesurfer.backend.ac.sampleRate
                );
                var buffer = wavesurfer.backend.buffer;
                var channels = buffer.numberOfChannels;
                var l = buffer.getChannelData(0);
                var r = channels > 1 ? buffer.getChannelData(1) : l;
                length = buffer.length;
                source = {
                    extract: function (target, numFrames, position) {
                        if (seekingPos != null) {
                            seekingDiff = seekingPos - position;
                            seekingPos = null;
                        }

                        position += seekingDiff;

                        for (var i = 0; i < numFrames; i++) {
                            target[i * 2] = l[i + position];
                            target[i * 2 + 1] = r[i + position];
                        }

                        return Math.min(numFrames, length - position);
                    },
                };
            });

            // fixing audio playback rates
            let soundtouchNode;
            wavesurfer.on("play", function () {
                seekingPos = ~~(
                    wavesurfer.backend.getPlayedPercents() * length
                );
                st.tempo = wavesurfer.getPlaybackRate();

                if (st.tempo === 1) {
                    wavesurfer.backend.disconnectFilters();
                } else {
                    if (!soundtouchNode) {
                        var filter = new window.soundtouch.SimpleFilter(
                            source,
                            st
                        );
                        soundtouchNode = window.soundtouch.getWebAudioNode(
                            wavesurfer.backend.ac,
                            filter
                        );
                    }
                    wavesurfer.backend.setFilter(soundtouchNode);
                }
            });

            wavesurfer.on("pause", function () {
                soundtouchNode && soundtouchNode.disconnect();
            });

            wavesurfer.on("seek", function () {
                seekingPos = ~~(
                    wavesurfer.backend.getPlayedPercents() * length
                );
            });

            // updating the timestamps: https://codepen.io/BusyBee/pen/pbXzgg
            wavesurfer.on("audioprocess", () => {
                const currentTime = wavesurfer.getCurrentTime();
                this.setState({ currentTime });
            });

            this.setState({ wavesurfer, cursor, regions }, this.loadAudio);
        } catch (e) {
            console.error(e);
        }
    }

    componentWillUnmount() {
        const { wavesurfer } = this.state;
        if (wavesurfer && wavesurfer.unAll) {
            wavesurfer.unAll();
            wavesurfer.pause();
        }
    }

    loadAudio = () => {
        const { wavesurfer } = this.state;
        const { src } = this.props;
        wavesurfer.load(src);
    };

    getDuration = () => {
        const { duration } = this.state;
        return duration;
    };

    getCurrentTime = () => {
        const { currentTime } = this.state;
        return currentTime;
    };

    playAudio = () => {
        const { playing, wavesurfer } = this.state;
        this.setState({ playing: !playing });
        if (wavesurfer && wavesurfer.playPause) {
            wavesurfer.playPause();
        }
    };

    playTime = (time) => {
        const { wavesurfer } = this.state;
        if (wavesurfer && wavesurfer.play) {
            this.setState({ playing: true });
            wavesurfer.play(time);
        }
    };

    formatTime = (time) => {
        const min = Math.floor((time % 3600) / 60);
        let sec = (time % 60).toFixed(1);
        sec = sec >= 10 ? sec : `0${sec}`;
        return [min, sec].join(":");
    };

    clearRegions = () => {
        const { wavesurfer } = this.state;
        if (!wavesurfer || !wavesurfer.clearRegions) return;
        wavesurfer.clearRegions();
    };

    toggleAudioSpeed = () => {
        const { wavesurfer, audioSpeed } = this.state;
        if (!wavesurfer || !wavesurfer.setPlaybackRate) return;
        const newAudioSpeed = audioSpeed > 2 ? 1 : audioSpeed + 0.5;
        this.setState({ audioSpeed: newAudioSpeed });
        wavesurfer.setPlaybackRate(newAudioSpeed);
    };

    addRegion = (region) => {
        const { wavesurfer } = this.state;
        if (!wavesurfer || !wavesurfer.addRegion) return;
        return wavesurfer.addRegion({
            start: region.startTime,
            end: region.endTime,
            drag: false,
            resize: false,
            color: region.color ? region.color : "rgba(255, 255, 255, .4)",
        });
    };

    renderAudioTag = (name = "") => {
        return (
            <span>
                <i className={`fa fa-${name}`} />
                {name} discussion audio
            </span>
        );
    };

    renderTitle = () => {
        const { duration, currentTime, playing, audioSpeed } = this.state;
        const playclass = playing ? "empty" : "primary";
        const playTag = this.renderAudioTag("play");
        const pauseTag = this.renderAudioTag("pause");

        return (
            <div>
                <button
                    className={`pull-left btn btn-menu btn-${playclass}`}
                    onClick={this.playAudio}
                >
                    {playing ? pauseTag : playTag}
                </button>
                <button
                    className={`bottom btn btn-menu btn-${playclass}`}
                    onClick={this.toggleAudioSpeed}
                >
                    {audioSpeed.toFixed(1)}x
                </button>
                <code>
                    {this.formatTime(currentTime)}|{this.formatTime(duration)}
                </code>
            </div>
        );
    };

    render() {
        const { visible, playing } = this.state;
        const title = this.renderTitle();
        const vizClass = visible ? "" : "waveform-hidden";
        return (
            <div className={`waveform ${vizClass}`}>
                {title}
                <div className="wave" />
            </div>
        );
    }
}

Waveform.defaultProps = {
    src: "",
};
