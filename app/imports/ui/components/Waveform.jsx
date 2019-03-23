// components/waveform.js
import React from 'react';
import ReactDOM from 'react-dom';

// exposed through main.html. npm broken
//import WaveSurfer from 'wavesurfer.js';
//import CursorPlugin from 'wavesurfer.js/src/plugin/cursor.js';
//WaveSurfer.timeline.create({ container: '#wave-timeline', }),

export default class Waveform extends React.Component {
  constructor(props) {
    super(props);
    this.state = {wavesurfer: {}, playing: false};
  }

  componentDidMount() {
    this.$el = ReactDOM.findDOMNode(this);
    this.$waveform = this.$el.querySelector('.wave');
    try {
      const cursor = WaveSurfer.cursor.create({
        showTime: true,
        opacity: 1,
        customShowTimeStyle: {
          'background-color': '#000',
          color: '#eee',
          padding: '2px',
          'margin-top': '0px',
          'font-size': '12px',
        },
      });

      const options = {
        mediaControls: true,
        container: this.$waveform,
        waveColor: '#ccc',
        progressColor: '#2cc5d2',
        cursorColor: 'black',
        plugins: [cursor],
      };

      // updating the timestamps
      // https://codepen.io/BusyBee/pen/pbXzgg

      let wavesurfer = WaveSurfer.create(options);
      // Show current time
      function formatTime(time) {
        return [
          Math.floor((time % 3600) / 60), // minutes
          ('00' + Math.floor(time % 60)).slice(-2), // seconds
        ].join(':');
      }

      wavesurfer.on('audioprocess', function() {
        $('.waveform__counter').text(formatTime(wavesurfer.getCurrentTime()));
      });

      // Show clip duration
      wavesurfer.on('ready', function() {
        $('.waveform__duration').text(formatTime(wavesurfer.getDuration()));
      });

      this.setState({wavesurfer}, this.loadAudio);
    } catch (e) {
      console.error(e);
    }
  }

  componentWillUnmount() {}

  loadAudio = () => {
    const {wavesurfer} = this.state;
    const {src} = this.props;
    wavesurfer.load(src);
  };

  playAudio = () => {
    const {playing, wavesurfer} = this.state;
    this.setState({playing: !playing});
    if (wavesurfer && wavesurfer.playPause) {
      wavesurfer.playPause();
    }
  };

  render() {
    const {playing} = this.state;
    const playclass = playing ? 'empty' : 'primary';
    return (
      <div className="waveform">
        <div className="wave" />
        <div className="controls">
          <button className={`btn btn-${playclass}`} onClick={this.playAudio}>
            {playing ? 'pause' : 'play'}
          </button>
        </div>
      </div>
    );
  }
}

Waveform.defaultProps = {
  src: '',
};
