import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import userEvent from '@testing-library/user-event';
import { ErgonoMockShape } from 'graphql-ergonomock';
import {
  render,
  waitFor,
} from '../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import TestRouter from '../../../../__tests__/util/TestRouter';
import { GetInvalidEmailAddressesQuery } from './GetInvalidEmailAddresses.generated';
import { FixEmailAddresses } from './FixEmailAddresses';

const accountListId = 'test121';

const router = {
  query: { accountListId },
  isReady: true,
};

const testData: ErgonoMockShape[] = [
  {
    id: 'testid',
    firstName: 'Test',
    lastName: 'Contact',
    emailAddresses: {
      nodes: [
        {
          id: 'id1',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          email: 'email1@gmail.com',
          primary: true,
          source: 'MPDX',
        },
        {
          id: 'id12',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          email: 'email2@gmail.com',
          primary: false,
          source: 'MPDX',
        },
        {
          id: 'id3',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          email: 'email3@gmail.com',
          primary: false,
          source: 'MPDX',
        },
      ],
    },
  },
  {
    id: 'testid2',
    firstName: 'Simba',
    lastName: 'Lion',
    emailAddresses: {
      nodes: [
        {
          id: 'id4',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          number: 'email4@gmail.com',
          primary: true,
          source: 'MPDX',
        },
        {
          id: 'id5',
          updatedAt: new Date('2021-06-22T03:40:05-06:00').toISOString(),
          number: 'email5@gmail.com',
          primary: false,
          source: 'MPDX',
        },
      ],
    },
  },
];

describe('FixPhoneNumbers-Home', () => {
  it('default with test data', async () => {
    const { getByText, getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidEmailAddressesQuery>
              mocks={{
                GetInvalidEmailAddresses: {
                  people: {
                    nodes: testData,
                  },
                },
              }}
            >
              <FixEmailAddresses accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(getByText('Fix Email Addresses')).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(getByTestId('starOutlineIcon-testid-1')).toBeInTheDocument(),
    );
    await expect(
      getByText('You have 2 email addresses to confirm.'),
    ).toBeInTheDocument();
    expect(getByText('Confirm 2 as MPDX')).toBeInTheDocument();
    expect(getByText('Test Contact')).toBeInTheDocument();
    expect(getByText('Simba Lion')).toBeInTheDocument();
    expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    expect(getByTestId('starIcon-testid-0')).toBeInTheDocument();
    expect(queryByTestId('no-data')).not.toBeInTheDocument();
  });

  it('change primary of first email', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidEmailAddressesQuery>
              mocks={{
                GetInvalidEmailAddresses: {
                  people: {
                    nodes: testData,
                  },
                },
              }}
            >
              <FixEmailAddresses accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );

    const star1 = await waitFor(() => getByTestId('starOutlineIcon-testid-1'));
    userEvent.click(star1);

    expect(queryByTestId('starIcon-testid-0')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-testid-1')).toBeInTheDocument();
    expect(getByTestId('starOutlineIcon-testid-0')).toBeInTheDocument();
  });

  it('delete third email from first person', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidEmailAddressesQuery>
              mocks={{
                GetInvalidEmailAddresses: {
                  people: {
                    nodes: testData,
                  },
                },
              }}
            >
              <FixEmailAddresses accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );

    const delete02 = await waitFor(() => getByTestId('delete-testid-2'));
    userEvent.click(delete02);

    const deleteButton = getByTestId('emailAddressDeleteButton');
    userEvent.click(deleteButton);

    expect(queryByTestId('textfield-testid-2')).not.toBeInTheDocument();
  });

  it('change second email for second person to primary then delete it', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidEmailAddressesQuery>
              mocks={{
                GetInvalidEmailAddresses: {
                  people: {
                    nodes: testData,
                  },
                },
              }}
            >
              <FixEmailAddresses accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );

    const star11 = await waitFor(() =>
      getByTestId('starOutlineIcon-testid2-1'),
    );
    userEvent.click(star11);

    const delete11 = getByTestId('delete-testid2-1');
    userEvent.click(delete11);

    const deleteButton = getByTestId('emailAddressDeleteButton');
    userEvent.click(deleteButton);

    expect(queryByTestId('starIcon-testid2-1')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-testid2-0')).toBeInTheDocument();
  });

  it('add an email address to second person', async () => {
    const { getByTestId, getByDisplayValue } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidEmailAddressesQuery>
              mocks={{
                GetInvalidEmailAddresses: {
                  people: {
                    nodes: testData,
                  },
                },
              }}
            >
              <FixEmailAddresses accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('starIcon-testid2-0')).toBeInTheDocument(),
    );
    expect(getByTestId('textfield-testid2-0')).toBeInTheDocument();

    const textfieldNew1 = getByTestId(
      'addNewEmailInput-testid2',
    ) as HTMLInputElement;
    userEvent.type(textfieldNew1, 'email12345@gmail.com');
    const addButton1 = getByTestId('addButton-testid2');
    userEvent.click(addButton1);

    expect(textfieldNew1.value).toBe('');
    expect(getByTestId('textfield-testid2-2')).toBeInTheDocument();
    expect(getByDisplayValue('email12345@gmail.com')).toBeInTheDocument();
  });

  it('should render no contacts with no data', async () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidEmailAddressesQuery>
              mocks={{
                GetInvalidEmailAddresses: {
                  people: {
                    nodes: [],
                  },
                },
              }}
            >
              <FixEmailAddresses accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('fixEmailAddresses-null-state')).toBeInTheDocument(),
    );
    expect(
      getByText('No people with email addresses need attention'),
    ).toBeInTheDocument();
  });

  it('should modify first email of first contact', async () => {
    const { getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidEmailAddressesQuery>
              mocks={{
                GetInvalidEmailAddresses: {
                  people: {
                    nodes: testData,
                  },
                },
              }}
            >
              <FixEmailAddresses accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    });
    const firstInput = getByTestId('textfield-testid-0') as HTMLInputElement;

    expect(firstInput.value).toBe('email1@gmail.com');
    userEvent.type(firstInput, '123');
    expect(firstInput.value).toBe('email1@gmail.com123');
  });
});
