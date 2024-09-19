import '@testing-library/jest-dom/extend-expect';
import 'isomorphic-fetch';
import { Settings } from 'luxon';
import { type useSession } from 'next-auth/react';
import { session } from '__tests__/fixtures/session';
import { toHaveGraphqlOperation } from '../extensions/toHaveGraphqlOperation';
import matchMediaMock from './matchMediaMock';

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
    signIn: jest.fn().mockResolvedValue(undefined),
    signOut: jest.fn().mockResolvedValue(undefined),
  };
});

expect.extend({
  toHaveGraphqlOperation,
});

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

Object.defineProperty(window, 'location', {
  value: { ...window.location, assign: jest.fn(), replace: jest.fn() },
});

window.HTMLElement.prototype.scrollIntoView = jest.fn();

window.URL.revokeObjectURL = jest.fn();

beforeEach(() => {
  Settings.now = () => new Date(2020, 0, 1).valueOf();
  matchMediaMock({ width: window.innerWidth });
});

afterEach(() => {
  Settings.resetCaches();
});
