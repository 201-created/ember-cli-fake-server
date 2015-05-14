[![Build Status](https://travis-ci.org/201-created/ember-cli-fake-server.svg?branch=master)](https://travis-ci.org/201-created/ember-cli-fake-server)

# ember-cli-fake-server

This README outlines the details of collaborating on this Ember addon.

## Installation

* `ember install ember-cli-fake-server`
* Add `FakeServer.start()` and `FakeServer.stop()` to test setup/teardown methods, i.e. using `QUnit.testStart` and `QUnit.testDone`

## Usage

In a test, import `stubRequest` from 'ember-cli-fake-server':

```
import FakeServer from 'ember-cli-fake-server';
import { stubRequest } from 'ember-cli-fake-server';

module('using ember-cli-fake-server', {
  setup() { FakeServer.start(); },
  teardown() { FakeServer.stop(); }
});

test('some ajax', (assert) => {
  const done = assert.async();
  assert.expect(1);
  
  let didCallAjax = false;
  stubRequest('get', '/some-url', (request) => {
    didCallAjax = true;
    request.ok({}); // send empty response back
  });
  
  Ember.$.ajax('/some-url', {
    complete() {
      assert.ok(didCallAjax, 'called ajax');
      done();
    }
  });
});
```
