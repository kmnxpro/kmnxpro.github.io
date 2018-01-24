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
var ST;
var VT;

// Put variables in global scope to make them available to the browser console.
var constraints = window.constraints = {
  audio: false,
  video: true
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
    tempLabelString.concat(videoTracks[i].label);
  }
  streamInfoDIV.innerText = (tempLabelString + " abc") || "didn't work";
  ST = stream;
  VT = videoTracks;
  // END Added 20180124

  stream.oninactive = function() {
    console.log('Stream inactive');
  };
  window.stream = stream; // make variable available to browser console
  video.srcObject = stream;
}

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