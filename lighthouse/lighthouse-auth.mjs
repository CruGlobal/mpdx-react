/* eslint-disable no-console */

import fs from 'fs/promises';

const MAX_TRIES = 13;

/**
 * @param {import('puppeteer').Page} page
 * @param {string} origin
 */
async function login(page, origin) {
  await page.goto(origin);
  try {
    await checkForInitialLoad(page);
  } catch (error) {
    console.log(error);
    return;
  }

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
      signInButton = await page.waitForSelector('#sign-in-button', {
        timeout: 5000,
      });

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

export async function checkForInitialLoad(page, timeout = 60_000, tries = 0) {
  if (tries > MAX_TRIES) {
    return Promise.reject(`Failed to load page after ${MAX_TRIES} retries`);
  }
  try {
    await page.waitForSelector('#__next', { timeout: timeout });
  } catch (error) {
    return checkForInitialLoad(page, timeout, tries + 1);
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

export async function main(lighthouse, browser, requestedUrl, origin) {
  const page = await browser.newPage();

  // Setup the browser session to be logged into our site.
  await login(page, origin);

  // Direct Lighthouse to use the same Puppeteer page.
  // Disable storage reset so login session is preserved.
  const result = await lighthouse.default(
    requestedUrl,
    { disableStorageReset: true },
    undefined,
    page,
  );

  // Direct Puppeteer to close the browser as we're done with it.
  await page.close();

  storeResults(result);
}

async function storeResults(result) {
  const coreWebVitals = ['largest-contentful-paint', 'cumulative-layout-shift'];
  let overallScores = Object.values(result.lhr.categories)
    .map((category) => category.score)
    .join(', ');
  const coreWebVitalScores = [];
  Object.values(result.lhr.audits).map((audit) => {
    if (coreWebVitals.includes(audit.id)) {
      coreWebVitalScores.push({
        title: audit.title,
        displayValue: audit.displayValue,
        numericValue: audit.numericValue,
        goodThreshold: audit.scoringOptions?.p10 ?? 0, // this should only happen if something goes wrong
        badThreshold: audit.scoringOptions?.median ?? 0, // this should only happen if something goes wrong
      });
    }
  });

  let markdownResults = `${result.lhr.finalDisplayedUrl}\n<details><summary>Scores</summary>\n\n* **Overall Scores:** ${overallScores}\n`;

  // Output the result.
  console.log(`Lighthouse scores: ${overallScores}`);

  let markdownWarning = '';
  coreWebVitalScores.forEach((vital) => {
    console.log(`${vital.title}: ${vital.displayValue}`);
    if (vital.numericValue > vital.badThreshold) {
      markdownWarning = `> [!CAUTION]\n > `;
    } else if (vital.numericValue > vital.goodThreshold) {
      markdownWarning = markdownWarning ?? `> [!WARNING]\n > `;
    }
    markdownResults += `* **${vital.title}:** ${vital.displayValue}\n`;
  });
  markdownResults += '</details>\n\n';

  await fs.appendFile(
    './lighthouse/lighthouse-results.md',
    markdownWarning + markdownResults,
  );
}
