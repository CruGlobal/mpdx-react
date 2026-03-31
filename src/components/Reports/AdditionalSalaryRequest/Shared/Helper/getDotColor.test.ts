import { AsrStatusEnum } from 'src/graphql/types.generated';
import { getDotColor } from './getDotColor';

describe('getDotColor', () => {
  describe('submitted step', () => {
    it('returns success.main when status is not InProgress - pending', () => {
      expect(getDotColor(AsrStatusEnum.Pending, 'submitted', true)).toBe(
        'success.main',
      );
    });

    it('returns success.main when status is not InProgress - pending division head approval', () => {
      expect(
        getDotColor(
          AsrStatusEnum.PendingDivisionHeadApproval,
          'submitted',
          true,
        ),
      ).toBe('success.main');
    });

    it('returns success.main when status is not InProgress - pending vp approval', () => {
      expect(
        getDotColor(AsrStatusEnum.PendingVpApproval, 'submitted', true),
      ).toBe('success.main');
    });

    it('returns success.main when status is not InProgress - pending management approval', () => {
      expect(
        getDotColor(AsrStatusEnum.PendingManagementApproval, 'submitted', true),
      ).toBe('success.main');
    });

    it('returns success.main when status is not InProgress - pending board approval', () => {
      expect(
        getDotColor(AsrStatusEnum.PendingBoardApproval, 'submitted', true),
      ).toBe('success.main');
    });

    it('returns info.main when status is InProgress', () => {
      expect(getDotColor(AsrStatusEnum.InProgress, 'submitted', false)).toBe(
        'info.main',
      );
    });
  });

  describe('processed step', () => {
    it('returns success.main when status is ApprovedNotPaid, ApprovedAndPaid, ActionRequired', () => {
      expect(
        getDotColor(AsrStatusEnum.ApprovedNotPaid, 'processed', false),
      ).toBe('success.main');
      expect(
        getDotColor(AsrStatusEnum.ApprovedAndPaid, 'processed', false),
      ).toBe('success.main');
      expect(
        getDotColor(AsrStatusEnum.ActionRequired, 'processed', false),
      ).toBe('success.main');
    });

    it('returns info.main when status is Pending', () => {
      expect(getDotColor(AsrStatusEnum.Pending, 'processed', true)).toBe(
        'info.main',
      );
    });

    it('returns transparent when status is InProgress', () => {
      expect(getDotColor(AsrStatusEnum.InProgress, 'processed', false)).toBe(
        'transparent',
      );
    });
  });

  describe('complete step', () => {
    it('returns success.main when status is ApprovedNotPaid or ApprovedAndPaid', () => {
      expect(
        getDotColor(AsrStatusEnum.ApprovedNotPaid, 'complete', false),
      ).toBe('success.main');
      expect(
        getDotColor(AsrStatusEnum.ApprovedAndPaid, 'complete', false),
      ).toBe('success.main');
    });

    it('returns warning.main when status is ActionRequired', () => {
      expect(getDotColor(AsrStatusEnum.ActionRequired, 'complete', false)).toBe(
        'warning.main',
      );
    });

    it('returns transparent for other statuses', () => {
      expect(getDotColor(AsrStatusEnum.Pending, 'complete', true)).toBe(
        'transparent',
      );
    });
  });
});
