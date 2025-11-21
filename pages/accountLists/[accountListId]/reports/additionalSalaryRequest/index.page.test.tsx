import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from 'src/theme';
import AdditionalSalaryRequestPage, { getServerSideProps } from './index.page';

const TestComponent: React.FC = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={{ query: { accountListId: 'account-list-1' } }}>
      <GqlMockedProvider>
        <AdditionalSalaryRequestPage />
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('AdditionalSalaryRequest page', () => {
  it('renders page', async () => {
    const { findByRole } = render(<TestComponent />);

    expect(
      await findByRole('heading', { name: 'About this Form' }),
    ).toBeInTheDocument();
  });

  it('toggles side panel on header click', async () => {
    const { findByTestId, getByRole, getByTestId } = render(<TestComponent />);

    const leftPanel = getByTestId('SidePanelsLayoutLeftPanel');

    userEvent.click(getByRole('button', { name: 'Toggle Navigation Panel' }));
    expect(leftPanel).toHaveStyle('transform: none');

    userEvent.click(await findByTestId('CloseIcon'));
    expect(leftPanel).toHaveStyle('transform: translate(-100%)');
  });

  it('uses ensureSessionAndAccountList', () => {
    expect(getServerSideProps).toBeDefined();
  });
});
