# triton-watch
Triton Container Watcher


## Usage

```javascript
const TritonWatch = require('triton-watch');

const tritonWatch = new TritonWatch({
  triton: {
    // any triton specific configuration options you want to include
  }
});

tritonWatch.on('change', (container) => {
  // check container.state to see what changed
});
```
