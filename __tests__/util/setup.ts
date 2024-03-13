import '@testing-library/jest-dom/extend-expect';
import { Settings } from 'luxon';
import { Session } from 'next-auth';
import { type useSession } from 'next-auth/react';
import { toHaveGraphqlOperation } from '../extensions/toHaveGraphqlOperation';
import matchMediaMock from './matchMediaMock';

const session: Session = {
  expires: '2021-10-28T14:48:20.897Z',
  user: {
    name: 'First Last',
    email: 'first.last@cru.org',
    apiToken: 'apiToken',
    userID: 'user-1',
    admin: false,
    developer: false,
    impersonating: false,
  },
};

jest.mock('next-auth/react', () => {
  return {
    getSession: jest.fn().mockResolvedValue(session),
    useSession: jest
      .fn<ReturnType<typeof useSession>, Parameters<typeof useSession>>()
      .mockReturnValue({
        status: 'authenticated',
        data: session,
        update: () => Promise.resolve(null),
      }),
    signOut: jest.fn().mockResolvedValue(undefined),
  };
});

expect.extend({
  toHaveGraphqlOperation,
});

process.env.APP_NAME = 'MPDX';

window.Beacon = jest.fn();

window.document.createRange = (): Range =>
  ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    } as unknown as Node,
  } as unknown as Range);

window.HTMLElement.prototype.scrollIntoView = jest.fn();

beforeEach(() => {
  Settings.now = () => new Date(2020, 0, 1).valueOf();
  matchMediaMock({ width: window.innerWidth });
});

afterEach(() => {
  Settings.resetCaches();
});
