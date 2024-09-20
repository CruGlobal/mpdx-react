import React from 'react';
import { ApolloCache } from '@apollo/client';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { ErgonoMockShape } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import TestWrapper from '__tests__/util/TestWrapper';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import {
  fireEvent,
  render,
  waitFor,
} from '__tests__/util/testingLibraryReactMock';
import theme from '../../../theme';
import FixPhoneNumbers from './FixPhoneNumbers';
import { GetInvalidPhoneNumbersMocks } from './FixPhoneNumbersMocks';
import { GetInvalidPhoneNumbersQuery } from './GetInvalidPhoneNumbers.generated';

const accountListId = 'test121';

const testData =
  GetInvalidPhoneNumbersMocks.GetInvalidPhoneNumbers.people.nodes;

const router = {
  query: { accountListId },
  isReady: true,
};
const setContactFocus = jest.fn();

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
                  totalCount: 2,
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
    const { getByText, queryByTestId, findByText } = render(<Components />);

    await expect(
      await findByText('You have 2 phone numbers to confirm.'),
    ).toBeInTheDocument();
    expect(getByText('Confirm 2 as MPDX')).toBeInTheDocument();
    expect(getByText('Test Contact')).toBeInTheDocument();
    expect(getByText('Simba Lion')).toBeInTheDocument();
    expect(queryByTestId('no-data')).not.toBeInTheDocument();
  });

  it('change primary of first number', async () => {
    const { getByTestId, queryByTestId } = render(<Components />);

    const star1 = await waitFor(() =>
      getByTestId('starOutlineIcon-testid-id2'),
    );
    userEvent.click(star1);
    expect(queryByTestId('starIcon-testid-id2')).toBeInTheDocument();
    expect(getByTestId('starOutlineIcon-testid-id1')).toBeInTheDocument();
    expect(getByTestId('starOutlineIcon-testid-id3')).toBeInTheDocument();
  });

  it('delete third number from first person', async () => {
    const { getByTestId, queryByTestId, findByText } = render(<Components />);

    const delete02 = await waitFor(() => getByTestId('delete-testid-id3'));
    userEvent.click(delete02);

    const deleteButton = await findByText('Yes');
    userEvent.click(deleteButton);
    waitFor(() => {
      expect(queryByTestId('textfield-testid-id3')).not.toBeInTheDocument();
    });
  });

  it('change second number for second person to primary then delete it', async () => {
    const { getByTestId, findByText, queryByTestId } = render(<Components />);

    const star11 = await waitFor(() =>
      getByTestId('starOutlineIcon-testid2-id5'),
    );
    userEvent.click(star11);

    expect(queryByTestId('starIcon-testid2-id5')).toBeInTheDocument();

    const delete11 = getByTestId('delete-testid2-id5');
    userEvent.click(delete11);

    const deleteButton = await findByText('Yes');
    userEvent.click(deleteButton);

    await waitFor(() => {
      expect(queryByTestId('starIcon-testid2-id5')).not.toBeInTheDocument();
    });
  });

  it('add a phone number to first person', async () => {
    const { getByTestId, getAllByTestId, getAllByLabelText } = render(
      <Components />,
    );
    await waitFor(() =>
      expect(getByTestId('starIcon-testid-id1')).toBeInTheDocument(),
    );
    expect(getByTestId('textfield-testid-id1')).toBeInTheDocument();
    expect(getAllByTestId('phoneNumbers')).toHaveLength(5);
    const textfieldNew1 = getAllByLabelText('New Phone Number')[0];
    userEvent.type(textfieldNew1, '+12345');
    const addButton = getByTestId('addButton-testid');
    expect(textfieldNew1).toHaveValue('+12345');
    userEvent.click(addButton);
    await waitFor(() =>
      expect(mockEnqueue).toHaveBeenCalledWith('Added phone number', {
        variant: 'success',
      }),
    );
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
      expect(getByTestId('textfield-testid-id1')).toBeInTheDocument();
    });
    const firstInput = getByTestId('textfield-testid-id1') as HTMLInputElement;

    expect(firstInput.value).toBe('+353');
    userEvent.type(firstInput, '123');
    await waitFor(() => {
      expect(firstInput).toHaveValue('+353');
    });
  });

  it('should hide contact from view', async () => {
    const { getByTestId, getByText } = render(<Components />);
    await waitFor(() => {
      expect(getByText(`Simba Lion`)).toBeInTheDocument();
    });

    userEvent.click(getByTestId('confirmButton-testid'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        'Successfully updated phone numbers for Test Contact',
        {
          variant: 'success',
        },
      );
    });
  });
  it('should bulk confirm all phone numbers', async () => {
    const { getByTestId, queryByTestId, getByText } = render(<Components />);
    await waitFor(() => {
      expect(queryByTestId('loading')).not.toBeInTheDocument();
      expect(getByTestId('starOutlineIcon-testid-id2')).toBeInTheDocument();
    });

    userEvent.click(getByTestId(`starOutlineIcon-testid-id2`));

    fireEvent.change(getByTestId('source-select'), {
      target: { value: 'MPDX' },
    });

    expect(getByTestId('source-select')).toHaveValue('MPDX');

    const confirmAllButton = getByTestId('source-button');
    userEvent.click(confirmAllButton);
    userEvent.click(getByText('Yes'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(`Phone numbers updated!`, {
        variant: 'success',
      });
      expect(
        getByText('No people with phone numbers need attention'),
      ).toBeVisible();
    });
  });
});
