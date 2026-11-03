import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
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

interface TestComponentProps {
  flows?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({
  flows = twoColumnFlows,
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
          <ContactFlowSetupPage />
        </GqlMockedProvider>
      </TestRouter>
    </ThemeProvider>
  </SnackbarProvider>
);

describe('ContactFlowSetupPage', () => {
  it('renders a setup column for each saved flow column', async () => {
    const { findByDisplayValue, getByDisplayValue, getByText } = render(
      <TestComponent />,
    );

    expect(await findByDisplayValue('UntitledOne')).toBeInTheDocument();
    expect(getByDisplayValue('UntitledTwo')).toBeInTheDocument();
    expect(getByText('Unused Statuses')).toBeInTheDocument();
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
