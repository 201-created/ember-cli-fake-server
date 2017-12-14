import { module, test } from 'ember-qunit';
import FakeServer, { stubRequest } from 'ember-cli-fake-server';
import jQuery from 'jquery';

module('ember-cli-fake-server: FakeServer', {
  afterEach() {
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
  beforeEach() {
    FakeServer.start();
  },

  afterEach() {
    FakeServer.stop();
  }
});

test('stubs ajax calls', (assert) => {
  let done = assert.async();
  assert.expect(1);

  stubRequest('get', '/blah', () => {
    assert.ok(true, 'Handled request');
  });

  jQuery.ajax('/blah', {complete:done});
});

test('stubs ajax calls with upper-case verbs', (assert) => {
  let done = assert.async();
  assert.expect(1);

  stubRequest('GET', '/blah', () => {
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
    success(json, textStatus /*, jqXHR */) {
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

test('FakeServer.config.afterResponse can modify responses', (assert) => {
  let done = assert.async();
  assert.expect(6);

  let originalResponse = [
    200,
    {"content-type": "application/json"},
    {original: true}
  ];

  let modifiedResponse = [
    201,
    {"content-type": "application/json", "x-fake-header": "foo"},
    {original: false, modified: true}
  ];

  FakeServer.configure.afterResponse((response, request) => {
    assert.ok(!!request, 'passes request');
    assert.deepEqual(response, originalResponse, 'passes original response');
    return modifiedResponse;
  });

  stubRequest('get', '/blah', function () {
    return originalResponse;
  });

  jQuery.ajax('/blah', {
    complete(jqXHR, textStatus) {
      assert.equal(textStatus, 'success');
      assert.equal(jqXHR.status, modifiedResponse[0]);
      assert.deepEqual(
        jqXHR.responseJSON,
        modifiedResponse[2],
        'uses JSON response from afterResponse handler');
      assert.ok(
        jqXHR.getAllResponseHeaders().indexOf('x-fake-header') !== -1,
        'includes headers from afterResponse handler');
      done();
    }
  });
});
