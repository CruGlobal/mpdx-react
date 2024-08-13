import React from 'react';
import { ApolloCache, InMemoryCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { ErgonoMockShape } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import theme from '../../../theme';
import FixPhoneNumbers from './FixPhoneNumbers';
import { GetInvalidPhoneNumbersQuery } from './GetInvalidPhoneNumbers.generated';

const accountListId = 'test121';

const router = {
  query: { accountListId },
  isReady: true,
};
const setContactFocus = jest.fn();
const testData: ErgonoMockShape[] = [
  {
    id: 'testid',
    firstName: 'Test',
    lastName: 'Contact',
    phoneNumbers: {
      nodes: [
        {
          id: 'id1',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          number: '+3533895895',
          primary: true,
          source: 'MPDX',
        },
        {
          id: 'id12',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          number: '3533895895',
          primary: false,
          source: 'MPDX',
        },
        {
          id: 'id3',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          number: '+623533895895',
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
    phoneNumbers: {
      nodes: [
        {
          id: 'id4',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          number: '+3535785056',
          primary: true,
          source: 'MPDX',
        },
        {
          id: 'id5',
          updatedAt: new Date('2021-06-22T03:40:05-06:00').toISOString(),
          number: '+623535785056',
          primary: false,
          source: 'MPDX',
        },
      ],
    },
  },
];

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

const Components: React.FC<{
  data?: ErgonoMockShape[];
  cache?: ApolloCache<object>;
}> = ({ data = testData, cache }) => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider>
      <TestRouter router={router}>
        <TestWrapper>
          <GqlMockedProvider<{
            GetInvalidPhoneNumbers: GetInvalidPhoneNumbersQuery;
          }>
            mocks={{
              GetInvalidPhoneNumbers: {
                people: {
                  nodes: data,
                },
              },
            }}
            cache={cache}
          >
            <FixPhoneNumbers
              accountListId={accountListId}
              setContactFocus={setContactFocus}
            />
          </GqlMockedProvider>
        </TestWrapper>
      </TestRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

describe('FixPhoneNumbers-Home', () => {
  it('default with test data', async () => {
    const { getByText, queryByTestId } = render(<Components />);

    await waitFor(() =>
      expect(getByText('Fix Phone Numbers')).toBeInTheDocument(),
    );
    await expect(
      getByText('You have 2 phone numbers to confirm.'),
    ).toBeInTheDocument();
    expect(getByText('Confirm 2 as MPDX')).toBeInTheDocument();
    expect(getByText('Test Contact')).toBeInTheDocument();
    expect(getByText('Simba Lion')).toBeInTheDocument();
    expect(queryByTestId('no-data')).not.toBeInTheDocument();
  });

  it('change primary of first number', async () => {
    const { getByTestId, queryByTestId } = render(<Components />);

    const star1 = await waitFor(() => getByTestId('starOutlineIcon-testid-1'));
    userEvent.click(star1);

    expect(queryByTestId('starIcon-testid-0')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-testid-1')).toBeInTheDocument();
    expect(getByTestId('starOutlineIcon-testid-0')).toBeInTheDocument();
  });

  it('delete third number from first person', async () => {
    const { getByTestId, queryByTestId } = render(<Components />);

    const delete02 = await waitFor(() => getByTestId('delete-testid-2'));
    userEvent.click(delete02);

    const deleteButton = getByTestId('modal-delete-button');
    userEvent.click(deleteButton);

    expect(queryByTestId('textfield-testid-2')).not.toBeInTheDocument();
  });

  it('change second number for second person to primary then delete it', async () => {
    const { getByTestId, queryByTestId } = render(<Components />);

    const star11 = await waitFor(() =>
      getByTestId('starOutlineIcon-testid2-1'),
    );
    userEvent.click(star11);

    const delete11 = getByTestId('delete-testid2-1');
    userEvent.click(delete11);

    const deleteButton = getByTestId('modal-delete-button');
    userEvent.click(deleteButton);

    expect(queryByTestId('starIcon-testid2-1')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-testid2-0')).toBeInTheDocument();
  });

  it('add a phone number to first person', async () => {
    const { getByTestId, getByDisplayValue } = render(<Components />);
    await waitFor(() =>
      expect(getByTestId('starIcon-testid2-0')).toBeInTheDocument(),
    );
    expect(getByTestId('textfield-testid2-0')).toBeInTheDocument();

    const textfieldNew1 = getByTestId(
      'addNewNumberInput-testid2',
    ) as HTMLInputElement;
    userEvent.type(textfieldNew1, '+12345');
    const addButton1 = getByTestId('addButton-testid2');
    userEvent.click(addButton1);

    expect(textfieldNew1.value).toBe('');
    expect(getByTestId('textfield-testid2-1')).toBeInTheDocument();
    expect(getByDisplayValue('+12345')).toBeInTheDocument();
  });

  it('should render no contacts with no data', async () => {
    const { getByText, getByTestId } = render(<Components data={[]} />);
    await waitFor(() =>
      expect(getByTestId('fixPhoneNumbers-null-state')).toBeInTheDocument(),
    );
    expect(
      getByText('No people with phone numbers need attention'),
    ).toBeInTheDocument();
  });

  it('should modify first number of first contact', async () => {
    const { getByTestId } = render(<Components />);
    await waitFor(() => {
      expect(getByTestId('textfield-testid-0')).toBeInTheDocument();
    });
    const firstInput = getByTestId('textfield-testid-0') as HTMLInputElement;

    expect(firstInput.value).toBe('+3533895895');
    userEvent.type(firstInput, '123');
    expect(firstInput.value).toBe('+3533895895123');
  });

  it('should hide contact from view', async () => {
    const { getByTestId, getByText, queryByText } = render(<Components />);
    await waitFor(() => {
      expect(
        getByText(`${testData[0].firstName} ${testData[0].lastName}`),
      ).toBeInTheDocument();
    });

    userEvent.click(getByTestId('confirmButton-testid'));

    await waitFor(() => {
      expect(
        queryByText(`${testData[0].firstName} ${testData[0].lastName}`),
      ).not.toBeInTheDocument();
    });
  });
  it('should bulk confirm all phone numbers', async () => {
    const cache = new InMemoryCache();

    const { getByTestId, queryByTestId, getByText } = render(
      <Components cache={cache} />,
    );
    await waitFor(() => {
      expect(queryByTestId('loading')).not.toBeInTheDocument();
      expect(getByTestId('starOutlineIcon-testid-1')).toBeInTheDocument();
    });

    userEvent.click(getByTestId(`starOutlineIcon-testid-1`));

    const confirmAllButton = getByTestId('source-button');
    userEvent.click(confirmAllButton);

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(`Phone numbers updated!`, {
        variant: 'success',
        autoHideDuration: 7000,
      });
      expect(
        getByText('No people with phone numbers need attention'),
      ).toBeVisible();
    });
  });
});
