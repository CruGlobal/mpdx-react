import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetInvalidPhoneNumbersMocks } from 'src/components/Tool/FixPhoneNumbers/FixPhoneNumbersMocks';
import { GetInvalidPhoneNumbersQuery } from 'src/components/Tool/FixPhoneNumbers/GetInvalidPhoneNumbers.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FixPhoneNumbersPage from './[[...contactId]].page';

jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: jest.fn(),
    };
  },
}));
const accountListId = 'account-list-1';
const router = {
  pathname:
    '/accountLists/[accountListId]/tools/fix/phoneNumbers/[[...contactId]]',
  query: { accountListId },
  isReady: true,
};
const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <I18nextProvider i18n={i18n}>
        <SnackbarProvider>
          <GqlMockedProvider<{
            GetInvalidPhoneNumbers: GetInvalidPhoneNumbersQuery;
          }>
            mocks={GetInvalidPhoneNumbersMocks}
          >
            <FixPhoneNumbersPage />
          </GqlMockedProvider>
        </SnackbarProvider>
      </I18nextProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('FixPhoneNumbersPage', () => {
  it('should render contact link correctly with donations tab', async () => {
    const { findByRole } = render(<Components />);

    const contactName = await findByRole('link', {
      name: 'Test Contact',
    });

    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/fix/phoneNumbers/testid`,
    );
  });
});
