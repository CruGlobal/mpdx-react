import { DateTime } from 'luxon';
import {
  dateFormat,
  dateFormatWithoutYear,
  dateFromParts,
  dateTimeFormat,
  getDateFormatPattern,
  monthYearFormat,
} from './intlFormat';
import {
  currencyFormat,
  dayMonthFormat,
  numberFormat,
  percentageFormat,
} from '.';

describe('intlFormat', () => {
  let languageMock: jest.SpyInstance;

  beforeEach(() => {
    languageMock = jest.spyOn(window.navigator, 'language', 'get');
    languageMock.mockReturnValue(undefined);
  });

  describe('getDateFormatPattern', () => {
    it('is M/d/yyyy for English', () => {
      expect(getDateFormatPattern('en-US')).toBe('M/d/yyyy');
    });

    it('is d/M/yyyy for Spanish', () => {
      expect(getDateFormatPattern('es')).toBe('d/M/yyyy');
    });
  });

  describe('numberFormat', () => {
    it('formats number', () => {
      expect(numberFormat(1000.1, 'en-US')).toEqual('1,000.1');
    });

    it('handles NaN case', () => {
      expect(numberFormat(NaN, 'en-US')).toEqual('0');
    });

    it('handles language', () => {
      expect(numberFormat(1000.01, 'fr')).toEqual('1 000,01');
    });

    describe('different language', () => {
      it('formats number', () => {
        expect(numberFormat(1000.01, 'fr-FR')).toEqual('1 000,01');
        expect(currencyFormat(1000.1, 'EUR', 'fr-FR')).toEqual('1 000,10 €');
        expect(currencyFormat(25000.1, 'EUR', 'de-DE')).toEqual('25.000,10 €');
        expect(currencyFormat(6000.5, 'JPY', 'ja-JP')).toEqual('￥6,000.50');
      });
    });
  });

  describe('percentageFormat', () => {
    it('formats number as percentage', () => {
      expect(percentageFormat(0.95, 'en-US')).toEqual('95%');
    });

    it('handles NaN case', () => {
      expect(percentageFormat(NaN, 'en-US')).toEqual('0%');
    });

    it('handles language', () => {
      expect(percentageFormat(1000.01, 'fr')).toEqual('100 001 %');
    });

    describe('different language', () => {
      it('handles language', () => {
        expect(percentageFormat(1000.01, 'fr')).toEqual('100 001 %');
      });
    });
  });

  describe('currencyFormat', () => {
    it('formats number as currency', () => {
      expect(currencyFormat(1234.56, 'USD', 'en-US')).toEqual('$1,234.56');
    });

    it('handles language', () => {
      expect(currencyFormat(1000.1, 'EUR', 'fr')).toEqual('1 000,10 €');
    });

    describe('value', () => {
      it('handles NaN case', () => {
        expect(currencyFormat(NaN, 'NZD', 'en-US')).toEqual('NZ$0');
      });
    });

    describe('currency', () => {
      it('handles undefined case', () => {
        expect(currencyFormat(1000, undefined, 'en-US')).toEqual('$1,000');
      });
    });

    describe('different language', () => {
      it('handles language', () => {
        expect(currencyFormat(1000.1, 'EUR', 'fr')).toEqual('1 000,10 €');
      });
    });
  });

  describe('dayMonthFormat', () => {
    it('formats day and month as date', () => {
      expect(dayMonthFormat(5, 1, 'en-US')).toEqual('Jan 5');
    });

    it('handles language', () => {
      expect(dayMonthFormat(5, 1, 'fr')).toEqual('5 janv.');
    });

    describe('different language', () => {
      it('handles language', () => {
        expect(dayMonthFormat(5, 1, 'fr')).toEqual('5 janv.');
      });
    });
  });

  describe('monthYearFormat', () => {
    it('formats day and month as date', () => {
      expect(monthYearFormat(6, 2020, 'en-US')).toEqual('Jun 2020');
    });

    it('handles language', () => {
      expect(monthYearFormat(6, 2020, 'fr')).toEqual('juin 2020');
    });

    describe('different language', () => {
      it('handles language', () => {
        expect(monthYearFormat(6, 2020, 'fr')).toEqual('juin 2020');
      });
    });
  });

  describe('dateFormat', () => {
    it('formats day and month as date', () => {
      expect(dateFormat(DateTime.local(2020, 1, 5), 'en-US')).toEqual(
        'Jan 5, 2020',
      );
    });

    it('handles language', () => {
      expect(dateFormat(DateTime.local(2020, 1, 5), 'fr')).toEqual(
        '5 janv. 2020',
      );
    });

    describe('different language', () => {
      it('handles language', () => {
        expect(dateFormat(DateTime.local(2020, 1, 5), 'es-419')).toEqual(
          '5 ene 2020',
        );
      });
    });
  });

  describe('dateFormatWithoutYear', () => {
    it('formats day and month as date', () => {
      expect(
        dateFormatWithoutYear(DateTime.local(2020, 1, 5), 'en-US'),
      ).toEqual('Jan 5');
    });

    it('handles language', () => {
      expect(dateFormatWithoutYear(DateTime.local(2020, 1, 5), 'fr')).toEqual(
        '5 janv.',
      );
    });

    describe('different language', () => {
      it('handles language', () => {
        expect(
          dateFormatWithoutYear(DateTime.local(2020, 1, 5), 'es-419'),
        ).toEqual('5 ene');
      });
    });
  });

  describe('dateFromParts', () => {
    const locale = 'en-US';
    it('returns formatted date with year, month and day', () => {
      const date = dateFromParts(2005, 5, 6, locale);

      expect(date).toBe('May 6, 2005');
    });

    it('returns month day format if year is null', () => {
      const date = dateFromParts(null, 5, 6, locale);

      expect(date).toBe('May 6');
    });

    it('returns null if month is null', () => {
      const date = dateFromParts(null, null, 6, locale);

      expect(date).toBeNull();
    });
  });

  describe('dateTimeFormat', () => {
    const locale = 'en-US';
    it('returns formatted date with year, month, day, time and timezone', () => {
      const date = dateTimeFormat(
        DateTime.local(2024, 1, 16, 18, 34, 12),
        locale,
      );

      expect(date.trim()).toBe('Jan 16, 2024, 6:34 PM UTC');
    });

    it('returns null if month is null', () => {
      const date = dateTimeFormat(null, locale);

      expect(date).toBe('');
    });
  });
});
