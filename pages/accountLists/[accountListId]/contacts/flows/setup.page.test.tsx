import React, { Profiler } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, within } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { UserOptionQuery } from 'src/hooks/UserPreference.generated';
import theme from 'src/theme';
import ContactFlowSetupPage from './setup.page';

const accountListId = 'account-list-1';
const scrollHintText = 'Scroll sideways to see more columns.';

const router = {
  query: { accountListId },
  pathname: '/accountLists/[accountListId]/contacts/flows/setup',
  isReady: true,
};

const twoColumnFlows =
  '[{"name":"UntitledOne","id":"6ced166a-d570-4086-af56-e3eeed8a1f98","statuses":["Appointment Scheduled","Not Interested"],"color":"color-text"},{"name":"UntitledTwo","id":"8a6bc2ed-820e-437b-81b8-36fbbe91f5e3","statuses":["Partner - Pray","Never Ask","Partner - Financial"],"color":"color-info"}]';

const oneColumnFlows =
  '[{"name":"UntitledOne","id":"6ced166a-d570-4086-af56-e3eeed8a1f98","statuses":["Appointment Scheduled","Not Interested"],"color":"color-text"}]';

const unusedStatusesTitle = 'Unused Statuses';

interface TestComponentProps {
  flows?: string;
  onCommit?: () => void;
}

const TestComponent: React.FC<TestComponentProps> = ({
  flows = twoColumnFlows,
  onCommit = () => {},
}) => (
  <SnackbarProvider>
    <ThemeProvider theme={theme}>
      <TestRouter router={router}>
        <GqlMockedProvider<{ UserOption: UserOptionQuery }>
          mocks={{
            UserOption: {
              userOption: { key: 'flows', value: flows },
            },
          }}
        >
          <Profiler id="ContactFlowSetupPage" onRender={onCommit}>
            <ContactFlowSetupPage />
          </Profiler>
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

// A flow column's name, or "Unused Statuses" for the unused statuses column
const getColumnName = (column: Element): string =>
  column.querySelector<HTMLInputElement>('[data-testid="column-title"]')
    ?.value ??
  (within(column as HTMLElement).queryByText(unusedStatusesTitle)
    ? unusedStatusesTitle
    : '');

/**
 * Collects the name of the board's first column after every React commit.
 * Profiler's onRender runs right after React updates the DOM and before
 * effects run, so this sees what the browser would paint on each frame,
 * including the very first one.
 */
const trackFirstColumns = () => {
  const firstColumns: string[] = [];
  const onCommit = () => {
    const firstColumn = document.querySelector(
      '[data-testid="flowsSetupBoard"]',
    )?.firstElementChild;
    if (firstColumn) {
      firstColumns.push(getColumnName(firstColumn));
    }
  };
  return { firstColumns, onCommit };
};

describe('ContactFlowSetupPage', () => {
  it('renders a setup column for each saved flow column', async () => {
    const { findByDisplayValue, getByDisplayValue, getByText } = render(
      <TestComponent />,
    );

    expect(await findByDisplayValue('UntitledOne')).toBeInTheDocument();
    expect(getByDisplayValue('UntitledTwo')).toBeInTheDocument();
    expect(getByText('Unused Statuses')).toBeInTheDocument();
  });

  // On phones the board snaps to columns. If the board ever shows with
  // Unused Statuses as its first column, the browser stays snapped to it when
  // the flow columns appear in front of it, so the board opens scrolled all
  // the way to the right.
  describe('opening on the first flow column', () => {
    it('never shows Unused Statuses as the first column while saved flows load', async () => {
      const { firstColumns, onCommit } = trackFirstColumns();
      const { findByDisplayValue, getByTestId } = render(
        <TestComponent onCommit={onCommit} />,
      );

      expect(await findByDisplayValue('UntitledTwo')).toBeInTheDocument();
      expect(firstColumns.length).toBeGreaterThan(0);
      expect(firstColumns).not.toContain(unusedStatusesTitle);

      const columns = Array.from(getByTestId('flowsSetupBoard').children);
      expect(columns.map(getColumnName)).toEqual([
        'UntitledOne',
        'UntitledTwo',
        unusedStatusesTitle,
      ]);
    });

    it('never shows Unused Statuses as the first column when there are no saved flows', async () => {
      const { firstColumns, onCommit } = trackFirstColumns();
      const { findAllByTestId, getByTestId } = render(
        <TestComponent flows="[]" onCommit={onCommit} />,
      );

      // The default flow columns fill the board
      expect((await findAllByTestId('column-title')).length).toBeGreaterThan(1);
      expect(firstColumns.length).toBeGreaterThan(0);
      expect(firstColumns).not.toContain(unusedStatusesTitle);

      const columnNames = Array.from(
        getByTestId('flowsSetupBoard').children,
      ).map(getColumnName);
      expect(columnNames[0]).not.toBe(unusedStatusesTitle);
      expect(columnNames[0]).not.toBe('');
      expect(columnNames[columnNames.length - 1]).toBe(unusedStatusesTitle);
    });
  });

  describe('sideways scroll cue', () => {
    it('shows the scroll hint', async () => {
      const { findByDisplayValue, getByText } = render(<TestComponent />);

      expect(await findByDisplayValue('UntitledTwo')).toBeInTheDocument();
      expect(getByText(scrollHintText)).toBeInTheDocument();
    });

    it('shows the scroll hint with one flow column because the unused statuses column is next to it', async () => {
      const { findByDisplayValue, getByText } = render(
        <TestComponent flows={oneColumnFlows} />,
      );

      expect(await findByDisplayValue('UntitledOne')).toBeInTheDocument();
      expect(getByText('Unused Statuses')).toBeInTheDocument();
      expect(getByText(scrollHintText)).toBeInTheDocument();
    });

    it('snaps the board one column at a time on phones', async () => {
      const { findByDisplayValue, getByTestId } = render(<TestComponent />);

      expect(await findByDisplayValue('UntitledTwo')).toBeInTheDocument();
      const board = getByTestId('flowsSetupBoard');
      expect(getStyleAtWidth(board, 'scroll-snap-type', phoneWidth)).toBe(
        'x mandatory',
      );

      // Two flow columns plus the Unused Statuses column
      const columns = Array.from(board.children);
      expect(columns).toHaveLength(3);
      columns.forEach((column) =>
        expect(getStyleAtWidth(column, 'scroll-snap-align', phoneWidth)).toBe(
          'start',
        ),
      );
    });

    it('does not snap the board on desktop', async () => {
      const { findByDisplayValue, getByTestId } = render(<TestComponent />);

      expect(await findByDisplayValue('UntitledTwo')).toBeInTheDocument();
      const board = getByTestId('flowsSetupBoard');
      // An unset scroll-snap-type falls back to its initial value, none
      expect(
        getStyleAtWidth(board, 'scroll-snap-type', desktopWidth) || 'none',
      ).toBe('none');
    });
  });
});
