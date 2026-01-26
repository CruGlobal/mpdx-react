import { AsrStatusEnum } from 'src/graphql/types.generated';
import { getDotColor } from './getDotColor';

describe('getDotColor', () => {
  describe('submitted step', () => {
    it('returns success.main when status is not InProgress', () => {
      expect(getDotColor(AsrStatusEnum.Pending, 'submitted')).toBe(
        'success.main',
      );
    });

    it('returns info.main when status is InProgress', () => {
      expect(getDotColor(AsrStatusEnum.InProgress, 'submitted')).toBe(
        'info.main',
      );
    });
  });

  describe('processed step', () => {
    it('returns success.main when status is Approved or ActionRequired', () => {
      expect(getDotColor(AsrStatusEnum.Approved, 'processed')).toBe(
        'success.main',
      );
      expect(getDotColor(AsrStatusEnum.ActionRequired, 'processed')).toBe(
        'success.main',
      );
    });

    it('returns info.main when status is Pending', () => {
      expect(getDotColor(AsrStatusEnum.Pending, 'processed')).toBe('info.main');
    });

    it('returns transparent when status is InProgress', () => {
      expect(getDotColor(AsrStatusEnum.InProgress, 'processed')).toBe(
        'transparent',
      );
    });
  });

  describe('complete step', () => {
    it('returns success.main when status is Approved', () => {
      expect(getDotColor(AsrStatusEnum.Approved, 'complete')).toBe(
        'success.main',
      );
    });

    it('returns warning.main when status is ActionRequired', () => {
      expect(getDotColor(AsrStatusEnum.ActionRequired, 'complete')).toBe(
        'warning.main',
      );
    });

    it('returns transparent for other statuses', () => {
      expect(getDotColor(AsrStatusEnum.Pending, 'complete')).toBe(
        'transparent',
      );
    });
  });
});
