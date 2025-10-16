import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetContactDuplicatesQuery } from 'src/components/Tool/MergeContacts/GetContactDuplicates.generated';
import { getContactDuplicatesMocks } from 'src/components/Tool/MergeContacts/MergeContactsMock';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import MergeContactsPage from './[[...contactId]].page';

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
    '/accountLists/[accountListId]/tools/merge/contacts/[[...contactId]]',
  query: { accountListId },
  isReady: true,
};
const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        GetContactDuplicates: GetContactDuplicatesQuery;
      }>
        mocks={{
          ...getContactDuplicatesMocks,
        }}
      >
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>
            <MergeContactsPage />
          </SnackbarProvider>
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('MergeContactsPage', () => {
  it('should render contact link correctly', async () => {
    const { findByRole } = render(<Components />);

    const contactName = await findByRole('link', {
      name: 'Doe, John',
    });

    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/merge/contacts/contact-1`,
    );
  });
});
