/* eslint no-console:0 */

export function warn() {
  if (typeof console !== 'undefined') {
    console.warn(...arguments);
  }
}

export function error() {
  if (typeof console !== 'undefined') {
    console.error(...arguments);
  }
}

export function log() {
  if (typeof console !== 'undefined') {
    console.log(...arguments);
  }
}
