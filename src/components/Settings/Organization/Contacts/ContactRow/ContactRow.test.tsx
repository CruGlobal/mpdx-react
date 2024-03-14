import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import { ContactsMocks } from '../contactsMocks';
import { ContactRow } from './ContactRow';

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
const contact = new ContactsMocks().contact;

const Components = ({ children }: PropsWithChildren) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </TestRouter>
  </SnackbarProvider>
);

describe('ContactRow', () => {
  it('should show details', () => {
    const { getByText } = render(
      <Components>
        <GqlMockedProvider>
          <ContactRow contact={contact} selectedOrganizationName="Cru" />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getByText('Lastname, Firstnames')).toBeInTheDocument();
    expect(getByText('firstName lastName')).toBeInTheDocument();
    expect(getByText('test@cru.org')).toBeInTheDocument();
    expect(getByText('(111) 222-3333')).toBeInTheDocument();

    expect(
      getByText('accountListFirstName accountListLastName'),
    ).toBeInTheDocument();
    expect(
      getByText('accountListFirstName2 accountListLastName2'),
    ).toBeInTheDocument();
  });

  it('should only show primary address', () => {
    const { getByText, queryByText } = render(
      <Components>
        <GqlMockedProvider>
          <ContactRow contact={contact} selectedOrganizationName="Cru" />
        </GqlMockedProvider>
      </Components>,
    );
    expect(getByText('111 test, city, GA, 11111')).toBeInTheDocument();
    expect(queryByText('222 test, city, FL, 22222')).not.toBeInTheDocument();
  });

  it('should handle Anonymize', async () => {
    const mutationSpy = jest.fn();
    const { getByText } = render(
      <Components>
        <GqlMockedProvider onCall={mutationSpy}>
          <ContactRow
            contact={{
              ...contact,
              allowDeletion: false,
            }}
            selectedOrganizationName="Cru"
          />
        </GqlMockedProvider>
      </Components>,
    );
    userEvent.click(getByText('Anonymize'));

    await waitFor(() => {
      expect(getByText('Confirm')).toBeInTheDocument();
      expect(
        getByText(
          'Are you sure you want to anonymize {{name}} in {{accountList}}?',
        ),
      ).toBeInTheDocument();
    });

    userEvent.click(getByText('Yes'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Contact successfully anonymized',
        {
          variant: 'success',
        },
      );
    });
    expect(mutationSpy.mock.calls[0][0].operation.operationName).toEqual(
      'AnonymizeContact',
    );
    expect(mutationSpy.mock.calls[0][0].operation.variables.input).toEqual({
      contactId: '2f5d998f',
    });
  });
});
