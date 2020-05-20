import _Recorder from '../lib/recorderjs/src/r.js';

/**
 * @file 录音
 * @author hualuyao
 * @params {object} options
 * @property {number} options.maxlength //最长录音时间 单位：秒
 * @property {?function} options.callback //录音结束时的回调函数
 * @property {?function} options.onTimeChange  //倒计时变化回调函数
 * @property {?string} options.canvasId //画波形图的画布id
 */

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
window.URL = window.URL || window.webkitURL;

let audioContext, input, inputPoint, analyserNode, analyserContext, zeroGain, biquadFilter;

let canvasId, canvasWidth, canvasHeight, rafID;

function updateAnalysers(time) {
    if (!analyserContext) {
        var canvas = document.getElementById("analyser");
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
        analyserContext = canvas.getContext('2d');
    }

    // analyzer draw code here
    {
        var SPACING = 3;
        var BAR_WIDTH = 1;
        var numBars = Math.round(canvasWidth / SPACING);
        var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

        analyserNode.getByteFrequencyData(freqByteData); 

        analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
        analyserContext.fillStyle = '#F6D565';
        analyserContext.lineCap = 'round';
        var multiplier = analyserNode.frequencyBinCount / numBars;

        // Draw rectangle for each frequency bin.
        for (var i = 0; i < numBars; ++i) {
            var magnitude = 0;
            var offset = Math.floor( i * multiplier );
            // gotta sum/average the block, or we miss narrow-bandwidth spikes
            for (var j = 0; j< multiplier; j++)
                magnitude += freqByteData[offset + j];
            magnitude = magnitude / multiplier;
            var magnitude2 = freqByteData[i * multiplier];
            analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
            analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
        }
    }
    
    rafID = window.requestAnimationFrame( updateAnalysers );
}

function cancelAnalyserUpdates() {
    window.cancelAnimationFrame( rafID );
    rafID = null;
    analyserContext = null;
}

// function initAudio({canvasId}) {
    navigator.getUserMedia && navigator.getUserMedia({
        audio: true
    }, (stream) => {
        audioContext = new AudioContext;
        input = audioContext.createMediaStreamSource(stream);
        inputPoint = audioContext.createGain();
        biquadFilter = audioContext.createBiquadFilter();

        // Create an AudioNode from the stream.
        input.connect(inputPoint);
        input.connect(biquadFilter);

        biquadFilter.type = 'lowshelf';
        biquadFilter.frequency.value = 1000;
        biquadFilter.gain.value = 25;

        analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 2048;
        inputPoint.connect( analyserNode );

        zeroGain = audioContext.createGain();
        zeroGain.gain.value = 0.0;
        inputPoint.connect( zeroGain );
        zeroGain.connect( audioContext.destination );
    }, msg => console.log(msg));
// }

class Recorder {
    constructor(options) {
        let {maxlength, callback, onTimeChange, uiCallback} = options;
        this.maxlength = maxlength;
        this.time = maxlength;
        this.callback = callback;
        this.uiCallback = uiCallback;
        this.onTimeChange = onTimeChange;
        this.recorder = new _Recorder(input, {numChannels: 1});
    }

    start() {
        this.recorder.record();
        this.interval = setInterval(() => {
            this.time--;

            if (typeof this.onTimeChange === 'function') {
                this.onTimeChange(this.time);
            }

            if (this.time < 0) {
                this.stop();
            }
        }, 1000);

        updateAnalysers();
    }

    stop() {
        if (typeof this.uiCallback === 'function') {
            this.uiCallback();
        }
        if (typeof this.callback === 'function') {
            this.recorder.exportWAV(blob => {
                this.callback(blob);
            });
        }
        this.recorder.stop();
        this.recorder.clear();

        this.time = this.maxlength;
        clearInterval(this.interval);
        cancelAnalyserUpdates();
    }
}

export {Recorder}
