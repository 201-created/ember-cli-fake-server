import Ember from 'ember';

export function stringifyJSON(json={}){
  return JSON.stringify(json);
}

export function jsonFromRequest(request){
  let json = {};
  if (request.requestBody) {
    if (contentTypeHeaderIsFormUrlEncoded(request.requestHeaders)) {
      json = getJsonFromFormUrlEncodedRequest(request.requestBody);
    } else {
      try {
        json = JSON.parse(request.requestBody);
      } catch (e) {
        Ember.Logger.warn(`[FakeServer] Failed to parse json from request.requestBody "${request.requestBody}" (error: ${e})`);
      }
    }
  }

  return json;
}

function contentTypeHeaderIsFormUrlEncoded(requestHeaders) {
  // request headers string example:
  // {"Content-Type":"application/x-www-form-urlencoded","Accept":"*/*","X-Requested-With":"XMLHttpRequest"}
  const caseInsensitiveformUrlEncodedContentTypeHeader = /content-type[":' ]+application\/x-www-form-urlencoded/gi;
  const contentTypeHeaderStringToCheckCaseInsensitive = JSON.stringify(requestHeaders);
  const contentTypeHeaderIsFormUrlEncoded =
    caseInsensitiveformUrlEncodedContentTypeHeader.test(contentTypeHeaderStringToCheckCaseInsensitive);

  return contentTypeHeaderIsFormUrlEncoded;
}

function getJsonFromFormUrlEncodedRequest(requestBody) {
  let json = {};
  try {
    // 'application/x-www-form-urlencoded' request body example:
    // "foo=bar&hello=World!"
    json = JSON.parse('{"' + decodeURIComponent(requestBody.replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"')) + '"}');
  } catch(e) {
    Ember.Logger.warn(`[FakeServer] Failed to parse json from request.requestBody "${requestBody}" (error: ${e})`);
  }

  return json;
}
