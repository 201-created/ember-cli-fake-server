import Pretender from 'pretender';
import Ember from 'ember';
import { assert } from '@ember/debug';
import * as Responses from './lib/responses';
import * as Logging from './lib/logging';
import * as JSONUtils from './lib/json-utils';

let currentServer;

let _config = defaultConfig();

function defaultConfig() {
  return {
    preparePath: (path) => path,
    fixtureFactory: () => {
      Ember.Logger.warn('[FakeServer] `fixture` called but no fixture factory is registered');
    },
    afterResponse: (response) => response
  };
}

function bindResponses(request, responseRef){
  Object.keys(Responses.STATUS_CODES).forEach((key) => {
    request[key] = (...args) => {
      if (responseRef.response) {
        throw new Error(`[FakeServer] Stubbed Request responded with "${key}" after already responding`);
      }
      let response = Responses[key](...args);
      responseRef.response = response;
      return response;
    };
  });
  Object.keys(Responses.RESPONSE_ALIASES).forEach((key) => {
    let aliases = Responses.RESPONSE_ALIASES[key];
    aliases.forEach((alias) => request[alias] = request[key]);
  });
}

export function passthroughRequest(verb, path) {
  path = _config.preparePath(path);
  assert('[FakeServer] cannot passthrough request if FakeServer is not running',
               !!currentServer);

  currentServer[verb.toLowerCase()](path, currentServer.passthrough);
}

export function stubRequest(verb, path, callback){
  path = _config.preparePath(path);
  assert('[FakeServer] cannot stub request if FakeServer is not running',
               !!currentServer);

  let boundCallback = (request) => {
    let responseRef = {};

    bindResponses(request, responseRef);

    request.json = () => JSONUtils.jsonFromRequest(request);
    request.fixture = _config.fixtureFactory;

    let context = {
      json: JSONUtils.jsonFromRequest,
      fixture: _config.fixtureFactory
    };
    Object.keys(Responses.STATUS_CODES).forEach(key => {
      context[key] = Responses[key];
    });
    Object.keys(Responses.RESPONSE_ALIASES).forEach(key => {
      let aliases = Responses.RESPONSE_ALIASES[key];
      aliases.forEach(alias => context[alias] = context[key]);
    });

    let returnValue = callback.call(context, request);
    returnValue = returnValue || responseRef.response;
    if (!returnValue) {
      throw new Error(
        `[FakeServer] No return value for stubbed request for ${verb} ${path}.
         Use \`request.ok(json)\` or similar`);
    }
    return _config.afterResponse(returnValue, request);
  };

  currentServer[verb.toLowerCase()](path, boundCallback);
}

const FakeServer = {
  configure: {
    fixtureFactory(fixtureFactory) {
      _config.fixtureFactory = fixtureFactory;
    },
    preparePath(fn) {
      _config.preparePath = fn;
    },
    afterResponse(fn) {
      _config.afterResponse = fn;
    }
  },


  start(options = {}) {
    assert('[FakeServer] Cannot start FakeServer while already started. ' +
                 'Ensure you call `FakeServer.stop()` first.',
                 !FakeServer.isRunning());

    let logging = typeof options.logging === 'undefined' ? true : options.logging;

    currentServer = this._currentServer = new Pretender();
    currentServer.prepareBody = JSONUtils.stringifyJSON;
    currentServer.unhandledRequest = Logging.unhandledRequest;

    if (logging) {
        currentServer.handledRequest = Logging.handledRequest;
    }
  },

  isRunning() {
    return !!currentServer;
  },

  stop() {
    if (!FakeServer.isRunning()) {
      Ember.Logger.warn('[FakeServer] called `stop` without having started.');
      return;
    }
    currentServer.shutdown();
    currentServer = this._currentServer = null;

    _config = defaultConfig();
  }
};

export default FakeServer;
