window.AudioContext = window.AudioContext || window.webkitAudioContext;

audioRecorder = null; // global
audioContext = null; // global

let audioInput = null,
  realAudioInput = null,
  inputPoint = null;
let rafID = null;
let analyserContext = null;
let canvasWidth, canvasHeight;
let recIndex = 0;

function gotBuffers(buffers) {
  let canvas = document.getElementById('wavedisplay');
  drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);
}

function setRecording(recState) {
  // really instead of a toggle it works as a state matcher in line with react.
  if (!audioRecorder) return;

  if (recState) {
    audioRecorder.record();
  } else {
    audioRecorder.stop();
    // audioRecorder.getBuffers(gotBuffers);
  }
}

function convertToMono(input) {
  let splitter = audioContext.createChannelSplitter(2);
  let merger = audioContext.createChannelMerger(2);

  input.connect(splitter);
  splitter.connect(merger, 0, 0);
  splitter.connect(merger, 0, 1);
  return merger;
}

function cancelAnalyserUpdates() {
  window.cancelAnimationFrame(rafID);
  rafID = null;
}

function updateAnalysers(time) {
  if (!analyserContext) {
    let canvas = document.getElementById('analyser');
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
    analyserContext = canvas.getContext('2d');
  }

  // analyzer draw code here
  {
    let SPACING = 3;
    let BAR_WIDTH = 1;
    let numBars = Math.round(canvasWidth / SPACING);
    let freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

    analyserNode.getByteFrequencyData(freqByteData);

    analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
    analyserContext.fillStyle = '#F6D565';
    analyserContext.lineCap = 'round';
    let multiplier = analyserNode.frequencyBinCount / numBars;

    // Draw rectangle for each frequency bin.
    for (let i = 0; i < numBars; ++i) {
      let magnitude = 0;
      let offset = Math.floor(i * multiplier);
      // gotta sum/average the block, or we miss narrow-bandwidth spikes
      for (let j = 0; j < multiplier; j++)
        magnitude += freqByteData[offset + j];
      magnitude = magnitude / multiplier;
      let magnitude2 = freqByteData[i * multiplier];
      analyserContext.fillStyle =
        'hsl( ' + Math.round((i * 360) / numBars) + ', 100%, 50%)';
      analyserContext.fillRect(
        i * SPACING,
        canvasHeight,
        BAR_WIDTH,
        -magnitude,
      );
    }
  }

  rafID = window.requestAnimationFrame(updateAnalysers);
}

function toggleMono() {
  if (audioInput != realAudioInput) {
    audioInput.disconnect();
    realAudioInput.disconnect();
    audioInput = realAudioInput;
  } else {
    realAudioInput.disconnect();
    audioInput = convertToMono(realAudioInput);
  }

  audioInput.connect(inputPoint);
}

function gotStream(stream) {
  inputPoint = audioContext.createGain();

  // Create an AudioNode from the stream.
  realAudioInput = audioContext.createMediaStreamSource(stream);
  audioInput = realAudioInput;
  audioInput = convertToMono(realAudioInput);
  audioInput.connect(inputPoint);

  analyserNode = audioContext.createAnalyser();
  analyserNode.fftSize = 2048;
  inputPoint.connect(analyserNode);
  audioRecorder = new Recorder(inputPoint);

  // setting the volume and gain controls here
  myGain = audioContext.createGain();
  myGain.gain.value = 6.0;
  inputPoint.connect(myGain);
  //myGain.connect(audioContext.destination);
  updateAnalysers();
}
