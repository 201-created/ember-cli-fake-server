import Ember from 'ember';

export function unhandledRequest(verb, path, request){
  const msg = `[FakeServer] received unhandled request for ${verb} ${path}`;
  Ember.Logger.error(msg, request);
  throw new Error(msg);
}

export function handledRequest(verb, path) {
  Ember.Logger.log(`[FakeServer] handled: ${verb} ${path}`);
}
