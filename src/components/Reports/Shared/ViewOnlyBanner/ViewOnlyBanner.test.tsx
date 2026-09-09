import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import TestRouter from '__tests__/util/TestRouter';
import theme from 'src/theme';
import { ViewOnlyBanner } from './ViewOnlyBanner';

const reportName = 'MPGA';
const accountListId = 'account-list-1';
const router = { query: { accountListId }, isReady: true };

interface TestComponentProps {
  staffName?: string;
}

const TestComponent: React.FC<TestComponentProps> = ({ staffName }) => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <ViewOnlyBanner staffName={staffName} reportName={reportName} />
    </TestRouter>
  </ThemeProvider>
);

describe('ViewOnlyBanner', () => {
  it('names the staff member being viewed', () => {
    const { getByText } = render(<TestComponent staffName="Jane Doe" />);

    expect(
      getByText("Currently viewing Jane Doe's MPGA report · read only."),
    ).toBeInTheDocument();
  });

  it('falls back to a generic message before the name loads', () => {
    const { getByText } = render(<TestComponent />);

    expect(
      getByText(
        "You are viewing another staff member's MPGA report · read only.",
      ),
    ).toBeInTheDocument();
  });

  it('links back to the MPD Supervisor Report', () => {
    const { getByRole } = render(<TestComponent staffName="Jane Doe" />);

    expect(
      getByRole('link', { name: 'Back to MPD Supervisor Report' }),
    ).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/hrTools/mpdSupervisorReport`,
    );
  });
});
