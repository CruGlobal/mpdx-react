import { isEditableSource } from './helpers';

describe('Tool-Helpers', () => {
  it('isEditableSource', () => {
    expect(isEditableSource('MPDX')).toBe(true);
    expect(isEditableSource('Siebel')).toBe(false);
  });
});
