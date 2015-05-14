import Pretender from 'pretender';
import Ember from 'ember';
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
    }
  };
}

function bindResponses(request, responseRef){
  Ember.keys(Responses.STATUS_CODES).forEach((key) => {
    request[key] = (...args) => {
      if (responseRef.response) {
        throw new Error(`[FakeServer] Stubbed Request responded with "${key}" after already responding`);
      }
      let response = Responses[key](...args);
      responseRef.response = response;
      return response;
    };
  });
  Ember.keys(Responses.RESPONSE_ALIASES).forEach((key) => {
    let aliases = Responses.RESPONSE_ALIASES[key];
    aliases.forEach((alias) => request[alias] = request[key]);
  });
}

export function stubRequest(verb, path, callback){
  path = _config.preparePath(path);
  Ember.assert('[FakeServer] cannot stub request if FakeServer is not running',
               !!currentServer);

  let boundCallback = (request) => {
    let responseRef = {};

    bindResponses(request, responseRef);

    request.json = () => JSONUtils.jsonFromRequest(request);
    request.fixture = _config.fixtureFactory;

    let context = {
      json: JSONUtils.jsonFromRequest,
      success: Responses.ok,
      noContent: Responses.noContent,
      error: Responses.error,
      notFound: Responses.notFound,
      fixture: _config.fixtureFactory
    };

    let returnValue = callback.call(context, request);
    returnValue = returnValue || responseRef.response;
    if (!returnValue) {
      throw new Error(
        `[FakeServer] No return value for stubbed request for ${verb} ${path}.
         Use \`request.ok(json)\` or similar`);
    }
    return returnValue;
  };

  currentServer[verb](path, boundCallback);
}

let FakeServer = {
  configure: {
    fixtureFactory(fixtureFactory) {
      _config.fixtureFactory = fixtureFactory;
    },
    preparePath(fn) {
      _config.preparePath = fn;
    },
  },

  start() {
    Ember.assert('[FakeServer] Cannot start FakeServer while already started. ' +
                 'Ensure you call `FakeServer.stop()` first.',
                 !FakeServer.isRunning());

    currentServer = new Pretender();
    currentServer.prepareBody = JSONUtils.stringifyJSON;
    currentServer.unhandledRequest = Logging.unhandledRequest;
    currentServer.handledRequest = Logging.handledRequest;
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
    currentServer = null;

    _config = defaultConfig();
  }
};

export default FakeServer;
