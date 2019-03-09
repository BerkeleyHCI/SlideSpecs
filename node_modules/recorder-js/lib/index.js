'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _microphone = require('./microphone');

var _microphone2 = _interopRequireDefault(_microphone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultConfig = {
  nFrequencyBars: 255,
  onAnalysed: null
};

var Recorder = function () {
  function Recorder(audioContext) {
    var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Recorder);

    this.config = Object.assign({}, defaultConfig, config);

    this.audioContext = audioContext;
    this.audioInput = null;
    this.realAudioInput = null;
    this.inputPoint = null;
    this.audioRecorder = null;
    this.rafID = null;
    this.analyserContext = null;
    this.recIndex = 0;
    this.stream = null;

    this.updateAnalysers = this.updateAnalysers.bind(this);
  }

  _createClass(Recorder, [{
    key: 'init',
    value: function init(stream) {
      var _this = this;

      return new Promise(function (resolve) {
        _this.inputPoint = _this.audioContext.createGain();

        _this.stream = stream;

        _this.realAudioInput = _this.audioContext.createMediaStreamSource(stream);
        _this.audioInput = _this.realAudioInput;
        _this.audioInput.connect(_this.inputPoint);

        _this.analyserNode = _this.audioContext.createAnalyser();
        _this.analyserNode.fftSize = 2048;
        _this.inputPoint.connect(_this.analyserNode);

        _this.audioRecorder = new _microphone2.default(_this.inputPoint);

        var zeroGain = _this.audioContext.createGain();
        zeroGain.gain.value = 0.0;

        _this.inputPoint.connect(zeroGain);
        zeroGain.connect(_this.audioContext.destination);

        _this.updateAnalysers();

        resolve();
      });
    }
  }, {
    key: 'start',
    value: function start() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (!_this2.audioRecorder) {
          reject('Not currently recording');
          return;
        }

        _this2.audioRecorder.clear();
        _this2.audioRecorder.record();

        resolve(_this2.stream);
      });
    }
  }, {
    key: 'stop',
    value: function stop() {
      var _this3 = this;

      return new Promise(function (resolve) {
        _this3.audioRecorder.stop();

        _this3.audioRecorder.getBuffer(function (buffer) {
          _this3.audioRecorder.exportWAV(function (blob) {
            return resolve({ buffer: buffer, blob: blob });
          });
        });
      });
    }
  }, {
    key: 'updateAnalysers',
    value: function updateAnalysers() {
      if (this.config.onAnalysed) {
        requestAnimationFrame(this.updateAnalysers);

        var freqByteData = new Uint8Array(this.analyserNode.frequencyBinCount);

        this.analyserNode.getByteFrequencyData(freqByteData);

        var data = new Array(255);
        var lastNonZero = 0;
        var datum = void 0;

        for (var idx = 0; idx < 255; idx += 1) {
          datum = Math.floor(freqByteData[idx]) - Math.floor(freqByteData[idx]) % 5;

          if (datum !== 0) {
            lastNonZero = idx;
          }

          data[idx] = datum;
        }

        this.config.onAnalysed({ data: data, lineTo: lastNonZero });
      }
    }
  }, {
    key: 'setOnAnalysed',
    value: function setOnAnalysed(handler) {
      this.config.onAnalysed = handler;
    }
  }]);

  return Recorder;
}();

Recorder.download = function download(blob) {
  var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'audio';

  _microphone2.default.forceDownload(blob, filename + '.wav');
};

exports.default = Recorder;