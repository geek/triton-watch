'use strict';

const Code = require('code');
const Lab = require('lab');
const Triton = require('triton');
const TritonWatch = require('../');


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
