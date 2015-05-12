export const STATUS_CODES = {
  error: 422,
  notFound: 404,
  ok: 200,
  created: 201,
  noContent: 204
};

const jsonMimeType = {"Content-Type": "application/json"};

export function error(status, errors){
  if (!errors) { errors = status; status = STATUS_CODES.error; }

  return [status, jsonMimeType, errors];
}

export function notFound(status, json){
  if (!json) { json = status || {}; status = STATUS_CODES.notFound; }

  return [status, jsonMimeType, json];
}

export function ok(status, json){
  if (!json) { json = status; status = STATUS_CODES.ok; }

  return [status, jsonMimeType, json];
}

export function created(status, json){
  if (!json) { json = status; status = STATUS_CODES.created; }

  return [status, jsonMimeType, json];
}

export function noContent(status){
  if (!status) { status = STATUS_CODES.noContent; }

  return [status, jsonMimeType, ''];
}
