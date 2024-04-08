'use strict';

/* eslint-disable no-console */

/**
 * @param {puppeteer.Page} page
 * @param {string} origin
 */
async function login(page, origin) {
  await page.goto(origin);

  let signInButton;
  try {
    signInButton = await page.$('#sign-in-button');
    if (signInButton === null) {
      return;
    }
  } catch (error) {
    console.log(' Did not find signInButton', error);
    return;
  }

  // Redirect to Okta login
  const redirectToOktaPromise = page.waitForNavigation();
  await signInButton.click();
  await redirectToOktaPromise;

  // Fill in and submit login form.
  try {
    await loginToOkta(page);
  } catch (error) {
    // Sometimes the login to Okta fails for some reason and puts us back on the /login page of MPDx, so try again.
    try {
      signInButton = await page.$('#sign-in-button', { timeout: 5000 });

      if (signInButton) {
        const redirectToOktaPromise = page.waitForNavigation();
        await signInButton.click();
        await redirectToOktaPromise;
        try {
          await loginToOkta(page);
        } catch (loginError) {
          console.log('Failed to login', loginError);
        }
      }
    } catch (error) {
      console.log(' Did not find signInButton', error);
      return;
    }
  }
}

async function loginToOkta(page) {
  const usernameInput = await page.waitForSelector('#okta-signin-username', {
    timeout: 5000,
  });
  await usernameInput.type(process.env.MPDX_USERNAME);

  const clickToNextPage = page.waitForNavigation();
  const submitButton = await page.waitForSelector('#okta-signin-submit');
  await submitButton.click();
  await clickToNextPage;

  const redirectFromOkta = page.waitForNavigation();
  const passwordInput = await page.waitForSelector('input[type="password"]');
  await passwordInput.type(process.env.MPDX_PASSWORD);
  await passwordInput.press('Enter');
  await redirectFromOkta;
}

async function main(browser) {
  const lighthouse = await import(
    /* webpackChunkName: 'lighthouse' */
    'lighthouse'
  );

  const page = await browser.newPage();

  // Setup the browser session to be logged into our site.
  const origin = process.env.PREVIEW_URL ?? 'http://localhost:3000';
  await login(page, origin);

  const accountListsUrl = `${origin}/accountLists`;

  // Direct Lighthouse to use the same Puppeteer page.
  // Disable storage reset so login session is preserved.
  const result = await lighthouse.default(
    accountListsUrl,
    { disableStorageReset: true },
    undefined,
    page,
  );

  // Direct Puppeteer to close the browser as we're done with it.
  await page.close();

  // Output the result.
  console.log(
    `Lighthouse scores: ${Object.values(result.lhr.categories)
      .map((category) => category.score)
      .join(', ')}`,
  );
  const coreWebVitals = ['largest-contentful-paint', 'cumulative-layout-shift'];
  Object.values(result.lhr.audits).map((audit) => {
    if (coreWebVitals.includes(audit.id)) {
      console.log(`${audit.title}: ${audit.displayValue}`);
    }
  });
}

module.exports = async (browser) => {
  await main(browser);
};
