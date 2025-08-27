import { validateRowData } from './gridErrorHelpers';

describe('gridErrorHelpers', () => {
  describe('validateRowData', () => {
    it('should return no errors for valid data', () => {
      const result = validateRowData('1', 'Valid Label', 100);

      expect(result).toEqual({
        hasErrors: false,
        errors: {},
      });
    });

    describe('label validation', () => {
      it('should return error for empty label', () => {
        const result = validateRowData('1', '', 100);
        expect(result.hasErrors).toBe(true);
        expect(result.errors['1-label']).toEqual(['Label is required']);
      });

      it('should return error for label with only whitespace', () => {
        const result = validateRowData('1', '   ', 100);
        expect(result.hasErrors).toBe(true);
        expect(result.errors['1-label']).toEqual(['Label is required']);
      });

      it('should return error for label longer than 100 characters', () => {
        const longLabel = 'a'.repeat(101);
        const result = validateRowData('1', longLabel, 100);
        expect(result.hasErrors).toBe(true);
        expect(result.errors['1-label']).toEqual([
          'Label must be less than 100 characters',
        ]);
      });

      it('should accept label with exactly 100 characters', () => {
        const exactLabel = 'a'.repeat(100);
        const result = validateRowData('1', exactLabel, 100);
        expect(result.hasErrors).toBe(false);
        expect(result.errors['1-label']).toBeUndefined();
      });
    });

    describe('amount validation', () => {
      it('should return error for NaN amount', () => {
        const result = validateRowData('1', 'Valid Label', NaN);
        expect(result.hasErrors).toBe(true);
        expect(result.errors['1-amount']).toEqual([
          'Amount must be a valid number',
        ]);
      });

      it('should return error for negative amount', () => {
        const result = validateRowData('1', 'Valid Label', -10);
        expect(result.hasErrors).toBe(true);
        expect(result.errors['1-amount']).toEqual([
          'Amount cannot be negative',
        ]);
      });

      it('should return error for amount too large', () => {
        const result = validateRowData('1', 'Valid Label', 1000000001);
        expect(result.hasErrors).toBe(true);
        expect(result.errors['1-amount']).toEqual(['Amount is too large']);
      });

      it('should accept amount at the maximum limit', () => {
        const result = validateRowData('1', 'Valid Label', 1000000000);
        expect(result.hasErrors).toBe(false);
        expect(result.errors['1-amount']).toBeUndefined();
      });

      it('should accept zero amount', () => {
        const result = validateRowData('1', 'Valid Label', 0);
        expect(result.hasErrors).toBe(false);
        expect(result.errors['1-amount']).toBeUndefined();
      });

      it('should accept valid positive amount', () => {
        const result = validateRowData('1', 'Valid Label', 500.75);
        expect(result.hasErrors).toBe(false);
        expect(result.errors['1-amount']).toBeUndefined();
      });
    });

    describe('multiple validation errors', () => {
      it('should return multiple errors when both label and amount are invalid', () => {
        const result = validateRowData('1', '', -10);
        expect(result.hasErrors).toBe(true);
        expect(result.errors['1-label']).toEqual(['Label is required']);
        expect(result.errors['1-amount']).toEqual([
          'Amount cannot be negative',
        ]);
      });

      it('should return errors with correct row ID prefix', () => {
        const result = validateRowData('test-row-123', '', NaN);
        expect(result.hasErrors).toBe(true);
        expect(result.errors['test-row-123-label']).toEqual([
          'Label is required',
        ]);
        expect(result.errors['test-row-123-amount']).toEqual([
          'Amount must be a valid number',
        ]);
      });
    });

    describe('edge cases', () => {
      it('should handle undefined amount gracefully', () => {
        const result = validateRowData('1', 'Valid Label', undefined as any);
        expect(result.hasErrors).toBe(false);
        expect(result.errors['1-amount']).toBeUndefined();
      });

      it('should handle null amount gracefully', () => {
        const result = validateRowData('1', 'Valid Label', null as any);
        expect(result.hasErrors).toBe(false);
        expect(result.errors['1-amount']).toBeUndefined();
      });

      it('should handle numeric string amounts', () => {
        const result = validateRowData('1', 'Valid Label', Number('123.45'));
        expect(result.hasErrors).toBe(false);
        expect(result.errors['1-amount']).toBeUndefined();
      });
    });
  });
});
