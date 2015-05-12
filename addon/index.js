import Pretender from 'pretender';
import Ember from 'ember';
import * as Responses from './lib/responses';

let currentServer;
let namespace;
let fixtureFactory;

function stringifyJSON(json){
  return json ? JSON.stringify(json) : '{"error": "not found"}';
}

function raiseOnUnhandledRequest(verb, path, request){
  Ember.Logger.error("[FakeServer] received unhandled request",{verb:verb,path:path,request:request});
  throw new Error("FakeServer received unhandled request for :" + verb + " " + path);
}

function logHandledRequest(verb, path, request) {
  Ember.Logger.log('[FakeServer] handled: ' + verb + ' ' + path, request);
}

function jsonFromRequest(request){
  if (!request.requestBody) {
    return {};
  }

  return JSON.parse(request.requestBody);
}

function bindResponses(request, responseRef){
  Ember.keys(Responses.STATUS_CODES).forEach((code) => {
    request[code] = (...args) => {
      if (responseRef.response) {
        throw new Error(`[FakeServer] Stubbed Request responded with "${code}" after already responding`);
      }
      let response = Responses[code](...args);
      responseRef.response = response;
      return response;
    };
  });
}

export function stubRequest(verb, path, callback){
  path = preparePath(path);

  Ember.assert('[FakeServer] cannot stub request if FakeServer is not running',
               !!currentServer);

  let boundCallback = (request) => {
    let responseRef = {};

    bindResponses(request, responseRef);

    request.json = jsonFromRequest(request);

    let context = {
      json: jsonFromRequest,
      success: Responses.ok,
      noContent: Responses.noContent,
      error: Responses.error,
      notFound: Responses.notFound,
      fixture: fixtureFactory
    };

    let returnValue = callback.call(context, request);
    returnValue = returnValue || responseRef.response;
    if (!returnValue) {
      throw new Error('[FakeServer] A stubbed request must have a response. Use `request.ok() or similar.');
    }
    return returnValue;
  };

  currentServer[verb](path, boundCallback);
}

function preparePath(path){
  let paths = [path];
  if (namespace) { paths.unshift(namespace); }
  return paths.join('/');
}

export default {
  configureNamespace(_namespace){
    namespace = _namespace;
  },

  configureFixtures(_fixtureFactory){
    fixtureFactory = _fixtureFactory;
  },

  start() {
    Ember.assert('[FakeServer] Cannot start FakeServer while already started.',
                 !currentServer);

    currentServer = new Pretender();
    currentServer.prepareBody = stringifyJSON;
    currentServer.unhandledRequest = raiseOnUnhandledRequest;
    currentServer.handledRequest = logHandledRequest;
  },

  stop() {
    if (!currentServer) {
      Ember.Logger.warn('[FakeServer] called `stop` without having started.');
      return;
    }
    currentServer.shutdown();
    currentServer = null;
    fixtureFactory = null;
    namespace = null;
  }
};
