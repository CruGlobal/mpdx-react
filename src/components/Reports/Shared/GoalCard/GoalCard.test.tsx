import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import theme from 'src/theme';
import { GoalCard, GoalCardProps } from './GoalCard';

const mutationSpy = jest.fn().mockResolvedValue(undefined);

// The info rows have no role, so a row is its label's parent element
const getRow = (label: HTMLElement): HTMLElement => {
  const row = label.parentElement;
  if (!row) {
    throw new Error(`No row found for "${label.textContent}"`);
  }
  return row;
};

const infoRows = [
  { label: 'Goal Amount', valueTestId: 'goal-amount-value' },
  { label: 'Last Updated', valueTestId: 'date-value' },
];

const baseProps: GoalCardProps = {
  name: 'Test Goal',
  goalAmount: 1234.56,
  currency: 'USD',
  updatedAt: '2026-03-15T00:00:00Z',
  viewHref: '/some/view/path',
  onDelete: mutationSpy,
};

const renderCard = (props: Partial<GoalCardProps> = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <GoalCard {...baseProps} {...props} />
    </ThemeProvider>,
  );

describe('GoalCard', () => {
  it('renders the goal name, amount, and last updated date', () => {
    const { getByTestId } = renderCard();

    expect(getByTestId('goal-name')).toHaveTextContent('Test Goal');
    expect(getByTestId('goal-amount-value')).toHaveTextContent('$1,234.56');
    expect(getByTestId('date-value')).toHaveTextContent('March 15');
  });

  it('falls back to "Unnamed Goal" when name is null', () => {
    const { getByTestId } = renderCard({ name: null });

    expect(getByTestId('goal-name')).toHaveTextContent('Unnamed Goal');
  });

  it('shows the full goal name in a tooltip on hover', async () => {
    const longName =
      'A very long goal name that would otherwise stretch the card';
    const { getByTestId, findByRole } = renderCard({ name: longName });

    userEvent.hover(getByTestId('goal-name'));

    expect((await findByRole('tooltip')).textContent).toBe(longName);
  });

  it('shows the unnamed goal fallback in a tooltip on hover', async () => {
    const { getByTestId, findByRole } = renderCard({ name: null });

    userEvent.hover(getByTestId('goal-name'));

    expect((await findByRole('tooltip')).textContent).toBe('Unnamed Goal');
  });

  it('renders the View link with the provided href', () => {
    const { getByRole } = renderCard({ viewHref: '/custom/href' });

    expect(getByRole('link', { name: 'View' })).toHaveAttribute(
      'href',
      '/custom/href',
    );
  });

  it('formats the goal amount in the supplied currency', () => {
    const { getByTestId } = renderCard({ goalAmount: 2500, currency: 'EUR' });

    expect(getByTestId('goal-amount-value')).toHaveTextContent('€2,500');
  });

  it('renders a skeleton in place of the amount when loading', () => {
    const { getByTestId, queryByText } = renderCard({ loading: true });

    expect(
      getByTestId('goal-amount-value').querySelector('.MuiSkeleton-root'),
    ).toBeInTheDocument();
    expect(queryByText('$1,234.56')).not.toBeInTheDocument();
  });

  it('opens the confirmation dialog and calls onDelete when confirmed', () => {
    const { getByRole } = renderCard();

    userEvent.click(getByRole('button', { name: 'Delete' }));
    userEvent.click(getByRole('button', { name: 'Delete Goal' }));

    expect(mutationSpy).toHaveBeenCalledTimes(1);
  });

  it('does not call onDelete when the confirmation is cancelled', () => {
    const { getByRole } = renderCard();

    userEvent.click(getByRole('button', { name: 'Delete' }));
    userEvent.click(getByRole('button', { name: 'Cancel' }));

    expect(mutationSpy).not.toHaveBeenCalled();
  });

  it('renders the badge when provided', () => {
    const { getByText } = renderCard({
      badge: <span>Default</span>,
    });

    expect(getByText('Default')).toBeInTheDocument();
  });

  it('renders without a badge when none is provided', () => {
    const { queryByText } = renderCard();

    expect(queryByText('Default')).not.toBeInTheDocument();
  });

  it('hides the Delete button when onDelete is not provided', () => {
    const { getByRole, queryByRole } = renderCard({ onDelete: undefined });

    expect(queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(getByRole('link', { name: 'View' })).toBeInTheDocument();
  });

  it('does not mount the confirmation dialog when onDelete is not provided', () => {
    const { queryByRole, queryByText } = renderCard({ onDelete: undefined });

    expect(queryByRole('dialog')).not.toBeInTheDocument();
    expect(queryByText('Delete Goal')).not.toBeInTheDocument();
  });

  it('unmounts an open confirmation dialog if onDelete becomes undefined', () => {
    const { getByRole, queryByRole, rerender } = renderCard();

    userEvent.click(getByRole('button', { name: 'Delete' }));
    expect(getByRole('dialog')).toBeInTheDocument();

    rerender(
      <ThemeProvider theme={theme}>
        <GoalCard {...baseProps} onDelete={undefined} />
      </ThemeProvider>,
    );

    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  describe('label and value layout', () => {
    it.each(infoRows)(
      'puts the $label label and its value in the same row',
      ({ label, valueTestId }) => {
        const { getByText, getByTestId } = renderCard();

        const labelElement = getByText(label);
        expect(labelElement.nextElementSibling).toBe(getByTestId(valueTestId));
      },
    );

    it.each(infoRows)(
      'stacks the $label label above its value on phone widths',
      ({ label }) => {
        const { getByText } = renderCard();

        const row = getRow(getByText(label));
        expect(getStyleAtWidth(row, 'display', phoneWidth)).toBe('flex');
        expect(getStyleAtWidth(row, 'flex-direction', phoneWidth)).toBe(
          'column',
        );
      },
    );

    it.each(infoRows)(
      'keeps the $label label beside its value on desktop widths',
      ({ label }) => {
        const { getByText } = renderCard();

        const row = getRow(getByText(label));
        expect(getStyleAtWidth(row, 'display', desktopWidth)).toBe('flex');
        // An unset flex-direction is the CSS default, row
        expect(
          getStyleAtWidth(row, 'flex-direction', desktopWidth) || 'row',
        ).toBe('row');
      },
    );

    it.each(infoRows)(
      'centers the $label label and its value in the card on phone widths',
      ({ label, valueTestId }) => {
        const { getByText, getByTestId } = renderCard();

        const labelElement = getByText(label);
        const row = getRow(labelElement);
        expect({
          alignItems: getStyleAtWidth(row, 'align-items', phoneWidth),
          textAlign: getStyleAtWidth(row, 'text-align', phoneWidth),
          paddingLeft: parseFloat(
            getStyleAtWidth(row, 'padding-left', phoneWidth) || '0',
          ),
        }).toEqual({
          alignItems: 'center',
          textAlign: 'center',
          paddingLeft: 0,
        });
        // No left padding on the label or value pushes either one off center
        [labelElement, getByTestId(valueTestId)].forEach((element) => {
          expect(
            parseFloat(
              getStyleAtWidth(element, 'padding-left', phoneWidth) || '0',
            ),
          ).toBe(0);
        });
      },
    );

    it.each(infoRows)(
      'keeps the $label label and its value left aligned with 16px left padding on desktop widths',
      ({ label }) => {
        const { getByText } = renderCard();

        const row = getRow(getByText(label));
        expect(getStyleAtWidth(row, 'align-items', desktopWidth)).not.toBe(
          'center',
        );
        // An unset text-align is the CSS default, start
        expect(
          getStyleAtWidth(row, 'text-align', desktopWidth) || 'start',
        ).toMatch(/^(start|left)$/);
        expect(getStyleAtWidth(row, 'justify-content', desktopWidth)).toBe(
          'flex-start',
        );
        expect(getStyleAtWidth(row, 'padding-left', desktopWidth)).toBe('16px');
      },
    );
  });

  describe('action buttons', () => {
    it('makes the Delete and View buttons at least 44px tall on phone widths', () => {
      const { getByRole } = renderCard();

      [
        getByRole('button', { name: 'Delete' }),
        getByRole('link', { name: 'View' }),
      ].forEach((button) => {
        expect(
          parseFloat(getStyleAtWidth(button, 'min-height', phoneWidth)),
        ).toBeGreaterThanOrEqual(44);
      });
    });

    it('keeps the default height of the Delete and View buttons on desktop widths', () => {
      const { getByRole } = renderCard();

      [
        getByRole('button', { name: 'Delete' }),
        getByRole('link', { name: 'View' }),
      ].forEach((button) => {
        // '' means no rule sets it, so the button keeps MUI's default
        expect(
          getStyleAtWidth(button, 'min-height', desktopWidth) || 'auto',
        ).toBe('auto');
        expect(getStyleAtWidth(button, 'height', desktopWidth)).toBe('');
      });
    });
  });
});
