import RSVP from 'rsvp';
import jQuery from "jquery";

export default function ajax(url, options) {
  return RSVP.cast(jQuery.ajax(url, options)).catch(() => null);
} 
