/*global QUnit*/
import FakeServer, { stubRequest } from 'ember-cli-fake-server';
import jQuery from 'jquery';

let module = QUnit.module, test = QUnit.test;

module('ember-cli-fake-server: FakeServer', {
  teardown() {
    if (FakeServer.isRunning()) {
      FakeServer.stop();
    }
  }
});

test('#start throws if called while already started', (assert) => {
  FakeServer.start();

  assert.throws(FakeServer.start,
                /Cannot start FakeServer while already started/,
               'throws if FakeServer called while started');
});

module('ember-cli-fake-server: stubRequest', {
  setup() {
    FakeServer.start();
  },

  teardown() {
    FakeServer.stop();
  }
});

test('stubs ajax calls', (assert) => {
  let done = assert.async();
  assert.expect(1);

  stubRequest('get', '/blah', (request) => {
    assert.ok(true, 'Handled request');
  });

  jQuery.ajax('/blah', {complete:done});
});

test('stubs ajax calls with upper-case verbs', (assert) => {
  let done = assert.async();
  assert.expect(1);

  stubRequest('GET', '/blah', (request) => {
    assert.ok(true, 'Handled request');
  });

  jQuery.ajax('/blah', {complete:done});
});

test('responds to ajax', (assert) => {
  let done = assert.async();
  assert.expect(2);

  let payload = {foo: 'bar'};

  stubRequest('get', '/blah', (request) => {
    request.ok(payload);
  });

  jQuery.ajax('/blah', {
    success(json, textStatus, jqXHR) {
      assert.equal(textStatus, 'success', 'textStatus === success');
      assert.deepEqual(json, payload, 'has expected payload');
    },
    complete: done
  });
});

test('#json reads JSON in request payload', (assert) => {
  let done = assert.async();
  assert.expect(1);

  let payload = {foo: 'bar'};

  stubRequest('post', '/blah', (request) => {
    assert.deepEqual(request.json(), payload, 'posts payload');
    request.noContent();
  });

  jQuery.ajax('/blah', {
    type: 'POST',
    data: JSON.stringify(payload),
    dataType: 'json',
    contentType: 'application/json; charset=utf-8',
    complete: done
  });
});
