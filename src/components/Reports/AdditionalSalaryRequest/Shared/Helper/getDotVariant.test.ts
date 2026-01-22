import { AsrStatusEnum } from 'src/graphql/types.generated';
import { getDotVariant } from './getDotVariant';

describe('getDotVariant', () => {
  describe('with Approved status', () => {
    it('returns filled with step submitted', () => {
      expect(getDotVariant(AsrStatusEnum.Approved, 'submitted')).toBe('filled');
    });

    it('returns filled with step processed', () => {
      expect(getDotVariant(AsrStatusEnum.Approved, 'processed')).toBe('filled');
    });

    it('returns filled with step complete', () => {
      expect(getDotVariant(AsrStatusEnum.Approved, 'complete')).toBe('filled');
    });
  });
  describe('with ActionRequired status', () => {
    it('returns filled with step submitted', () => {
      expect(getDotVariant(AsrStatusEnum.ActionRequired, 'submitted')).toBe(
        'filled',
      );
    });

    it('returns filled with step processed', () => {
      expect(getDotVariant(AsrStatusEnum.ActionRequired, 'processed')).toBe(
        'filled',
      );
    });

    it('returns filled with step complete', () => {
      expect(getDotVariant(AsrStatusEnum.ActionRequired, 'complete')).toBe(
        'filled',
      );
    });
  });
  describe('with Pending status', () => {
    it('returns filled with step submitted', () => {
      expect(getDotVariant(AsrStatusEnum.Pending, 'submitted')).toBe('filled');
    });

    it('returns filled with step processed', () => {
      expect(getDotVariant(AsrStatusEnum.Pending, 'processed')).toBe('filled');
    });

    it('returns outlined with step complete', () => {
      expect(getDotVariant(AsrStatusEnum.Pending, 'complete')).toBe('outlined');
    });
  });
});
