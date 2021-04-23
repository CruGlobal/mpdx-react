import '@testing-library/jest-dom';
import { Settings } from 'luxon';
import matchMediaMock from './matchMediaMock';

window.document.createRange = (): Range =>
  (({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: ({
      nodeName: 'BODY',
      ownerDocument: document,
    } as unknown) as Node,
  } as unknown) as Range);

window.HTMLElement.prototype.scrollIntoView = jest.fn();

beforeEach(() => {
  Settings.now = () => new Date(2020, 0, 1).valueOf();
  matchMediaMock({ width: window.innerWidth });
});

afterEach(() => {
  Settings.resetCaches();
});
