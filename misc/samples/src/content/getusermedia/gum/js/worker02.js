self.addEventListener('message', function(e) {
  self.postMessage(e.data);
  console.log('WOOOO');
}, false);