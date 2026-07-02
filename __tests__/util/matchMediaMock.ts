import mediaQuery, { MediaValues } from 'css-mediaquery';

const matchMediaMock = (options: Partial<MediaValues>): void => {
  window.matchMedia = (query: string): MediaQueryList => {
    return {
      matches: mediaQuery.match(query, options),
      media: query,
      onchange: null,
      // Deprecated MediaQueryList API (kept for older callers)
      addListener: jest.fn(),
      removeListener: jest.fn(),
      // Modern EventTarget API — MUI v7's useMediaQuery uses these
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    } as unknown as MediaQueryList;
  };
};

export default matchMediaMock;
