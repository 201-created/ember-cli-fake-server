/*global QUnit*/
import FakeServer from 'ember-cli-fake-server';
import { stubRequest } from 'ember-cli-fake-server';
import { STATUS_CODES } from 'ember-cli-fake-server/lib/responses';
import jQuery from 'jquery';

let module = QUnit.module, test = QUnit.test;

module('ember-cli-fake-server:stubRequest responses', {
  setup() {
    FakeServer.start();
  },

  teardown() {
    FakeServer.stop();
  }
});

Object.keys(STATUS_CODES).forEach((key) => {
  let code = STATUS_CODES[key];
  const message = `\`request#${key}\` returns status code ${code}`;

  test(message, (assert) => {
    let code = STATUS_CODES[key];
    let done = assert.async();
    assert.expect(1);

    stubRequest('get', '/', (req) => {
      req[key]();
    });

    jQuery.ajax('/', {
      success(json, textStatus, jqXHR) {
        assert.equal(jqXHR.status, code, message);
      },
      error(jqXHR /*, textStatus, errorThrown*/) {
        assert.equal(jqXHR.status, code, message);
      },
      complete: done
    });
  });
});

Object.keys(STATUS_CODES).forEach((key) => {
  let code = STATUS_CODES[key];
  const message = `returning \`this#${key}\` in request handler returns status code ${code}`;

  test(message, (assert) => {
    let code = STATUS_CODES[key];
    let done = assert.async();
    assert.expect(1);

    stubRequest('get', '/', function() {
      return this[key]();
    });

    jQuery.ajax('/', {
      success(json, textStatus, jqXHR) {
        assert.equal(jqXHR.status, code, message);
      },
      error(jqXHR/*, textStatus, errorThrown*/) {
        assert.equal(jqXHR.status, code, message);
      },
      complete: done
    });
  });
});
