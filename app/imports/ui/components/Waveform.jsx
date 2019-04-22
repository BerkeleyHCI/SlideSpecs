// components/waveform.js
import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

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
      currentTime: 0,
      duration: 0,
      region: {},
    };
  }

  componentDidMount() {
    this.$el = ReactDOM.findDOMNode(this);
    this.$waveform = this.$el.querySelector('.wave');
    try {
      let cursor = WaveSurfer.cursor.create({
        formatTime: this.formatTime,
        showTime: true,
        opacity: 1,
        customShowTimeStyle: {
          'background-color': 'rgba(100, 100, 100, 0.8)',
          'font-family': 'monospace',
          'margin-top': '0px',
          padding: '0px 4px',
          color: '#eee',
        },
      });

      let regions = WaveSurfer.regions.create({
        dragSelection: false,
        region: {},
      });

      const options = {
        normalize: true,
        responsive: true,
        container: this.$waveform,
        waveColor: '#ccc',
        progressColor: 'aliceblue',
        cursorColor: 'white',
        plugins: [cursor, regions],
      };

      let wavesurfer = WaveSurfer.create(options);

      // updating the timestamps: https://codepen.io/BusyBee/pen/pbXzgg
      wavesurfer.on('audioprocess', () => {
        const time = this.formatTime(wavesurfer.getCurrentTime());
        this.setState({currentTime: time});
      });

      wavesurfer.on('ready', () => {
        const duration = wavesurfer.getDuration();
        const audioSet = this.props.handleAudioSet;
        if (audioSet) audioSet(duration);
        this.setState({duration});
      });

      this.setState({wavesurfer, cursor, regions}, this.loadAudio);
    } catch (e) {
      console.error(e);
    }
  }

  componentWillUnmount() {
    const {wavesurfer} = this.state;
    if (wavesurfer && wavesurfer.unAll) {
      wavesurfer.unAll();
      wavesurfer.pause();
    }
  }

  loadAudio = () => {
    const {wavesurfer} = this.state;
    const {src} = this.props;
    wavesurfer.load(src);
  };

  getDuration = () => {
    const {duration} = this.state;
    return duration;
  };

  playAudio = () => {
    const {playing, wavesurfer} = this.state;
    this.setState({playing: !playing});
    if (wavesurfer && wavesurfer.playPause) {
      wavesurfer.playPause();
    }
  };

  playTime = time => {
    const {wavesurfer} = this.state;
    if (wavesurfer && wavesurfer.play) {
      this.setState({playing: true});
      wavesurfer.play(time);
    }
  };

  formatTime = time => {
    const min = Math.floor((time % 3600) / 60);
    let sec = (time % 60).toFixed(1);
    sec = sec >= 10 ? sec : `0${sec}`;
    return [min, sec].join(':');
  };

  clearRegions = () => {
    const {wavesurfer} = this.state;
    if (!wavesurfer || !wavesurfer.clearRegions) return;
    wavesurfer.clearRegions();
  };

  addRegion = region => {
    const {wavesurfer} = this.state;
    if (!wavesurfer || !wavesurfer.addRegion) return;
    return wavesurfer.addRegion({
      start: region.startTime,
      end: region.endTime,
      drag: false,
      resize: false,
      color: region.color ? region.color : 'rgba(255, 255, 255, .4)',
    });
  };

  renderTitle = () => {
    const {duration, currentTime, playing} = this.state;
    const playclass = playing ? 'empty' : 'primary';
    return (
      <span className="list-title">
        <button
          className={`btn btn-menu btn-${playclass}`}
          onClick={this.playAudio}>
          {playing ? 'pause' : 'play discussion audio'}
        </button>
        <code className="pull-right">
          {currentTime} / {this.formatTime(duration)}
        </code>
      </span>
    );
  };

  render() {
    const {playing} = this.state;
    const title = this.renderTitle();

    return (
      <div className="waveform">
        {title}
        <div className="wave" />
      </div>
    );
  }
}

Waveform.defaultProps = {
  region: {},
  src: '',
};
