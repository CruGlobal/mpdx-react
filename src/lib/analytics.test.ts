import { dispatch } from './analytics';

describe('dispatch', () => {
  const push = jest.fn();

  describe('without data layer', () => {
    it('does not call data layer push', () => {
      dispatch('ga-event');
      expect(push).not.toHaveBeenCalled();
    });
  });

  describe('with data layer', () => {
    beforeEach(() => {
      (window as any).dataLayer = {
        push,
      };
    });

    it('calls data layer push', () => {
      dispatch('ga-event');
      expect(push).toHaveBeenCalledWith({ event: 'ga-event' });
    });
  });
});
