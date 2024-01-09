import { sourceToStr } from './sourceToStr';

describe('SourceToStr', () => {
  it('should convert Siebel', () => {
    expect(sourceToStr('Siebel')).toBe('US Donation Services');
  });
  it('should convert DataServer', () => {
    expect(sourceToStr('DataServer')).toBe('DonorHub');
  });
  it('should not convert MPDX', () => {
    expect(sourceToStr('MPDX')).toBe('MPDX');
  });
  it('should convert TntImport', () => {
    expect(sourceToStr('TntImport')).toBe('Tnt Import');
  });
  it('should convert GoogleImport', () => {
    expect(sourceToStr('GoogleImport')).toBe('Google Import');
  });
  it('should convert default case', () => {
    expect(sourceToStr('test')).toBe('MPDX');
  });
});
