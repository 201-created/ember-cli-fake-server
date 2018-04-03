import { module, test } from "qunit";
import FakeServer, { stubRequest } from "ember-cli-fake-server";
import ajax from "../helpers/ajax";

module("ember-cli-fake-server: FakeServer", function(hooks) {
  hooks.afterEach(function() {
    if (FakeServer.isRunning()) {
      FakeServer.stop();
    }
  });

  test("#start throws if called while already started", function(assert) {
    FakeServer.start();

    assert.throws(
      FakeServer.start,
      /Cannot start FakeServer while already started/,
      "throws if FakeServer called while started"
    );
  });
});

module("ember-cli-fake-server: stubRequest", function(hooks) {
  hooks.beforeEach(function() {
    FakeServer.start();
  });

  hooks.afterEach(function() {
    FakeServer.stop();
  });

  test("stubs ajax calls", function(assert) {
    assert.expect(1);

    stubRequest("get", "/blah", () => {
      assert.ok(true, "Handled request");
    });

    return ajax("/blah");
  });

  test("stubs ajax calls with upper-case verbs", function(assert) {
    assert.expect(1);

    stubRequest("GET", "/blah", () => {
      assert.ok(true, "Handled request");
    });

    return ajax("/blah");
  });

  test("responds to ajax", function(assert) {
    assert.expect(2);

    let payload = { foo: "bar" };

    stubRequest("get", "/blah", request => {
      request.ok(payload);
    });

    return ajax("/blah", {
      success(json, textStatus /*, jqXHR */) {
        assert.equal(textStatus, "success", "textStatus === success");
        assert.deepEqual(json, payload, "has expected payload");
      }
    });
  });

  test("#json reads JSON in request payload", function(assert) {
    assert.expect(1);

    let payload = { foo: "bar" };

    stubRequest("post", "/blah", request => {
      assert.deepEqual(request.json(), payload, "posts payload");
      request.noContent();
    });

    return ajax("/blah", {
      type: "POST",
      data: JSON.stringify(payload),
      dataType: "json",
      contentType: "application/json; charset=utf-8"
    });
  });

  test("FakeServer.config.afterResponse can modify responses", function(assert) {
    assert.expect(6);

    let originalResponse = [
      200,
      { "content-type": "application/json" },
      { original: true }
    ];

    let modifiedResponse = [
      201,
      { "content-type": "application/json", "x-fake-header": "foo" },
      { original: false, modified: true }
    ];

    FakeServer.configure.afterResponse((response, request) => {
      assert.ok(!!request, "passes request");
      assert.deepEqual(response, originalResponse, "passes original response");
      return modifiedResponse;
    });

    stubRequest("get", "/blah", function() {
      return originalResponse;
    });

    return ajax("/blah", {
      complete(jqXHR, textStatus) {
        assert.equal(textStatus, "success");
        assert.equal(jqXHR.status, modifiedResponse[0]);
        assert.deepEqual(
          jqXHR.responseJSON,
          modifiedResponse[2],
          "uses JSON response from afterResponse handler"
        );
        assert.ok(
          jqXHR.getAllResponseHeaders().indexOf("x-fake-header") !== -1,
          "includes headers from afterResponse handler"
        );
      }
    });
  });
});
