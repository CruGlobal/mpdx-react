import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { I18nextProvider } from 'react-i18next';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { GetPersonDuplicatesQuery } from 'src/components/Tool/MergePeople/GetPersonDuplicates.generated';
import { getPersonDuplicatesMocks } from 'src/components/Tool/MergePeople/PersonDuplicatesMock';
import i18n from 'src/lib/i18n';
import theme from 'src/theme';
import MergePeoplePage from './[[...contactId]].page';

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
  pathname: '/accountLists/[accountListId]/tools/merge/people/[[...contactId]]',
  query: { accountListId },
  isReady: true,
};
const Components = () => (
  <ThemeProvider theme={theme}>
    <TestRouter router={router}>
      <GqlMockedProvider<{
        GetPersonDuplicates: GetPersonDuplicatesQuery;
      }>
        mocks={getPersonDuplicatesMocks}
      >
        <I18nextProvider i18n={i18n}>
          <SnackbarProvider>
            <MergePeoplePage />
          </SnackbarProvider>
        </I18nextProvider>
      </GqlMockedProvider>
    </TestRouter>
  </ThemeProvider>
);

describe('MergePeoplePage', () => {
  it('should render contact link correctly', async () => {
    const { findByRole } = render(<Components />);

    const contactName = await findByRole('link', {
      name: 'John Doe',
    });

    expect(contactName).toHaveAttribute(
      'href',
      `/accountLists/${accountListId}/tools/merge/people/contact-1`,
    );
  });
});
