var SELF = self

SELF.addEventListener('message', function(event) {


  SELF.postMessage({
    sss: 'RANDOM STRING'
  });
}, false);