import { topChromeSafeAreaOffset, topChromeSafeAreaPadding } from './safeArea';

describe('safeArea', () => {
  it('pads fixed top chrome with the top/side safe-area insets', () => {
    expect(topChromeSafeAreaPadding).toEqual({
      paddingTop: 'env(safe-area-inset-top)',
      paddingLeft: 'env(safe-area-inset-left)',
      paddingRight: 'env(safe-area-inset-right)',
    });
  });

  it('grows offset spacers by the top inset without margin collapse', () => {
    expect(topChromeSafeAreaOffset).toEqual({
      paddingTop: 'env(safe-area-inset-top)',
      boxSizing: 'content-box',
    });
  });
});
