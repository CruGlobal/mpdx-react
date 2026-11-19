import { csvFromUri } from '__tests__/util/csvFromUri';
import { buildCsvUri, escapeCsvCell } from './csv';

describe('escapeCsvCell', () => {
  it('doubles quotes inside text', () => {
    expect(escapeCsvCell('Robert "Bob" Smith')).toBe('Robert ""Bob"" Smith');
  });

  it.each([
    '=SUM(A1)',
    '+1+1',
    '-2+3',
    '@SUM(A1)',
    '\t=1',
    '\r=1',
    '\t5',
    '\r5',
  ])('puts a quote mark before text that starts like a formula: %p', (cell) => {
    expect(escapeCsvCell(cell)).toBe(`'${cell}`);
  });

  it('escapes quotes in a formula-like cell too', () => {
    expect(escapeCsvCell('=HYPERLINK("x")')).toBe(`'=HYPERLINK(""x"")`);
  });

  it('leaves text with a formula character later on alone', () => {
    expect(escapeCsvCell('A = B')).toBe('A = B');
    expect(escapeCsvCell('Jan 26 - Apr 26')).toBe('Jan 26 - Apr 26');
  });

  it.each([
    '-125.5',
    '-$50.00',
    '+1,200',
    '-12%',
    '-1 234,56 €',
    '-1\u202F234,56\u00A0€',
    '-',
  ])(
    'leaves text that is only an amount alone so it stays a number: %p',
    (cell) => {
      expect(escapeCsvCell(cell)).toBe(cell);
    },
  );

  it('still guards an amount-like start that holds a formula', () => {
    expect(escapeCsvCell('-1+1')).toBe(`'-1+1`);
    expect(escapeCsvCell('-$5 cmd|x')).toBe(`'-$5 cmd|x`);
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
