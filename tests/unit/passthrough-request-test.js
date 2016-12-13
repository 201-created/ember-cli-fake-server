/*global QUnit*/
import FakeServer from 'ember-cli-fake-server';
import { passthroughRequest } from 'ember-cli-fake-server';

const { module, test } = QUnit;

let passthrough, pretender;

module('ember-cli-fake-server:stubRequest responses', {
  beforeEach() {
    FakeServer.start();
    pretender = FakeServer._currentServer;
    passthrough = pretender.passthrough;
  },

  afterEach() {
    if (FakeServer.isRunning()) {
      FakeServer.stop();
    }
  }
});

test('passthroughRequest paths are passed to Pretender passthrough', (assert) => {
  let passedPath, passedHandler;

  pretender.get = function(path, handler) {
    passedPath = path;
    passedHandler = handler;
  };

  passthroughRequest('get', '/abc/def');

  assert.equal(passedPath, '/abc/def', 'passes path to pretender');
  assert.equal(passedHandler, passthrough, 'handler is passthrough handler');
});

test('calling passthroughRequest when server is not started throws', (assert) => {
  FakeServer.stop();

  assert.throws(() => {
    passthroughRequest('get', '/abc/def');
  }, /cannot passthrough request if FakeServer is not running/);
});
