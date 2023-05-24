import { DateTime } from 'luxon';

import {
  dateFormat,
  getDateFormatPattern,
  monthYearFormat,
} from './intlFormat';
import {
  numberFormat,
  percentageFormat,
  currencyFormat,
  dayMonthFormat,
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

    describe('diferent language', () => {
      it('formats number', () => {
        expect(numberFormat(1000.01, 'fr')).toEqual('1 000,01');
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
      expect(currencyFormat(1234.56, 'USD', 'en-US')).toEqual('$1,235');
    });

    it('handles language', () => {
      expect(currencyFormat(1000.1, 'EUR', 'fr')).toEqual('1 000 €');
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
        expect(currencyFormat(1000.1, 'EUR', 'fr')).toEqual('1 000 €');
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
        expect(dateFormat(DateTime.local(2020, 1, 5), 'fr')).toEqual(
          '5 janv. 2020',
        );
      });
    });
  });
});
