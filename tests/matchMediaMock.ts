import mediaQuery, { MediaValues } from 'css-mediaquery';

const matchMediaMock = (options: Partial<MediaValues>): void => {
    window.matchMedia = (query: string): MediaQueryList => {
        return ({
            matches: mediaQuery.match(query, options),
            addListener: jest.fn(),
            removeListener: jest.fn(),
        } as unknown) as MediaQueryList;
    };
};

export default matchMediaMock;
