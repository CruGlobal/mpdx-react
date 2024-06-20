import { parseHelpUrls } from './_app.page';

describe('parseHelpUrls', () => {
  it('is empty when the input is null', () => {
    expect(parseHelpUrls(null)).toEqual({});
  });

  it('is empty when the input is an empty string', () => {
    expect(parseHelpUrls('')).toEqual({});
  });

  it('is empty when the input is invalid JSON', () => {
    expect(parseHelpUrls('{"a":"1"')).toEqual({});
  });

  it('is empty when the input is not an object', () => {
    expect(parseHelpUrls('0')).toEqual({});
  });

  it('parses the input as JSON an object', () => {
    expect(parseHelpUrls('{"a":"1","b":"2"}')).toEqual({ a: '1', b: '2' });
  });
});
