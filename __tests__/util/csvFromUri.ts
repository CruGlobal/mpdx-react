// jsdom has no URL.createObjectURL, so react-csv's buildURI returns a data URI
// holding the file text after the byte order mark
export const csvFromUri = (uri: string): string =>
  uri.slice(uri.indexOf('﻿') + 1);
