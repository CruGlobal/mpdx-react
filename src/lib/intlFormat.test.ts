import { DateTime } from 'luxon';
import {
  amountFormat,
  currencyFormat,
  dateFormat,
  dateFormatMonthOnly,
  dateFormatWithoutYear,
  dateFromParts,
  dateTimeFormat,
  dayMonthFormat,
  monthYearFormat,
  numberFormat,
  parseNumberFromCurrencyString,
  percentageFormat,
  validateAndFormatInvalidDate,
} from './intlFormat';

describe('intlFormat', () => {
  let languageMock: jest.SpyInstance;

  beforeEach(() => {
    languageMock = jest.spyOn(window.navigator, 'language', 'get');
    languageMock.mockReturnValue(undefined);
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
        // Yen doesn't use fractional digits
        expect(currencyFormat(6000.5, 'JPY', 'ja-JP')).toEqual('￥6,001');
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
      it('handles empty string case', () => {
        expect(currencyFormat(1234.56, '', 'en-GB')).toEqual('US$1,234.56');
      });

      it('handles an error', () => {
        expect(currencyFormat(1234.56, ' ', 'en-GB')).toEqual('1234.56  ');
      });
    });

    describe('amountFormat', () => {
      it('formats number with two decimals in en-US', () => {
        expect(amountFormat(1234.5, 'en-US')).toEqual('1,234.50');
      });

      it('strips trailing zero if integer', () => {
        expect(amountFormat(1000, 'en-US')).toEqual('1,000');
      });

      it('formats number in French locale', () => {
        expect(amountFormat(1234.5, 'fr-FR')).toEqual('1 234,50');
      });

      it('returns empty string for null or undefined', () => {
        expect(amountFormat(null, 'en-US')).toEqual('');
        expect(amountFormat(undefined, 'en-US')).toEqual('');
      });

      it('handles invalid locale by falling back to toString', () => {
        const invalidLocale = 'invalid-locale';
        const result = amountFormat(1234.56, invalidLocale);
        expect(typeof result).toBe('string');
      });
    });

    describe('parseNumberFromCurrencyString', () => {
      it('converts en-US style string to number', () => {
        expect(parseNumberFromCurrencyString('1,234.56')).toEqual(1234.56);
      });

      it('converts en-US style string without decimals to number', () => {
        expect(parseNumberFromCurrencyString('1,234')).toEqual(1234);
      });

      it('converts European-style string to number', () => {
        expect(parseNumberFromCurrencyString('1.234,56', 'de-DE')).toEqual(
          1234.56,
        );
      });

      it('converts string with spaces and currency symbols', () => {
        expect(parseNumberFromCurrencyString('1 234,56 ', 'fr-FR')).toEqual(
          1234.56,
        );
      });

      it('returns null for null, undefined or string', () => {
        expect(parseNumberFromCurrencyString(null)).toBeNull();
        expect(parseNumberFromCurrencyString(undefined)).toBeNull();
        expect(parseNumberFromCurrencyString('')).toBeNull();
        expect(parseNumberFromCurrencyString('asdf')).toBeNull();
      });

      it('handles decimal at the end', () => {
        expect(parseNumberFromCurrencyString('1234,')).toEqual(1234);
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

  describe('dateFormatMonthOnly', () => {
    it('format month', () => {
      expect(dateFormatMonthOnly(DateTime.local(2020, 1, 5), 'en-US')).toEqual(
        'Jan',
      );
    });
    it('handles null date', () => {
      expect(dateFormatMonthOnly(null, 'en-US')).toEqual('');
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

    it('handle an invalid date', () => {
      const date = dateFromParts(2000, 0, 0, locale);

      expect(date).toBe('0/0/2000 - Invalid Date, please fix.');
    });

    it('handle an invalid date without a year', () => {
      const date = dateFromParts(null, 0, 0, locale);

      expect(date).toBe('0/0/2020 - Invalid Date, please fix.');
    });

    it('handle an invalid date where we can not format the invalid date', () => {
      const date = dateFromParts(0, 0, 2000, locale);

      expect(date).toBe(
        'Invalid Date - you specified 0 (of type number) as a month, which is invalid',
      );
    });
  });

  describe('validateAndFormatInvalidDate', () => {
    const locale = 'en-US';
    it('returns invalid date en-US formatted', () => {
      const date = validateAndFormatInvalidDate(2000, 0, 0, locale);
      expect(date.formattedInvalidDate).toBe('0/0/2000');
    });

    it('returns invalid date en-UK formatted', () => {
      const date = validateAndFormatInvalidDate(2000, 0, 0, 'en-UK');
      expect(date.formattedInvalidDate).toBe('0/00/2000');
    });

    it('returns invalid date de formatted', () => {
      const date = validateAndFormatInvalidDate(2000, 0, 0, 'de');
      expect(date.formattedInvalidDate).toBe('0.0.2000');
    });
  });
  //this test often fails locally. It passes on github.
  describe('dateTimeFormat', () => {
    const locale = 'en-US';
    it('returns formatted date with year, month, day, time and timezone', () => {
      const date = dateTimeFormat(
        DateTime.local(2024, 1, 16, 18, 34, 12),
        locale,
      );

      expect(date.trim()).toBe('Jan 16, 2024, 6:34 PM UTC');
    });

    it('returns null if month is null', () => {
      const date = dateTimeFormat(null, locale);

      expect(date).toBe('');
    });
  });
});
