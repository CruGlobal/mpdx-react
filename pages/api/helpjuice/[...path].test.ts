import { buildUrlPath } from './[...path].page';

describe('buildUrlPath', () => {
  it('should build an empty path from a falsy original path', () => {
    expect(buildUrlPath(undefined)).toBeUndefined();
  });

  it('should build an empty path from an empty string', () => {
    expect(buildUrlPath('')).toEqual('');
  });

  it('should build a path from a comma delimited string', () => {
    const builtPath = buildUrlPath('one,two,three');
    expect(builtPath).toEqual('one/two/three');
  });

  it('should build a path from a string array', () => {
    const originalPath = ['one', 'two', 'three'];
    expect(buildUrlPath(originalPath)).toEqual('one/two/three');
  });
});
