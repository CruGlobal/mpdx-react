import { render } from '@testing-library/react';

const TestTable: React.FC = () => (
  <table>
    <thead>
      <tr>
        <th scope="col">Category</th>
        <th scope="col">John</th>
        <th scope="col">Jane</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Salary</th>
        <td>$10,001.00</td>
        <td>$20,001.00</td>
      </tr>
      <tr>
        <th scope="row">MHA</th>
        <td>$10,002.00</td>
        <td>$20,002.00</td>
      </tr>
    </tbody>
  </table>
);

describe('toHaveTableStructure', () => {
  it('matches the full table structure', () => {
    const { getByRole } = render(<TestTable />);

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders: ['Category', 'John', 'Jane'],
      rowHeaders: ['Salary', 'MHA'],
      cells: ['$10,001.00', '$20,001.00', '$10,002.00', '$20,002.00'],
    });
  });

  it('matches 2-dimensional arrays of cells', () => {
    const { getByRole } = render(<TestTable />);

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders: [['Category'], ['John', 'Jane']],
      cells: [
        ['$10,001.00', '$20,001.00'],
        ['$10,002.00', '$20,002.00'],
      ],
    });
  });

  it('matches when only some structure properties are provided', () => {
    const { getByRole } = render(<TestTable />);

    expect(getByRole('table')).toHaveTableStructure({
      rowHeaders: ['Salary', 'MHA'],
    });
  });

  it('supports asymmetric matchers', () => {
    const { getByRole } = render(<TestTable />);

    expect(getByRole('table')).toHaveTableStructure({
      columnHeaders: ['Category', expect.stringContaining('Jo'), 'Jane'],
      rowHeaders: [expect.stringContaining('Sal'), 'MHA'],
      cells: [
        [expect.stringContaining('10,001'), '$20,001.00'],
        ['$10,002.00', '$20,002.00'],
      ],
    });
  });

  it('does not match cells in a different order', () => {
    const { getByRole } = render(<TestTable />);

    expect(getByRole('table')).not.toHaveTableStructure({
      cells: [
        ['$20,001.00', '$10,001.00'],
        ['$20,002.00', '$10,002.00'],
      ],
    });
  });

  it('does not match missing or extra structure', () => {
    const { getByRole } = render(<TestTable />);

    expect(getByRole('table')).not.toHaveTableStructure({
      columnHeaders: ['Category', 'John'],
    });
    expect(getByRole('table')).not.toHaveTableStructure({
      rowHeaders: ['Salary', 'MHA', 'Total'],
    });
  });

  it('matches an empty table', () => {
    const { getByRole } = render(
      <table>
        <tbody></tbody>
      </table>,
    );

    expect(getByRole('table')).toHaveTableStructure({
      cells: [],
      columnHeaders: [],
      rowHeaders: [],
    });
  });

  it('throws when no structure properties are provided', () => {
    const { getByRole } = render(<TestTable />);

    expect(() => expect(getByRole('table')).toHaveTableStructure({})).toThrow(
      'toHaveTableStructure requires at least one of cells, columnHeaders, or rowHeaders',
    );
  });

  it('describes the mismatched properties in the failure message', () => {
    const { getByRole } = render(<TestTable />);

    expect(() =>
      expect(getByRole('table')).toHaveTableStructure({
        columnHeaders: ['Category', 'John'],
        rowHeaders: ['Salary', 'MHA'],
      }),
    ).toThrow(
      /Expected table to match the expected structure[\s\S]*columnHeaders:[\s\S]*Expected columnHeaders[\s\S]*Received columnHeaders/,
    );
  });

  it('explains the failure when the table unexpectedly matches', () => {
    const { getByRole } = render(<TestTable />);

    expect(() =>
      expect(getByRole('table')).not.toHaveTableStructure({
        rowHeaders: ['Salary', 'MHA'],
      }),
    ).toThrow('Expected table not to match the expected structure');
  });

  it('only inspects the received table', () => {
    const { getAllByRole } = render(
      <>
        <TestTable />
        <table>
          <tbody>
            <tr>
              <td>Other table</td>
            </tr>
          </tbody>
        </table>
      </>,
    );

    const [, otherTable] = getAllByRole('table');
    expect(otherTable).toHaveTableStructure({
      cells: ['Other table'],
      columnHeaders: [],
      rowHeaders: [],
    });
  });
});
