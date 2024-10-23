import { useRouter } from 'next/router';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { getSession } from 'next-auth/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetInvalidPhoneNumbersMocks } from 'src/components/Tool/FixPhoneNumbers/FixPhoneNumbersMocks';
import { GetInvalidPhoneNumbersQuery } from 'src/components/Tool/FixPhoneNumbers/GetInvalidPhoneNumbers.generated';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import FixPhoneNumbersPage from './[[...contactId]].page';

jest.mock('next-auth/react');
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));
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
const pushFn = jest.fn();
const accountListId = 'account-list-1';
const session = {
  expires: '2021-10-28T14:48:20.897Z',
  user: {
    email: 'Chair Library Bed',
    image: null,
    name: 'Dung Tapestry',
    token: 'superLongJwtString',
  },
};
const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter>
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
  beforeEach(() => {
    (getSession as jest.Mock).mockResolvedValue(session);
    (useRouter as jest.Mock).mockReturnValue({
      query: {
        accountListId,
      },
      isReady: true,
      push: pushFn,
    });
  });

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
