import fs from 'fs/promises';
import { checkForInitialLoad, main } from './lighthouse-auth.mjs';

describe('Lighthouse Pre-Login Steps', () => {
  const browser = {
    newPage: jest.fn(),
  };
  const initialPage = {
    goto: jest.fn(),
    $: jest.fn(),
    waitForNavigation: jest.fn(),
    waitForSelector: jest.fn(),
    close: jest.fn(),
  };

  browser.newPage.mockImplementation(() => {
    return Promise.resolve(initialPage);
  });

  const successResult = {
    lhr: {
      categories: {
        performance: { score: 0.79 },
        accessibility: { score: 0.98 },
        'best-practices': { score: 0.96 },
        seo: { score: 1 },
        pwa: { score: 1 },
      },
      audits: {
        'largest-contentful-paint': {
          id: 'largest-contentful-paint',
          title: 'Largest Contentful Paint',
          numericValue: 2309.1237499999997,
          displayValue: '2.3 s',
          scoringOptions: {
            p10: 2500,
            median: 4000,
          },
        },
        'cumulative-layout-shift': {
          id: 'cumulative-layout-shift',
          title: 'Cumulative Layout Shift',
          numericValue: 0.029442302042286688,
          displayValue: '0.029',
          scoringOptions: {
            p10: 0.1,
            median: 0.25,
          },
        },
      },
    },
  };

  const mockLighthouse = { default: jest.fn() };

  beforeEach(() => {
    jest.resetModules();
    jest.mock('fs', () => ({ appendFile: jest.fn() }));
    jest.spyOn(fs, 'appendFile').mockImplementation(async () => {});
  });

  describe('main', () => {
    it('should write the results to a file', async () => {
      successfulTestMock();

      await main(
        mockLighthouse,
        browser,
        'http://localhost:3000/accountLists',
        'http://localhost:3000',
      );
      expect(fs.appendFile).toHaveBeenCalledTimes(1);
    });

    it('should try finding the sign in button twice', async () => {
      successfulTestMock();

      initialPage.waitForSelector
        .mockImplementationOnce((selector) => {
          if (selector === '#okta-signin-username') {
            return Promise.reject('could not find element');
          }
          return Promise.resolve({});
        })
        .mockImplementationOnce((selector) => {
          if (selector === '#okta-signin-username') {
            return Promise.resolve({
              click: jest.fn(),
            });
          }
          return Promise.resolve({});
        });

      await main(
        mockLighthouse,
        browser,
        'http://localhost:3000/accountLists',
        'http://localhost:3000',
      );
      expect(initialPage.$).toHaveBeenCalledTimes(1);
      expect(initialPage.waitForSelector).toHaveBeenCalledWith(
        '#sign-in-button',
        expect.anything(),
      );
    });

    it('should not break if the sign in button is not found', async () => {
      await testMissingSignInButton(Promise.reject('could not find element'));
    });

    it('should not break if the sign in button returns null', async () => {
      await testMissingSignInButton(Promise.resolve(null));
    });

    const testMissingSignInButton = async (promiseResponse) => {
      successfulTestMock();

      initialPage.$.mockImplementationOnce((selector) => {
        if (selector === '#sign-in-button') {
          return promiseResponse;
        }
        return Promise.resolve({});
      });

      await main(
        mockLighthouse,
        browser,
        'http://localhost:3000/accountLists',
        'http://localhost:3000',
      );

      expect(initialPage.waitForNavigation).not.toHaveBeenCalled();
      expect(fs.appendFile).toHaveBeenCalled();
    };

    it('should not break if the sign in button is not found the second time', async () => {
      successfulTestMock();

      initialPage.$.mockImplementation((selector) => {
        if (selector === '#sign-in-button') {
          return Promise.resolve({
            click: jest.fn(),
          });
        }
        return Promise.resolve({});
      });

      initialPage.waitForSelector.mockImplementation((selector) => {
        if (selector === '#sign-in-button') {
          return Promise.reject('could not find element');
        }
        if (selector === '#okta-signin-username') {
          return Promise.reject('could not find element');
        }
        return Promise.resolve({});
      });

      await main(
        mockLighthouse,
        browser,
        'http://localhost:3000/accountLists',
        'http://localhost:3000',
      );

      expect(initialPage.waitForNavigation).toHaveBeenCalledTimes(1);
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it('should add formatting to bad scores', async () => {
      successfulTestMock();

      const badPerformanceResult = { ...successResult };
      badPerformanceResult.lhr.audits[
        'largest-contentful-paint'
      ].numericValue = 2600;
      badPerformanceResult.lhr.audits[
        'cumulative-layout-shift'
      ].numericValue = 0.3;

      mockLighthouse.default.mockImplementation(() => {
        return Promise.resolve(badPerformanceResult);
      });

      await main(
        mockLighthouse,
        browser,
        'http://localhost:3000/accountLists',
        'http://localhost:3000',
      );

      expect(fs.appendFile).toHaveBeenCalledWith(
        './lighthouse/lighthouse-results.md',
        expect.stringContaining('[!CAUTION]'),
      );
    });
  });

  describe('checkForInitialLoad', () => {
    it('should load the initial page right away', async () => {
      successfulTestMock();

      await checkForInitialLoad(initialPage, 500);
      expect(initialPage.waitForSelector).toHaveBeenCalledTimes(1);
    }, 500);

    it('should wait until the page is available', async () => {
      successfulTestMock();

      initialPage.waitForSelector
        .mockImplementationOnce((selector) => {
          if (selector === '#__next') {
            return Promise.reject('Timed out waiting to find element');
          }
          return Promise.resolve({});
        })
        .mockResolvedValueOnce({});

      await checkForInitialLoad(initialPage, 500);
      expect(initialPage.waitForSelector).toHaveBeenCalledTimes(2);
    });

    it('should stop trying after max tries', async () => {
      successfulTestMock();

      const promiseWithTimeout = (timeout) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            reject(new Error('Timed out waiting to find element'));
          }, timeout);
        });
      };

      const maxTries = 14;
      const timeout = 100;
      for (let i = 0; i < maxTries; i++) {
        initialPage.waitForSelector.mockImplementationOnce(() =>
          promiseWithTimeout(timeout),
        );
      }

      initialPage.waitForSelector.mockResolvedValueOnce({});

      await expect(() =>
        checkForInitialLoad(initialPage, timeout),
      ).rejects.toEqual(`Failed to load page after ${maxTries - 1} retries`);
      expect(initialPage.waitForSelector).toHaveBeenCalledTimes(maxTries);
    });
  });

  const successfulTestMock = () => {
    const initialResponse = {
      status: 200,
    };

    initialPage.goto.mockImplementation(() => {
      return Promise.resolve(initialResponse);
    });

    initialPage.$.mockImplementation((selector) => {
      if (selector === '#sign-in-button') {
        return Promise.resolve({
          click: jest.fn(),
        });
      }
      return Promise.resolve({});
    });

    initialPage.waitForSelector.mockImplementation((selector) => {
      let element = {};
      if (
        selector === '#okta-signin-username' ||
        selector === 'input[type="password"]'
      ) {
        element = {
          type: jest.fn(),
          press: jest.fn(),
        };
      } else if (selector === '#okta-signin-submit') {
        element = {
          click: jest.fn(),
        };
      }
      return Promise.resolve(element);
    });

    mockLighthouse.default.mockImplementation(() => {
      return Promise.resolve(successResult);
    });
  };
});
