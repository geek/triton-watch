'use strict';

const TritonWatch = require('./');

const tritonWatch = new TritonWatch({
  triton: {
    profileName: 'us-sw-1',     // change to the profile you want to use
    configDir: '~/.triton/'
  }
});

tritonWatch.on('change', (container) => {
  console.log(JSON.stringify(container, null, '  '));
});

tritonWatch.poll();
