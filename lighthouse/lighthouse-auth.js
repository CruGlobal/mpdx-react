'use strict';

const { getOrigin } = require('./lighthouse-origin');

module.exports = async (browser, context) => {
  const delegate = await import(
    /* webpackChunkName: 'lighthouseAuth' */
    './lighthouse-auth.mjs'
  );
  const lighthouse = await import(
    /* webpackChunkName: 'lighthouse' */
    'lighthouse'
  );
  await delegate.main(lighthouse, browser, context.url, getOrigin());
};
