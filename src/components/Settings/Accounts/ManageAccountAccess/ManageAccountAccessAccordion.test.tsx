import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { ManageAccountAccessAccordion } from './ManageAccountAccessAccordion';

jest.mock('next-auth/react');

const accountListId = 'account-list-1';
const contactId = 'contact-1';
const router = {
  query: { accountListId, contactId: [contactId] },
  isReady: true,
};

const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...jest.requireActual('notistack'),
  useSnackbar: () => {
    return {
      enqueueSnackbar: mockEnqueue,
    };
  },
}));

const handleAccordionChange = jest.fn();

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ManageAccountAccessAccordion', () => {
  it('should render accordion closed', async () => {
    const { queryByText } = render(
      <Components>
        <GqlMockedProvider>
          <ManageAccountAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={''}
          />
        </GqlMockedProvider>
        ,
      </Components>,
    );
    expect(
      queryByText('Share this ministry account with other team members'),
    ).toBeNull();
  });
  it('should render accordion open', async () => {
    const { getByText } = render(
      <Components>
        <GqlMockedProvider>
          <ManageAccountAccessAccordion
            handleAccordionChange={handleAccordionChange}
            expandedPanel={'Manage Account Access'}
          />
        </GqlMockedProvider>
        ,
      </Components>,
    );
    expect(
      getByText('Share this ministry account with other team members'),
    ).toBeVisible();
  });
});
