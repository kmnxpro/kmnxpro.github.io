/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

var errorElement = document.querySelector('#errorMsg');
var video = document.querySelector('video');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var videoContainer = document.getElementById('video-container');
var filmstrip = document.getElementById('filmstrip');
var resizeInfoDIV = document.getElementById('resize-info');
var cameraFacingMode = "Back";
//var buttonsDIV = document.getElementById('buttons');
var ST;
var VT;

//var video = document.createElement('video');
//video.id = 'gum-local';
//video.autoplay = true;
//video.playsinline = true;

//var wkr = new Worker('worker.js');
//var wkr02 = new Worker('./worker02.js');

//wkr02.addEventListener('message', function(e) {
//  console.log('Worker said: ', e.data);
//  buttonsDIV.innerText = "WORKER IS WORKING";
//}, false);

//wkr02.postMessage('Hello World'); // Send data to our worker.



// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: cameraFacingMode === "Back" ? 
         { facingMode: "environment" } : 
         { facingMode: "user" }  //true   // { facingMode: "user" }
};

function handleSuccess(stream) {
  var videoTracks = stream.getVideoTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using video device: ' + videoTracks[0].label);

  // BEGIN Added 20180124
  var streamInfoDIV = document.getElementById('stream-info');
  //streamInfoDIV.innerText = videoTracks.length; //JSON.stringify(videoTracks);
  var tempLabelString = ''; //videoTracks.reduce((curr, next) => curr.label + ' ' + next.label);
  //videoTracks.forEach(x => console.log(x.label));        // tempLabelString.concat(String(x.label)));
  for (var i = 0; i < videoTracks.length; i += 1) {
    tempLabelString = tempLabelString.concat(videoTracks[i].label);
  }
  streamInfoDIV.innerText = (tempLabelString + " abc") || "didn't work";

  var enumDevicesDIV = document.getElementById('enumerate-devices');
  navigator.mediaDevices.enumerateDevices().then(function(x) {
    console.log(x, Array.isArray(x));
    console.log(JSON.stringify(x));
    enumDevicesDIV.innerText = JSON.stringify(x);
  });

  ST = stream;
  VT = videoTracks;

  // END Added 20180124

  stream.oninactive = function() {
    console.log('Stream inactive');
  };
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;

  // BEGIN Added 20180124
  videoContainer.style.position = 'relative';
  //video.style['display'] = 'none';
  video.style.position = 'absolute';
  video.style.top = '0px';
  video.style.left = '0px';
  video.style.width = '50%';
  video.style['z-index'] = 3;
  // END Added 20180124

}


// BEGIN Added 20180124

// VIDEO

//function handleSuccess02(stream) {
//  var videoTracks = stream.getVideoTracks();
//  console.log('Got stream with constraints:', constraints);
//  console.log('Using video device: ' + videoTracks[0].label);
//  video02.srcObject = stream;
//}

// CANVAS

function paintToCanvas() {
  var width = video.videoWidth;
  var height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  canvas.style.position = 'absolute';
  canvas.style.top = '0px';
  canvas.style.left = '0px';
  canvas.style.width = '50%';
  canvas.style['z-index'] = 5;

  function step() {
    window.requestAnimationFrame(step);
    ctx.drawImage(video, 0, 0, width, height);
    //ctx.fillStyle = 'rgb(200,0,0)'; // sets the color to fill in the rectangle with
    //ctx.fillRect(10, 10, 55, 50);
    
    var pixels = ctx.getImageData(0, 0, width, height);
    pixels = processedPixels(pixels, width);
    ctx.putImageData(pixels, 0, 0);
    
    //wkr.postMessage({
    //  imageData: pixels
    //});

    /* Setup WebWorker return messaging */
    //wkr.onmessage = function(event) {
    //  ctx.putImageData(event.data.dstData, 0, 0);
    //}
  }

  window.requestAnimationFrame(step);

  console.log("video.videoWidth", video.videoWidth);
  console.log("video.videoHeight", video.videoHeight);
  console.log("video.width", video.width);
  console.log("video.height", video.height);

}

function processedPixels(pixels, width) {
  var pixels = pixels;
  var width = width;
  var dta = pixels.data

  // Convert to grayscale
  for (var i = 0; i < dta.length; i += 4) {
    var r = dta[i + 0];
    var g = dta[i + 1];
    var b = dta[i + 2];
    var gray     = 0.299 * r + 0.587 * g + 0.114 * b;
    var gray_lum = 0.210 * r + 0.720 * g + 0.070 * b;  // 0.71 * g (?)

    dta[i + 0] = gray  //pixels.data[i + 0] + 100;  // red
    dta[i + 1] = gray  //pixels.data[i + 1] - 70;  // green
    dta[i + 2] = gray  //pixels.data[i + 2] - 80;  // blue

    //var thresh = gray > 127 ? 255 : 0

    //dta[i + 0] = thresh
    //dta[i + 1] = thresh
    //dta[i + 2] = thresh

    var atkNewColor = gray > 127 ? 255 : 0
    var atkErr = parseInt(gray - atkNewColor) / 8, 10);
		
    dta[i] = atkNewColor;
    dta[i + 4] += atkErr;
    dta[i + 8] += atkErr;
    dta[i + (4 * width) - 4] += atkErr;
    dta[i + (4 * width)] += atkErr;
    dta[i + (4 * width) + 4] += atkErr;
    dta[i + (8 * width)] += atkErr;

  }

  return pixels;
}

// END Added 20180124



function handleError(error) {
  if (error.name === 'ConstraintNotSatisfiedError') {
    errorMsg('The resolution ' + constraints.video.width.exact + 'x' +
        constraints.video.width.exact + ' px is not supported by your device.');
  } else if (error.name === 'PermissionDeniedError') {
    errorMsg('Permissions have not been granted to use your camera and ' +
      'microphone, you need to allow the page access to your devices in ' +
      'order for the demo to work.');
  }
  errorMsg('getUserMedia error: ' + error.name, error);
}

function errorMsg(msg, error) {
  errorElement.innerHTML += '<p>' + msg + '</p>';
  if (typeof error !== 'undefined') {
    console.error(error);
  }
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);


// BEGIN Added 20180124

function toggleCameraFacingMode() {
  cameraFacingMode === "Back" ? cameraFacingMode = "Front" : cameraFacingMode = "Back";
  console.log('NEW cameraFacingMode value: ', cameraFacingMode)

  constraints = window.constraints = {
    audio: false,
    video: cameraFacingMode === "Back" ? 
           { facingMode: "environment" } : 
           { facingMode: "user" }  //true   // { facingMode: "user" }
  };

  navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

  video.addEventListener('canplay', paintToCanvas, { once: true });  //false);

}

video.addEventListener('canplay', paintToCanvas, { once: true });  //false);
video.addEventListener('resize', function() {
  paintToCanvas();  // DESTROY PREVIOUS REQ ANIM FRAME (?)
  console.log('VIDEO RESIZE', video.videoWidth);
  resizeInfoDIV.innerText = "Width: " + video.videoWidth + " ; Height:" + video.videoHeight;
}, false);

//wkr.addEventListener('message', function(event) {
//  ctx.putImageData(event.data.dstData, 0, 0);
//  console.log(event.data.dstData);
//  console.log(event.data.sss);
//}, false);

// END Added 20180124






// HELPFUL LINKS
// 1. https://developers.google.com/web/updates/2016/10/addeventlistener-once
// 2. https://developer.mozilla.org/en-US/docs/Web/CSS/z-index
// 3. https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onresize
// 4. https://github.com/webrtc/samples/tree/gh-pages/src/content/getusermedia/gum
// 5. https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
// 6. https://github.com/kmnxpro/kmnxpro.github.io/tree/master/misc/samples/src/content/getusermedia/gum
// 7. https://kmnxpro.github.io/misc/samples/src/content/getusermedia/gum/
// 8. "image processing javascript web worker"
//    http://blog.aviary.com/archive/live-image-processing-with-getusermedia-and-web-workers
//    https://github.com/conorbuck/canvas-video-effects
// 9. https://codepen.io/SeanMcBeth/pen/gaqJJg (" #Codevember 17: Automatic Workerization ")
// 10. http://html5-demos.appspot.com/static/workers/transferables/index.html (web workers demo)
// 11. https://www.html5rocks.com/en/tutorials/workers/basics/
// 12. https://www.youtube.com/watch?v=ElWFcBlVk-o ("Unreal Webcam Fun with getUserMedia() and HTML5 Canvas - #JavaScript30 19/30")
// 13. https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
// 14. https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
// 15. 












