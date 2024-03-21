import React from 'react';
import { cloneDeep } from '@apollo/client/utilities';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApolloErgonoMockMap } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import { DeepPartial } from 'ts-essentials';
import { ContactsWrapper } from 'pages/accountLists/[accountListId]/contacts/ContactsWrapper';
import TestRouter from '../../../../../__tests__/util/TestRouter';
import { GqlMockedProvider } from '../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../theme';
import { ContactDetailProvider } from '../ContactDetailContext';
import { ContactDetailsTab } from './ContactDetailsTab';
import { ContactDetailsTabQuery } from './ContactDetailsTab.generated';

const accountListId = '111';
const contactId = 'contact-1';
const router = {
  query: { searchTerm: undefined, accountListId },
  push: jest.fn(),
};
const onContactSelected = jest.fn();

const dates = {
  anniversaryDay: 1,
  anniversaryMonth: 1,
  anniversaryYear: 1980,
  birthdayDay: 1,
  birthdayMonth: 1,
  birthdayYear: 1950,
};

const primaryPerson = {
  id: 'person-1',
  firstName: 'Test',
  lastName: 'Person',
  primaryPhoneNumber: { number: '555-555-5555' },
  primaryEmailAddress: {
    email: 'testperson@fake.com',
  },
  ...dates,
};

interface Mocks {
  ContactDetailsTab: ContactDetailsTabQuery;
}
const mocks: DeepPartial<Mocks> = {
  ContactDetailsTab: {
    contact: {
      id: contactId,
      name: 'Person, Test',
      addresses: {
        nodes: [
          {
            id: '123',
            street: '123 Sesame Street',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'USA',
            primaryMailingAddress: true,
            historic: true,
          },
          {
            id: '321',
            street: '4321 Sesame Street',
            city: 'Florida',
            state: 'FL',
            postalCode: '10001',
            country: 'USA',
            primaryMailingAddress: false,
            historic: false,
          },
        ],
      },
      tagList: ['tag1', 'tag2', 'tag3'],
      people: {
        nodes: [primaryPerson],
      },
      primaryPerson,
      website: 'testperson.com',
    },
  },
};

interface TestComponentProps {
  mocks?: DeepPartial<Mocks>;
}
const TestComponent: React.FC<TestComponentProps> = (props) => (
  <SnackbarProvider>
    <TestRouter router={router}>
      <LocalizationProvider dateAdapter={AdapterLuxon}>
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<Mocks>
            mocks={(props.mocks ?? mocks) as ApolloErgonoMockMap}
          >
            <ContactsWrapper>
              <ContactDetailProvider>
                <ContactDetailsTab
                  accountListId={accountListId}
                  contactId={contactId}
                  onContactSelected={onContactSelected}
                />
              </ContactDetailProvider>
            </ContactsWrapper>
          </GqlMockedProvider>
        </ThemeProvider>
      </LocalizationProvider>
    </TestRouter>
  </SnackbarProvider>
);

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

// TODO: Many of these tests are useless because there is never any element with the text "Loading"
describe('ContactDetailTab', () => {
  it('should open edit person modal', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should close edit person modal', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(queryByText('Edit Person')).not.toBeInTheDocument(),
    );
  });

  it('should open create person modal', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should close create person modal', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(queryByText('Create Person')).not.toBeInTheDocument(),
    );
  });

  it('should open create address modal', async () => {
    const { queryByText, getByText, getAllByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() => expect(getAllByText('Add Address').length).toBe(1));
    userEvent.click(getByText('Add Address'));
    await waitFor(() => expect(getAllByText('Add Address').length).toBe(2));
  });

  describe('merge people', () => {
    const mocksMultiplePeople = cloneDeep(mocks);
    mocksMultiplePeople?.ContactDetailsTab?.contact?.people?.nodes?.push(
      {
        id: 'person-2',
        firstName: 'Test 2',
        lastName: 'Person',
        primaryPhoneNumber: null,
        primaryEmailAddress: null,
        ...dates,
      },
      {
        id: 'person-3',
        firstName: 'Test 3',
        lastName: 'Person',
        primaryPhoneNumber: null,
        primaryEmailAddress: null,
        ...dates,
      },
    );

    it('should hide merge person button when there are fewer than two people', async () => {
      const { queryByRole, findByRole } = render(<TestComponent />);

      await findByRole('heading', { name: 'Test Person' });
      expect(
        queryByRole('button', { name: 'Merge People' }),
      ).not.toBeInTheDocument();
    });

    it('should do nothing after clicking cancel', async () => {
      const { getByRole, findByRole } = render(
        <TestComponent mocks={mocksMultiplePeople} />,
      );

      userEvent.click(await findByRole('button', { name: 'Merge People' }));
      userEvent.click(getByRole('button', { name: 'Cancel' }));
      expect(getByRole('button', { name: 'Merge People' })).toBeInTheDocument();
    });

    it('should disable merge selected people button until two people are selected', async () => {
      const { getByRole, findByRole } = render(
        <TestComponent mocks={mocksMultiplePeople} />,
      );

      userEvent.click(await findByRole('button', { name: 'Merge People' }));
      const mergeButton = getByRole('button', {
        name: 'Merge Selected People',
      });
      expect(mergeButton).toBeDisabled();
      userEvent.click(getByRole('heading', { name: 'Test Person' }));
      expect(mergeButton).toBeDisabled();
      userEvent.click(getByRole('heading', { name: 'Test 2 Person' }));
      expect(mergeButton).not.toBeDisabled();
    });

    it('should open winner selection modal', async () => {
      const { getByRole, findByRole } = render(
        <TestComponent mocks={mocksMultiplePeople} />,
      );

      userEvent.click(await findByRole('button', { name: 'Merge People' }));
      userEvent.click(getByRole('heading', { name: 'Test Person' }));
      userEvent.click(getByRole('heading', { name: 'Test 2 Person' }));
      userEvent.click(
        getByRole('button', {
          name: 'Merge Selected People',
        }),
      );

      const modal = getByRole('dialog');
      expect(
        within(modal).getByRole('heading', { name: 'Merge People' }),
      ).toBeInTheDocument();
      expect(
        within(modal).getByRole('heading', { name: 'Test Person' }),
      ).toBeInTheDocument();
      expect(
        within(modal).getByRole('heading', { name: 'Test 2 Person' }),
      ).toBeInTheDocument();
      expect(
        within(modal).queryByRole('heading', { name: 'Test 3 Person' }),
      ).not.toBeInTheDocument();
    });

    it('should close winner selection modal', async () => {
      const { getByRole, findByRole, queryByRole } = render(
        <TestComponent mocks={mocksMultiplePeople} />,
      );

      userEvent.click(await findByRole('button', { name: 'Merge People' }));
      userEvent.click(getByRole('heading', { name: 'Test Person' }));
      userEvent.click(getByRole('heading', { name: 'Test 2 Person' }));
      userEvent.click(
        getByRole('button', {
          name: 'Merge Selected People',
        }),
      );

      userEvent.click(
        getByRole('button', {
          name: 'Close',
        }),
      );
      expect(queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should close create address modal', async () => {
    const { queryByText, getAllByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() => expect(getAllByText('Add Address').length).toBe(1));
  });

  it('should open edit contact address modal', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should close edit contact address modal', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(queryByText('Edit Address')).not.toBeInTheDocument(),
    );
  });

  it('should open show more section | Addresses', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should close show more section | Addresses', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(queryByText('4321 Sesame Street')).not.toBeInTheDocument(),
    );
  });

  it('should open edit contact addresses from show more section | Addresses', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should open edit contact other details modal', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
  });

  it('should close edit contact other details modal', async () => {
    const { queryByText } = render(<TestComponent />);
    await waitFor(() => expect(queryByText('Loading')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(queryByText('Edit Contact Other Details')).not.toBeInTheDocument(),
    );
  });
});
