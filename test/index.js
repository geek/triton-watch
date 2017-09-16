'use strict';

const Lab = require('lab');
const Triton = require('triton');
const TritonWatch = require('../');


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = lab.expect;


const createClient = Triton.createClient;


describe('constructor', () => {
  it('gracefully handles slow connections', (done) => {
    let isDone = false;
    const listMachines = (opts, cb) => {
      cb(null, []);
      if (!isDone) {
        done();
      }
      isDone = true;
    };

    Triton.createClient = function (opts, cb) {
      setTimeout(() => { cb(null, { cloudapi: { listMachines } }); }, 333);
    };

    const tritonWatch = new TritonWatch({ frequency: 16 });
    Triton.createClient = createClient;
    tritonWatch.poll();
  });

  it('adds onChange handler if passed through options', (done) => {
    const onChange = function () {};
    Triton.createClient = function (opts) {};

    const tritonWatch = new TritonWatch({ onChange });
    expect(tritonWatch.listenerCount('change')).to.equal(1);
    Triton.createClient = createClient;
    done();
  });
});

describe('onChange', () => {
  it('executes when there is a new container', (done) => {
    Triton.createClient = function (opts, cb) {
      let executeCount = 0;
      cb(null, {
        cloudapi: {
          listMachines: function (opts, cb) {
            const result = ++executeCount === 1 ? [{
              id: 'boom',
              state: 'running'
            }] : [{
              id: 'boom',
              state: 'running'
            }, {
              id: 'dynamite',
              state: 'running'
            }];

            cb(null, result);
          }
        }
      });
    };

    const tritonWatch = new TritonWatch({ frequency: 10 });
    tritonWatch.on('change', (container) => {
      expect(container.id).to.equal('dynamite');
      Triton.createClient = createClient;
      done();
    });

    tritonWatch.poll();
  });

  it('executes when a containers state changes', (done) => {
    Triton.createClient = function (opts, cb) {
      let executeCount = 0;
      cb(null, {
        cloudapi: {
          listMachines: function (opts, cb) {
            const result = ++executeCount === 1 ? [{
              id: 'boom',
              state: 'running'
            }] : [{
              id: 'boom',
              state: 'stopped'
            }];

            cb(null, result);
          }
        }
      });
    };

    const tritonWatch = new TritonWatch({ frequency: 10 });
    tritonWatch.on('change', (container) => {
      expect(container.id).to.equal('boom');
      expect(container.state).to.equal('stopped');
      Triton.createClient = createClient;
      done();
    });

    tritonWatch.poll();
  });

  it('executes when a container is deleted', (done) => {
    Triton.createClient = function (opts, cb) {
      let executeCount = 0;
      cb(null, {
        cloudapi: {
          listMachines: function (opts, cb) {
            const result = ++executeCount === 1 ? [{
              id: 'boom',
              state: 'running'
            }] : [];

            cb(null, result);
          }
        }
      });
    };

    const tritonWatch = new TritonWatch({
      frequency: 10,
      onChange: (container) => {
        expect(container.id).to.equal('boom');
        expect(container.state).to.equal('deleted');
        Triton.createClient = createClient;
        done();
      }
    });

    tritonWatch.poll();
  });
});


describe('onAll', () => {
  it('executes on first poll', (done) => {
    Triton.createClient = function (opts, cb) {
      cb(null, {
        cloudapi: {
          listMachines: function (opts, cb) {
            const result = [{
              id: 'boom',
              state: 'running'
            }, {
              id: 'dynamite',
              state: 'running'
            }];

            cb(null, result);
          }
        }
      });
    };

    const tritonWatch = new TritonWatch({ frequency: 10 });
    tritonWatch.on('all', (containers) => {
      expect(containers.length).to.equal(2);
      Triton.createClient = createClient;
      done();
    });

    tritonWatch.poll();
  });
});
