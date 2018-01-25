// message receiver
onmessage = function(event) {
  var imageData = event.data.imageData,
      dst = imageData.data;

  /* Image Processing goes here */
  for (var i=0; i < dst.length; i += 4) {
    dst[i + 0] = dst[i + 0] - 100;  // red
    dst[i + 1] = dst[i + 1] + 70;  // green
    dst[i + 2] = dst[i + 2] - 80;  // blue
  }

  postMessage({
    dstData: imageData
  });
};