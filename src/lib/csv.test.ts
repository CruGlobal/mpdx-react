import { csvFromUri } from '__tests__/util/csvFromUri';
import { buildCsvUri, escapeCsvCell } from './csv';

describe('escapeCsvCell', () => {
  it('doubles quotes inside text', () => {
    expect(escapeCsvCell('Robert "Bob" Smith')).toBe('Robert ""Bob"" Smith');
  });

  it.each(['=SUM(A1)', '+1+1', '-2+3', '@SUM(A1)', '\t=1', '\r=1'])(
    'puts a quote mark before text that starts like a formula: %p',
    (cell) => {
      expect(escapeCsvCell(cell)).toBe(`'${cell}`);
    },
  );

  it('escapes quotes in a formula-like cell too', () => {
    expect(escapeCsvCell('=HYPERLINK("x")')).toBe(`'=HYPERLINK(""x"")`);
  });

  it('leaves text with a formula character later on alone', () => {
    expect(escapeCsvCell('A = B')).toBe('A = B');
    expect(escapeCsvCell('Jan 26 - Apr 26')).toBe('Jan 26 - Apr 26');
  });

  it('leaves numbers and blanks alone so negative amounts stay numbers', () => {
    expect(escapeCsvCell(-850)).toBe(-850);
    expect(escapeCsvCell(0)).toBe(0);
    expect(escapeCsvCell('')).toBe('');
    expect(escapeCsvCell(null)).toBeNull();
    expect(escapeCsvCell(undefined)).toBeUndefined();
  });
});

describe('buildCsvUri', () => {
  it('writes each cell whole, with quotes, commas and formulas made safe', () => {
    const csv = csvFromUri(
      buildCsvUri([
        ['Name', 'Note', 'Amount'],
        ['Smith, Robert "Bob"', '=SUM(A1)', -850],
      ]),
    );

    expect(csv).toBe(
      '"Name","Note","Amount"\n"Smith, Robert ""Bob""","\'=SUM(A1)","-850"',
    );
  });
});
