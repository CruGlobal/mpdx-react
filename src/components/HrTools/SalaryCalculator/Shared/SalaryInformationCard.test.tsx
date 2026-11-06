import { render, waitFor, within } from '@testing-library/react';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { LandingTestWrapper } from '../Landing/NewSalaryCalculationLanding/LandingTestWrapper';
import { SalaryInformationCard } from './SalaryInformationCard';

const TestComponent: React.FC = () => (
  <LandingTestWrapper hasApprovedCalculation>
    <SalaryInformationCard />
  </LandingTestWrapper>
);

// The box that holds the amount and the View MHA Form link has no role, so it
// is found as the parent element of the link
const getParent = (element: HTMLElement): HTMLElement => {
  const parent = element.parentElement;
  if (!parent) {
    throw new Error(`No parent element for "${element.textContent}"`);
  }
  return parent;
};

// A table cell takes its vertical-align from its row unless it sets its own,
// and browsers center table rows when nothing else is set
const getCellVerticalAlign = (cell: HTMLElement, width: number): string => {
  let element: HTMLElement | null = cell;
  while (element && element.tagName !== 'TABLE') {
    const value = getStyleAtWidth(element, 'vertical-align', width);
    if (value && value !== 'inherit') {
      return value;
    }
    element = element.parentElement;
  }
  return 'middle';
};

const renderMhaRow = async () => {
  const utils = render(<TestComponent />);
  const row = await utils.findByRole('row', { name: /Current MHA/ });
  // The spouse column and the amounts appear once the mocked data loads
  const spouseCell = await within(row).findByRole('cell', {
    name: '$12,000.00',
  });
  const [categoryCell, userCell] = within(row).getAllByRole('cell');
  const link = within(userCell).getByRole('link', { name: 'View MHA Form' });
  return {
    ...utils,
    row,
    categoryCell,
    userCell,
    spouseCell,
    link,
    amountAndLink: getParent(link),
  };
};

describe('SalaryInformationCard', () => {
  it('renders table with proper structure', () => {
    const { getByRole } = render(<TestComponent />);
    const table = getByRole('table');
    expect(table).toBeInTheDocument();
  });

  it('renders card title', () => {
    const { getByRole } = render(<TestComponent />);
    expect(
      getByRole('heading', { name: 'Current Salary Information' }),
    ).toBeInTheDocument();
  });

  it('renders last updated date', async () => {
    const { findByTestId } = render(<TestComponent />);
    expect(await findByTestId('last-updated')).toBeInTheDocument();
  });

  it('renders category column headers and salary category names', async () => {
    const { getByRole } = render(<TestComponent />);

    await waitFor(() =>
      expect(getByRole('table')).toHaveTableStructure({
        columnHeaders: ['Category', 'John', 'Jane'],
        cells: [
          ['Maximum Allowable Salary', '$60,000.00', '$70,000.00'],
          ['Requested Salary', '$50,000.00', '$60,000.00'],
          ['Tax-deferred 403(b) Contribution', '5%', '6%'],
          ['Roth 403(b) Contribution', '12%', '10%'],
          ['Security (SECA/FICA) Status', 'Subject to SECA', 'Subject to SECA'],
          ['Current Gross Salary', '$55,000.00', '$10,000.00'],
          [
            'Current MHA (Included in Current Gross Salary)',
            '$10,000.00View MHA Form',
            '$12,000.00',
          ],
        ],
      }),
    );
  });

  it('renders the View link for MHA category', () => {
    const { getByRole } = render(<TestComponent />);
    expect(getByRole('link', { name: 'View MHA Form' })).toHaveAttribute(
      'href',
      expect.stringContaining('/hrTools/mhaCalculator'),
    );
  });

  it('renders card header with avatar', () => {
    const { container } = render(<TestComponent />);
    expect(container.querySelector('.MuiAvatar-root')).toBeInTheDocument();
  });

  describe('View MHA Form link in the Current MHA row', () => {
    it('shows the link with the amount in the first person column, not the spouse column', async () => {
      const { spouseCell, link, amountAndLink } = await renderMhaRow();

      expect(link).toHaveAttribute(
        'href',
        '/accountLists/account-list-1/hrTools/mhaCalculator',
      );
      expect(amountAndLink).toHaveTextContent(/^\$10,000\.00View MHA Form$/);
      expect(spouseCell).toHaveTextContent('$12,000.00');
      expect(within(spouseCell).queryByRole('link')).not.toBeInTheDocument();
    });

    it('lets the link drop to its own line under the amount on phone widths', async () => {
      const { link, amountAndLink } = await renderMhaRow();

      // jsdom has no layout, so it can only show that the link is allowed to
      // wrap under the amount, not where the wrap actually happens
      expect(getStyleAtWidth(amountAndLink, 'display', phoneWidth)).toBe(
        'flex',
      );
      expect(getStyleAtWidth(amountAndLink, 'flex-wrap', phoneWidth)).toBe(
        'wrap',
      );
      // The link text itself must be able to wrap inside the cell instead of
      // running into the next column
      expect(getStyleAtWidth(link, 'white-space', phoneWidth)).not.toBe(
        'nowrap',
      );
    });

    it('narrows the table cell side padding on phone widths', async () => {
      const { userCell, spouseCell } = await renderMhaRow();

      [userCell, spouseCell].forEach((cell) => {
        expect(
          parseFloat(getStyleAtWidth(cell, 'padding-inline', phoneWidth)),
        ).toBeLessThan(16);
      });
    });

    it('keeps the link beside the amount on desktop widths', async () => {
      const { amountAndLink } = await renderMhaRow();

      expect(getStyleAtWidth(amountAndLink, 'display', desktopWidth)).toBe(
        'flex',
      );
      // An unset flex-direction is the CSS default, row
      expect(
        getStyleAtWidth(amountAndLink, 'flex-direction', desktopWidth) || 'row',
      ).toBe('row');
      expect(getStyleAtWidth(amountAndLink, 'align-items', desktopWidth)).toBe(
        'center',
      );
    });

    // The link can wrap under the amount whenever the column is narrow, so the
    // first person's amount has to stay level with the spouse's amount even
    // when that cell is taller than the others. Top and baseline alignment
    // both line up the first line of every cell; centering does not.
    it.each([
      ['phone', phoneWidth],
      ['desktop', desktopWidth],
    ])(
      'lines up the first line of each Current MHA cell on %s widths',
      async (_, width) => {
        const { categoryCell, userCell, spouseCell } = await renderMhaRow();

        const alignments = [categoryCell, userCell, spouseCell].map((cell) =>
          getCellVerticalAlign(cell, width),
        );
        expect(alignments[0]).toMatch(/^(top|baseline)$/);
        expect(alignments).toEqual([
          alignments[0],
          alignments[0],
          alignments[0],
        ]);
      },
    );

    // Rows with an info icon are taller than one line of text, and centering
    // is what keeps their label level with the amounts
    it.each([
      ['phone', phoneWidth],
      ['desktop', desktopWidth],
    ])('keeps the other rows centered on %s widths', async (_, width) => {
      const { row: mhaRow, getAllByRole } = await renderMhaRow();

      const otherRows = getAllByRole('row').filter(
        (row) => row !== mhaRow && within(row).queryAllByRole('cell').length,
      );
      expect(otherRows).toHaveLength(6);
      otherRows.forEach((row) => {
        within(row)
          .getAllByRole('cell')
          .forEach((cell) => {
            expect(getCellVerticalAlign(cell, width)).toBe('middle');
          });
      });
    });

    it('keeps the table cell padding on desktop widths', async () => {
      const { userCell, spouseCell } = await renderMhaRow();

      [userCell, spouseCell].forEach((cell) => {
        expect(getStyleAtWidth(cell, 'padding', desktopWidth)).toBe('16px');
        // No narrower side padding may leak in from a phone-only rule
        ['padding-inline', 'padding-left', 'padding-right'].forEach(
          (property) => {
            expect(getStyleAtWidth(cell, property, desktopWidth)).toBe('');
          },
        );
      });
    });
  });
});
