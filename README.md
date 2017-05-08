# triton-watch
Triton Container Watcher


## Usage

```javascript
const TritonWatch = require('triton-watch');

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
```

## API

### `constructor(options)``

`options` is a required object with the following properties

- `triton` - object to pass to `Triton.createClient` function. Requires `profileName` and `configDir` or key information to connect to CloudAPI.
- `frequency` - number of milliseconds between polling CloutAPI for changes. Default is 1000.
- `onChange` - function to execute when there is a container change


### `poll()`

Initiate the polling process to watch for changes.

### `on('change', handler)` or `once('change', handler)`

Event subscription for container changes. `handler` is executed with the `container` object passed as an argument. The `container` object will have the following properties

```json
{
  "id": "4f083730-8a58-44de-f4b1-b84f375c53a1",
  "name": "",
  "type": "smartmachine",
  "brand": "lx",
  "state": "deleted",
  "image": "",
  "ips": [
    "192.168.129.182"
  ],
  "memory": 1024,
  "disk": 25600,
  "metadata": {},
  "tags": {
    "sdc_docker": true
  },
  "created": "2017-05-08T20:52:51.073Z",
  "updated": "2017-05-08T20:53:49.000Z",
  "docker": true,
  "networks": [
    "",
    ""
  ],
  "primaryIp": "",
  "firewall_enabled": true,
  "compute_node": "",
  "package": ""
}
```
