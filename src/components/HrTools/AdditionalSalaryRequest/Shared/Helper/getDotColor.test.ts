import { AsrStatusEnum } from 'src/graphql/types.generated';
import { getDotColor } from './getDotColor';

describe('getDotColor', () => {
  describe('submitted step', () => {
    it.each([
      AsrStatusEnum.Pending,
      AsrStatusEnum.PendingDivisionHeadApproval,
      AsrStatusEnum.PendingVpApproval,
      AsrStatusEnum.PendingManagementApproval,
      AsrStatusEnum.PendingBoardApproval,
    ])('returns success.main when status is not InProgress - %s', (status) => {
      expect(getDotColor(status, 'submitted', true, false)).toBe(
        'success.main',
      );
    });

    it('returns info.main when status is InProgress', () => {
      expect(
        getDotColor(AsrStatusEnum.InProgress, 'submitted', false, false),
      ).toBe('info.main');
    });
  });

  describe('processed step', () => {
    it('returns success.main when status is ApprovedNotPaid, ApprovedAndPaid, ActionRequired', () => {
      expect(
        getDotColor(AsrStatusEnum.ApprovedNotPaid, 'processed', false, true),
      ).toBe('success.main');
      expect(
        getDotColor(AsrStatusEnum.ApprovedAndPaid, 'processed', false, true),
      ).toBe('success.main');
      expect(
        getDotColor(AsrStatusEnum.ActionRequired, 'processed', false, false),
      ).toBe('success.main');
    });

    it('returns info.main when status is Pending', () => {
      expect(getDotColor(AsrStatusEnum.Pending, 'processed', true, false)).toBe(
        'info.main',
      );
    });

    it('returns transparent when status is InProgress', () => {
      expect(
        getDotColor(AsrStatusEnum.InProgress, 'processed', false, false),
      ).toBe('transparent');
    });
  });

  describe('complete step', () => {
    it('returns success.main when status is ApprovedNotPaid or ApprovedAndPaid', () => {
      expect(
        getDotColor(AsrStatusEnum.ApprovedNotPaid, 'complete', false, true),
      ).toBe('success.main');
      expect(
        getDotColor(AsrStatusEnum.ApprovedAndPaid, 'complete', false, true),
      ).toBe('success.main');
    });

    it('returns warning.main when status is ActionRequired', () => {
      expect(
        getDotColor(AsrStatusEnum.ActionRequired, 'complete', false, false),
      ).toBe('warning.main');
    });

    it('returns transparent for other statuses', () => {
      expect(getDotColor(AsrStatusEnum.Pending, 'complete', true, false)).toBe(
        'transparent',
      );
    });
  });
});
