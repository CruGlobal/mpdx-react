import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  desktopWidth,
  getStyleAtWidth,
  phoneWidth,
} from '__tests__/util/styleAtWidth';
import { AppealsWrapper } from 'pages/accountLists/[accountListId]/tools/appeals/AppealsWrapper';
import theme from 'src/theme';
import { appealInfo } from '../../appealMockData';
import { AppealHeaderInfo, AppealHeaderInfoProps } from './AppealHeaderInfo';

// MUI's sm breakpoint, where the progress bar moves up next to the name
const smWidth = theme.breakpoints.values.sm;

const router = {
  query: { accountListId: 'aaa' },
  isReady: true,
};

const Components = ({ appealInfo, loading }: AppealHeaderInfoProps) => (
  <LocalizationProvider dateAdapter={AdapterLuxon}>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider>
            <AppealsWrapper>
              <AppealHeaderInfo appealInfo={appealInfo} loading={loading} />
            </AppealsWrapper>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>
    </ThemeProvider>
  </LocalizationProvider>
);

describe('AppealHeaderInfo', () => {
  it('renders skeletons when loading', () => {
    const { getByTestId, getByRole } = render(
      <Components appealInfo={appealInfo} loading={true} />,
    );

    expect(getByRole('heading', { name: 'Name:' })).toBeInTheDocument();
    expect(getByTestId('appeal-name-skeleton')).toBeInTheDocument();

    expect(getByRole('heading', { name: 'Goal:' })).toBeInTheDocument();
    expect(getByTestId('appeal-goal-skeleton')).toBeInTheDocument();
  });

  it('renders appeal info', async () => {
    const { getByText, getAllByText, findByText } = render(
      <Components appealInfo={appealInfo} loading={false} />,
    );

    expect(await findByText('Test Appeal')).toBeInTheDocument();

    expect(getByText('$100')).toBeInTheDocument();
    expect(getByText(/\$50 \(50%\)/i)).toBeInTheDocument();
    expect(getAllByText(/\$25 \(25%\)/i).length).toBe(2);
  });

  it('renders amount when goal is 0 info', async () => {
    const { getByText, findByText } = render(
      <Components appealInfo={{ ...appealInfo, amount: 0 }} loading={false} />,
    );

    expect(await findByText('Test Appeal')).toBeInTheDocument();

    expect(getByText('$0')).toBeInTheDocument();
  });

  it('should allow user to open the edit appeal info modal', async () => {
    const { findByText, findByRole, getByTestId, getByRole, queryByRole } =
      render(<Components appealInfo={appealInfo} loading={false} />);

    expect(await findByText('Test Appeal')).toBeInTheDocument();

    userEvent.click(getByTestId('edit-appeal-name'));

    expect(
      await findByRole('heading', { name: 'Edit Appeal' }),
    ).toBeInTheDocument();

    userEvent.click(getByTestId('edit-appeal-goal'));

    expect(
      await findByRole('heading', { name: 'Edit Appeal' }),
    ).toBeInTheDocument();

    userEvent.click(getByRole('button', { name: 'Close' }));

    await waitFor(() => {
      expect(
        queryByRole('heading', { name: 'Edit Appeal' }),
      ).not.toBeInTheDocument();
    });
  });

  describe('long appeal names', () => {
    const longName =
      'Year-end giving campaign for the new ministry center building fund and summer staff support';

    it.each([
      { width: phoneWidth, minHeight: '144px' },
      { width: smWidth, minHeight: '72px' },
      { width: desktopWidth, minHeight: '72px' },
    ])(
      'header is at least $minHeight tall but can grow at $width px',
      async ({ width, minHeight }) => {
        const { findByText } = render(
          <Components
            appealInfo={{ ...appealInfo, name: longName }}
            loading={false}
          />,
        );

        const header = (await findByText(longName)).closest(
          '.MuiGrid-container',
        );
        expect(header).not.toBeNull();
        expect(getStyleAtWidth(header!, 'min-height', width)).toBe(minHeight);
        expect(getStyleAtWidth(header!, 'height', width)).toBe('');
      },
    );

    it('limits the name to 2 lines and keeps the full name in a tooltip', async () => {
      const { findByText } = render(
        <Components
          appealInfo={{ ...appealInfo, name: longName }}
          loading={false}
        />,
      );

      const name = await findByText(longName);
      expect(name).toHaveAttribute('title', longName);
      expect(getStyleAtWidth(name, '-webkit-line-clamp', phoneWidth)).toBe('2');
      expect(getStyleAtWidth(name, 'overflow', phoneWidth)).toBe('hidden');
    });
  });
});
