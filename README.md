[![Build Status](https://travis-ci.org/201-created/ember-cli-fake-server.svg?branch=master)](https://travis-ci.org/201-created/ember-cli-fake-server)
[![Ember Observer Score](http://emberobserver.com/badges/ember-cli-fake-server.svg)](http://emberobserver.com/addons/ember-cli-fake-server)
![Dependencies](https://david-dm.org/201-created/ember-cli-fake-server.svg)
[![Code Climate](https://codeclimate.com/github/201-created/ember-cli-fake-server/badges/gpa.svg)](https://codeclimate.com/github/201-created/ember-cli-fake-server)

# ember-cli-fake-server

ember-cli-fake-server is an ember-cli addon that makes it extremely simple to stub ajax requests in your ember app. It uses [Pretender](https://github.com/pretenderjs/pretender) internally. If you need a more comprehensive stubbing solution, consider [ember-cli-mirage](http://www.ember-cli-mirage.com/).

## Installation

* `ember install ember-cli-fake-server`
* Call `FakeServer.start()` to start stubbing, and `FakeServer.stop()` to stop stubbing or use `setupFakeServer(hooks)` when using "new test api".
* In tests, use `stubRequest(verb, path, callback)` to stub ajax requests

## Usage

This addon exposes a default `FakeServer` export and a named `stubRequest` export from `'ember-cli-fake-server'`. In your ember code, you must call `FakeServer.start()` to start it intercepting ajax requests, and `FakeServer.stop()` to turn it back off. This should be done in your test suite's setup and teardown methods.

In your test, use `stubRequest` for each ajax request you would like to stub.

Here's an example ember test:

```javascript
import { module, test } from 'qunit';
import jQuery from 'jquery';
import { stubRequest, setupFakeServer } from 'ember-cli-fake-server';

module('using ember-cli-fake-server', function(hooks) {
  setupFakeServer(hooks);

  test('some ajax', function(assert) {
    const done = assert.async();
    assert.expect(1);
  
    let didCallAjax = false;
    stubRequest('get', '/some-url', (request) => {
      didCallAjax = true;
      request.ok({}); // send empty response back
    });
  
    jQuery.ajax('/some-url', {
      complete() {
        assert.ok(didCallAjax, 'called ajax');
        done();
      }
    });
  });
});
```

## The `stubRequest` method

The `stubRequest` method takes 3 parameters: `(verb, path, callback)`.

  * `verb` should be one of the verbs that Pretender understands: 'get', 'put', 'post', 'delete', 'path' and 'head'
  * `path` is the url (without the scheme, protocol or domain) that you are stubbing out, e.g. `'/api/users/1'`
  * For more details on the `callback` parameter, see "Responding To Requests" below

### Responding to Requests

The callback that you pass to `stubRequest` will be called with a `request` parameter that you can use to respond to the request and also read information about the request.

The `request` parameter has the following methods, corresponding to HTTP status codes:
  * `ok` — status code 200
  * `error` — 422
  * `notFound` — 404
  * `created` — 201
  * `accepted` - 202
  * `noContent` — 204
  * `unauthorized` — 401

Call the appropriate method on `request` with your JSON payload to make `stubRequest` respond with that status code and payload.

Examples:
```javascript
stubRequest('post', '/users', (request) => {
  // sends a "201 Created" response with the JSON for a user:
  request.create({user: {id:1 , name: 'newly created user'}});
});

stubRequest('get', '/users/1', (request) => {
   // send a "200 Ok" response with the JSON for a user:
  request.ok({user: {id: 1, name: 'the user'}});
});

stubRequest('get', '/users/99', (request) => {
  // send an empty "404 Not Found" response
  request.notFound();
});

stubRequest('put', '/users/1', (request) => {
  // send a "422 Unprocessable Entity" response back with the given JSON payload
  request.error({error: {email: 'is invalid'}});
});
```

### Reading JSON and other data from Requests

The `request` parameter passed to your callback also has a `json` method that returns the incoming JSON payload.

Example:

```javascript
stubRequest('post', '/users/1', (request) => {
  alert(request.json().user.name); // alerts "Cory"
});

jQuery.ajax('/users/1', {
  type: 'POST',
  data: JSON.stringify({user: {id: 1, name: "Cory"}}),
  dataType: 'json',
  contentType: 'application/json; charset=utf-8'
});
```

### Reading other request data

The `request` parameter passed to your callback function is the same one (albeit with some additional methods added on) that Pretender uses, so you can use the same properties it exposes for reading data such as `request.params` and [`request.queryParams`](https://github.com/pretenderjs/pretender#query-parameters).

### Unexpected requests

ember-cli-fake-server is configured to intercept *all* ajax requests after you call `FakeServer.start()`. Any ajax request that was not stubbed before it was made will [throw an error](https://github.com/201-created/ember-cli-fake-server/blob/master/addon/lib/logging.js#L4) explaining the method and path of the unhandled request.

### Request logging

By default ember-cli-fake-server will log all requests that it handles. To enable/disable logging of successfully handled requests, provide an options object to `FakeServer.start()` that defines a `logging` attribute, for example:

```javascript
FakeServer.start({ logging: false });
```

or

```javascript
setupFakeServer(hooks, { logging: false });
```

Unhandled requests are always logged.

### Modifying responses

Use `FakeServer.configure.afterResponse(fn)` to specify an afterResponse
callback. This can be used to globally modify all requests in some specified
way. The function you pass to `afterResponse` will be called with two arguments:
`response` and `request`. It must return an array of `[statusCode, headers, json|string]`.

Example:

```javascript
FakeServer.configure.afterResponse(function(response /*, request */) {
  // response === [200, {"content-type": "application/json"}, {foo: 'bar'}]
  let [status, headers, json] = response;
  if (json.foo) { // optionally modify json
    json.foo = 'baz'
  }
  return [status, headers, json];
});

stubRequest('get', '/users/1', function(request) {
  let response = this.ok({foo: 'bar'});

  // `response` is passed as 1st argument to afterResponse hook,
  // `request` is passed as 2nd argument.
  return response;
});
```
