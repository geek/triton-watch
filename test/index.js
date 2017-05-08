'use strict';

const Code = require('code');
const Lab = require('lab');
const Triton = require('triton');
const TritonWatch = require('../');


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


const createClient = Triton.createClient;


describe('constructor', () => {
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

    const tritonWatch = new TritonWatch({ frequency: 10, onChange: (container) => {
      expect(container.id).to.equal('boom');
      expect(container.state).to.equal('deleted');
      Triton.createClient = createClient;
      done();
    }});

    tritonWatch.poll();
  });
});
