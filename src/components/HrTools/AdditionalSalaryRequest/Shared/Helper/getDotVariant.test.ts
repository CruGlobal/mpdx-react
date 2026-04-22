import { AsrStatusEnum } from 'src/graphql/types.generated';
import { getDotVariant } from './getDotVariant';

describe('getDotVariant', () => {
  describe('with Approved status', () => {
    it('returns filled with step submitted - approved not paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedNotPaid, 'submitted', false, true),
      ).toBe('filled');
    });
    it('returns filled with step submitted - approved and paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedAndPaid, 'submitted', false, true),
      ).toBe('filled');
    });

    it('returns filled with step processed - approved not paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedNotPaid, 'processed', false, true),
      ).toBe('filled');
    });
    it('returns filled with step processed - approved and paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedAndPaid, 'processed', false, true),
      ).toBe('filled');
    });

    it('returns filled with step complete - approved not paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedNotPaid, 'complete', false, true),
      ).toBe('filled');
    });
    it('returns filled with step complete - approved and paid', () => {
      expect(
        getDotVariant(AsrStatusEnum.ApprovedAndPaid, 'complete', false, true),
      ).toBe('filled');
    });
  });

  describe('with ActionRequired status', () => {
    it('returns filled with step submitted', () => {
      expect(
        getDotVariant(AsrStatusEnum.ActionRequired, 'submitted', false, false),
      ).toBe('filled');
    });

    it('returns filled with step processed', () => {
      expect(
        getDotVariant(AsrStatusEnum.ActionRequired, 'processed', false, false),
      ).toBe('filled');
    });

    it('returns filled with step complete', () => {
      expect(
        getDotVariant(AsrStatusEnum.ActionRequired, 'complete', false, false),
      ).toBe('filled');
    });
  });
  describe('with Pending status', () => {
    it.each([
      AsrStatusEnum.Pending,
      AsrStatusEnum.PendingDivisionHeadApproval,
      AsrStatusEnum.PendingVpApproval,
      AsrStatusEnum.PendingManagementApproval,
      AsrStatusEnum.PendingBoardApproval,
    ])('returns filled with step submitted - %s', (status) => {
      expect(getDotVariant(status, 'submitted', true, false)).toBe('filled');
    });

    it('returns filled with step processed', () => {
      expect(
        getDotVariant(AsrStatusEnum.Pending, 'processed', true, false),
      ).toBe('filled');
    });

    it('returns outlined with step complete', () => {
      expect(
        getDotVariant(AsrStatusEnum.Pending, 'complete', true, false),
      ).toBe('outlined');
    });
  });
});
