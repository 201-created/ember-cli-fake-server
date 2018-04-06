import { module, test } from "qunit";
import { stubRequest, setupFakeServer } from "ember-cli-fake-server";
import {
  STATUS_CODES,
  RESPONSE_ALIASES
} from "ember-cli-fake-server/lib/responses";
import ajax from "../../helpers/ajax";

module("ember-cli-fake-server:stubRequest responses", function(hooks) {
  setupFakeServer(hooks);

  function testRequestMethod(methodName, code) {
    let message = `\`request#${methodName}\` returns status code ${code}`;

    test(message, function(assert) {
      assert.expect(1);

      stubRequest("get", "/", req => {
        req[methodName]();
      });

      return ajax("/", {
        success(json, textStatus, jqXHR) {
          assert.equal(jqXHR.status, code, message);
        },
        error(jqXHR /*, textStatus, errorThrown*/) {
          assert.equal(jqXHR.status, code, message);
        }
      });
    });
  }

  function testCallbackContext(methodName, code) {
    let message = `\`this#${methodName}\` returns status code ${code}`;

    test(message, function(assert) {
      assert.expect(1);

      stubRequest("get", "/", function() {
        return this[methodName]();
      });

      return ajax("/", {
        success(json, textStatus, jqXHR) {
          assert.equal(jqXHR.status, code, message);
        },
        error(jqXHR /*, textStatus, errorThrown*/) {
          assert.equal(jqXHR.status, code, message);
        }
      });
    });
  }

  Object.keys(STATUS_CODES).forEach(key => {
    let code = STATUS_CODES[key];
    testRequestMethod(key, code);
    testCallbackContext(key, code);
  });

  Object.keys(RESPONSE_ALIASES).forEach(aliasKey => {
    let aliases = RESPONSE_ALIASES[aliasKey];
    let code = STATUS_CODES[aliasKey];

    aliases.forEach(methodName => {
      testRequestMethod(methodName, code);
      testCallbackContext(methodName, code);
    });
  });
});
