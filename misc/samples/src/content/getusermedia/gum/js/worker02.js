//var SELF = self

self.addEventListener('message', function(event) {


  self.postMessage(String(event.data) + 'RANDOM STRING') //{
  //  sss: 'RANDOM STRING'
  //});
}, false);