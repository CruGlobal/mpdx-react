import { DateTime } from 'luxon';

import { dateFormat, monthYearFormat } from './intlFormat';
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

  describe('numberFormat', () => {
    it('formats number', () => {
      expect(numberFormat(1000.1)).toEqual('1,000.1');
    });

    it('handles NaN case', () => {
      expect(numberFormat(NaN)).toEqual('0');
    });

    it('handles null case', () => {
      expect(numberFormat(null)).toEqual('0');
    });

    it('handles undefined case', () => {
      expect(numberFormat(undefined)).toEqual('0');
    });

    it('handles language', () => {
      expect(numberFormat(1000.01, 'fr')).toEqual('1 000,01');
    });

    describe('default language', () => {
      beforeEach(() => {
        languageMock.mockReturnValue('fr');
      });

      it('formats number', () => {
        expect(numberFormat(1000.01)).toEqual('1 000,01');
      });
    });
  });

  describe('percentageFormat', () => {
    it('formats number as percentage', () => {
      expect(percentageFormat(0.95)).toEqual('95%');
    });

    it('handles NaN case', () => {
      expect(percentageFormat(NaN)).toEqual('0%');
    });

    it('handles null case', () => {
      expect(percentageFormat(null)).toEqual('0%');
    });

    it('handles undefined case', () => {
      expect(percentageFormat(undefined)).toEqual('0%');
    });

    it('handles language', () => {
      expect(percentageFormat(1000.01, 'fr')).toEqual('100 001 %');
    });

    describe('default language', () => {
      beforeEach(() => {
        languageMock.mockReturnValue('fr');
      });

      it('handles language', () => {
        expect(percentageFormat(1000.01)).toEqual('100 001 %');
      });
    });
  });

  describe('currencyFormat', () => {
    it('formats number as currency', () => {
      expect(currencyFormat(1234.56, 'USD', 2)).toEqual('$1,234.56');
    });

    it('handles language', () => {
      expect(currencyFormat(1000.1, 'EUR', 2, 'fr')).toEqual('1 000,10 €');
    });

    describe('value', () => {
      it('handles NaN case', () => {
        expect(currencyFormat(NaN, 'NZD')).toEqual('NZ$0');
      });

      it('handles null case', () => {
        expect(currencyFormat(null, 'NZD')).toEqual('NZ$0');
      });

      it('handles undefined case', () => {
        expect(currencyFormat(undefined, 'NZD')).toEqual('NZ$0');
      });
    });

    describe('currency', () => {
      it('handles null case', () => {
        expect(currencyFormat(1000, null)).toEqual('$1,000');
      });

      it('handles undefined case', () => {
        expect(currencyFormat(1000, undefined)).toEqual('$1,000');
      });
    });

    describe('default language', () => {
      beforeEach(() => {
        languageMock.mockReturnValue('fr');
      });

      it('handles language', () => {
        expect(currencyFormat(1000.1, 'EUR', 2)).toEqual('1 000,10 €');
      });
    });
  });

  describe('dayMonthFormat', () => {
    it('formats day and month as date', () => {
      expect(dayMonthFormat(5, 1)).toEqual('Jan 5');
    });

    it('handles language', () => {
      expect(dayMonthFormat(5, 1, 'fr')).toEqual('5 janv.');
    });

    describe('default language', () => {
      beforeEach(() => {
        languageMock.mockReturnValue('fr');
      });

      it('handles language', () => {
        expect(dayMonthFormat(5, 1)).toEqual('5 janv.');
      });
    });
  });

  describe('monthYearFormat', () => {
    it('formats day and month as date', () => {
      expect(monthYearFormat(6, 2020)).toEqual('Jun 2020');
    });

    it('handles language', () => {
      expect(monthYearFormat(6, 2020, 'fr')).toEqual('juin 2020');
    });

    describe('default language', () => {
      beforeEach(() => {
        languageMock.mockReturnValue('fr');
      });

      it('handles language', () => {
        expect(monthYearFormat(6, 2020)).toEqual('juin 2020');
      });
    });
  });

  describe('dateFormat', () => {
    it('formats day and month as date', () => {
      expect(dateFormat(DateTime.local(2020, 1, 5))).toEqual('Jan 5, 2020');
    });

    it('handles language', () => {
      expect(dateFormat(DateTime.local(2020, 1, 5), 'fr')).toEqual(
        '5 janv. 2020',
      );
    });

    it('handles null case', () => {
      expect(dateFormat(null)).toEqual('');
    });

    describe('default language', () => {
      beforeEach(() => {
        languageMock.mockReturnValue('fr');
      });

      it('handles language', () => {
        expect(dateFormat(DateTime.local(2020, 1, 5))).toEqual('5 janv. 2020');
      });
    });
  });
});
