import { warn } from './logger';

export function stringifyJSON(json={}){
  return JSON.stringify(json);
}

export function jsonFromRequest(request){
  let json = {};
  if (request.requestBody) {
    try {
      json = JSON.parse(request.requestBody);
    } catch(e) {
      warn(`[FakeServer] Failed to parse json from request.requestBody "${request.requestBody}" (error: ${e})`);
    }
  }

  return json;
}
