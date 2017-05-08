'use strict';

const Events = require('events');
const Triton = require('triton');


module.exports = class TWatch extends Events.EventEmitter {
  constructor (options) {
    options = options || {};

    super();

    this._client = Triton.createClient(options.triton);

    if (typeof options.onChange === 'function') {
      this.on('change', options.onChange);
    }

    this._poll();
  }

  _checkContainers (next) {
    this._client.listMachines({ docker: true, tombstone: true, limit: 9999 }, (err, containers) => {
      if (err) {
        this._log('error', err);
        return next();
      }

      // set initial containers state for baseline comparison
      if (!this._containers) {
        this._containers = containers;
        return next();
      }

      this._compareContainers(this._containers, containers);
      this._containers = containers;
      return next();
    });
  }

  _compareContainers (previousContainers, currentContainers) {
    // Check for new containers and changes in state
    currentContainers.forEach((currentContainer) => {
      const previousContainerIndex = previousContainers.findIndex((previousContainer) => {
        return previousContainer.id === currentContainer.id;
      });

      if (!previousContainerIndex === -1) {
        this.emit('change', currentContainer);
        return;
      }

      const previousContainer = previousContainers[previousContainerIndex];
      if (previousContainer.state !== currentContainer.state) {
        this.emit('change', currentContainer);
      }
    });

    // Check for deleted containers
    previousContainers.forEach((previousContainer) => {
      const currentContainerIndex = currentContainers.findIndex((currentContainer) => {
        return previousContainer.id === currentContainer.id;
      });

      if (!currentContainerIndex === -1) {
        previousContainer.state = 'deleted';
        this.emit('change', previousContainer);
        return;
      }
    });
  }

  _log (level, message) {
    message = message || level;

    if (level === 'error') {
      console.error(message);
      return;
    }

    console.log(message);
  }

  _poll () {
    if (this._isPolling) {
      return;
    }

    this.isPolling = setTimeout(() => {
      this._isPolling = 0;
      this._checkContainers(this._poll);
    }, 1000);
  }
};