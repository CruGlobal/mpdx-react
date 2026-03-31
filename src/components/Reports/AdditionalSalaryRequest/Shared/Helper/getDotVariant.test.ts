import { AsrStatusEnum } from 'src/graphql/types.generated';
import { getDotVariant } from './getDotVariant';

describe('getDotVariant', () => {
  describe('with Approved status', () => {
    it('returns filled with step submitted - approved not paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedNotPaid, 'submitted', false),
      ).toBe('filled');
    });
    it('returns filled with step submitted - approved and paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedAndPaid, 'submitted', false),
      ).toBe('filled');
    });

    it('returns filled with step processed - approved not paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedNotPaid, 'processed', false),
      ).toBe('filled');
    });
    it('returns filled with step processed - approved and paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedAndPaid, 'processed', false),
      ).toBe('filled');
    });

    it('returns filled with step complete - approved not paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedNotPaid, 'complete', false),
      ).toBe('filled');
    });
    it('returns filled with step complete - approved and paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedAndPaid, 'complete', false),
      ).toBe('filled');
    });
  });

  describe('with ActionRequired status', () => {
    it('returns filled with step submitted', () => {
      expect(
        getDotVariant(AsrStatusEnum.ActionRequired, 'submitted', false),
      ).toBe('filled');
    });

    it('returns filled with step processed', () => {
      expect(
        getDotVariant(AsrStatusEnum.ActionRequired, 'processed', false),
      ).toBe('filled');
    });

    it('returns filled with step complete', () => {
      expect(
        getDotVariant(AsrStatusEnum.ActionRequired, 'complete', false),
      ).toBe('filled');
    });
  });
  describe('with Pending status', () => {
    it('returns filled with step submitted - pending', () => {
      expect(getDotVariant(AsrStatusEnum.Pending, 'submitted', true)).toBe(
        'filled',
      );
    });
    it('returns filled with step submitted - pending division head approval', () => {
      expect(
        getDotVariant(
          AsrStatusEnum.PendingDivisionHeadApproval,
          'submitted',
          true,
        ),
      ).toBe('filled');
    });
    it('returns filled with step submitted - pending vp approval', () => {
      expect(
        getDotVariant(AsrStatusEnum.PendingVpApproval, 'submitted', true),
      ).toBe('filled');
    });
    it('returns filled with step submitted - pending management approval', () => {
      expect(
        getDotVariant(
          AsrStatusEnum.PendingManagementApproval,
          'submitted',
          true,
        ),
      ).toBe('filled');
    });
    it('returns filled with step submitted - pending board approval', () => {
      expect(
        getDotVariant(AsrStatusEnum.PendingBoardApproval, 'submitted', true),
      ).toBe('filled');
    });

    it('returns filled with step processed', () => {
      expect(getDotVariant(AsrStatusEnum.Pending, 'processed', true)).toBe(
        'filled',
      );
    });

    it('returns outlined with step complete', () => {
      expect(getDotVariant(AsrStatusEnum.Pending, 'complete', true)).toBe(
        'outlined',
      );
    });
  });
});
