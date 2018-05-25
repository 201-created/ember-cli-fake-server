import { log, error } from './logger';

export function unhandledRequest(verb, path, request){
  const msg = `[FakeServer] received unhandled request for ${verb} ${path}`;
  error(msg, request);
  throw new Error(msg);
}

export function handledRequest(verb, path) {
  log(`[FakeServer] handled: ${verb} ${path}`);
}
