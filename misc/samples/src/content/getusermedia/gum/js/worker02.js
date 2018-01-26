//self.addEventListener('message', function(e) {
//  self.postMessage(e.data);
//  console.log('WOOOO');
//}, false);

//onmessage = function() {
//  postMessage('RANDOM STRING');
//}


self.addEventListener('message', function (e) {
  self.postMessage('HELLO FROM WORKER'); /*draw(e.data));*/
}, false);