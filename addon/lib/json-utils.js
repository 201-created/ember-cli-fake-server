import Ember from 'ember';

export function stringifyJSON(json={}){
  return JSON.stringify(json);
}

export function jsonFromRequest(request){
  let json = {};
  if (request.requestBody) {
    // nested try...catch statements to avoid complexity checking the content
    // type from the headers, as key and value may have multiple formats:
    // - Key: 'content-type', 'Content-Type'.
    // - Value: 'application/json', 'application/vnd.api+json'.
    try {
      // 'Content-Type': 'application/json'
      json = JSON.parse(request.requestBody);
    } catch (e) {
      try {
        // 'Content-Type': 'application/x-www-form-urlencoded'
        json = JSON.parse('{"' + decodeURIComponent(request.requestBody.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"')) + '"}');
      } catch(e) {
        Ember.Logger.warn(`[FakeServer] Failed to parse json from request.requestBody "${request.requestBody}" (error: ${e})`);
      }
    }
  }

  return json;
}
