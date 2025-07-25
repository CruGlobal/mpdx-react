import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import userEvent from '@testing-library/user-event';
import { ErgonoMockShape } from 'graphql-ergonomock';
import { SnackbarProvider } from 'notistack';
import TestRouter from '__tests__/util/TestRouter';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import { render, waitFor } from '__tests__/util/testingLibraryReactMock';
import { AppSettingsProvider } from 'src/components/common/AppSettings/AppSettingsProvider';
import { ContactPanelProvider } from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import theme from '../../../theme';
import FixPhoneNumbers from './FixPhoneNumbers';
import { GetInvalidPhoneNumbersMocks } from './FixPhoneNumbersMocks';
import { GetInvalidPhoneNumbersQuery } from './GetInvalidPhoneNumbers.generated';

const accountListId = 'test121';

const testData =
  GetInvalidPhoneNumbersMocks.GetInvalidPhoneNumbers.people.nodes;

const router = {
  pathname:
    '/accountLists/[accountListId]/tools/fix/phoneNumbers/[[...contactId]]',
  query: { accountListId },
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

const Components: React.FC<{
  data?: ErgonoMockShape[];
  count?: number;
}> = ({ data = testData, count = 2 }) => (
  <AppSettingsProvider>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <TestRouter router={router}>
          <GqlMockedProvider<{
            GetInvalidPhoneNumbers: GetInvalidPhoneNumbersQuery;
          }>
            mocks={{
              GetInvalidPhoneNumbers: {
                people: {
                  totalCount: count,
                  nodes: data,
                },
              },
            }}
          >
            <ContactPanelProvider>
              <FixPhoneNumbers accountListId={accountListId} />
            </ContactPanelProvider>
          </GqlMockedProvider>
        </TestRouter>
      </SnackbarProvider>
    </ThemeProvider>
  </AppSettingsProvider>
);

describe('FixPhoneNumbers-Home', () => {
  it('default with test data', async () => {
    const { getByText, queryByTestId, findByText } = render(<Components />);

    expect(
      await findByText('You have 2 phone numbers to confirm.'),
    ).toBeInTheDocument();
    expect(getByText('Confirm 2 as MPDX')).toBeInTheDocument();
    expect(getByText('Test Contact')).toBeInTheDocument();
    expect(getByText('Simba Lion')).toBeInTheDocument();
    expect(queryByTestId('no-data')).not.toBeInTheDocument();
  });

  it('change primary of first number', async () => {
    const { getByTestId, queryByTestId, findByTestId } = render(<Components />);

    const star1 = await findByTestId('starOutlineIcon-testid-id2');
    userEvent.click(star1);
    expect(queryByTestId('starIcon-testid-id2')).toBeInTheDocument();
    expect(getByTestId('starOutlineIcon-testid-id1')).toBeInTheDocument();
    expect(getByTestId('starOutlineIcon-testid-id3')).toBeInTheDocument();
  });

  it('delete third number from first person', async () => {
    const { queryByTestId, findByText, findByTestId } = render(<Components />);

    const delete02 = await findByTestId('delete-testid-id3');
    userEvent.click(delete02);

    const deleteButton = await findByText('Yes');
    userEvent.click(deleteButton);
    waitFor(() => {
      expect(queryByTestId('textfield-testid-id3')).not.toBeInTheDocument();
    });
  });

  it('change second number for second person to primary then delete it', async () => {
    const { getByTestId, findByText, queryByTestId, findByTestId } = render(
      <Components />,
    );

    const star11 = await findByTestId('starOutlineIcon-testid2-id5');
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
    const { getByTestId, getAllByTestId, getAllByLabelText, findByTestId } =
      render(<Components />);

    expect(await findByTestId('starIcon-testid-id1')).toBeInTheDocument();
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
    const { getByText, findByTestId } = render(<Components data={[]} />);

    expect(
      await findByTestId('fixPhoneNumbers-null-state'),
    ).toBeInTheDocument();

    expect(
      getByText('No people with phone numbers need attention'),
    ).toBeInTheDocument();
  });

  it('should modify first number of first contact', async () => {
    const { getByTestId, findByTestId } = render(<Components />);

    expect(await findByTestId('textfield-testid-id1')).toBeInTheDocument();
    const firstInput = getByTestId('textfield-testid-id1') as HTMLInputElement;

    expect(firstInput.value).toBe('+353');
    userEvent.type(firstInput, '123');
    await waitFor(() => {
      expect(firstInput).toHaveValue('+353123');
    });
  });

  it('should hide contact from view', async () => {
    const { getByTestId, findByText } = render(<Components />);
    expect(await findByText(`Simba Lion`)).toBeInTheDocument();

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
    const { getByTestId, queryByTestId, getByText, findByTestId, getByRole } =
      render(<Components />);
    await waitFor(() => {
      expect(queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(
      await findByTestId('starOutlineIcon-testid-id2'),
    ).toBeInTheDocument();

    userEvent.click(getByTestId(`starOutlineIcon-testid-id2`));

    const primarySource = getByRole('combobox');

    userEvent.click(primarySource);
    userEvent.click(getByRole('option', { name: 'DonorHub' }));

    expect(primarySource).toHaveTextContent('DonorHub');

    expect(getByTestId('source-button')).toHaveTextContent(
      'Confirm 2 as DonorHub',
    );

    const confirmAllButton = getByTestId('source-button');
    userEvent.click(confirmAllButton);
    userEvent.click(getByText('Yes'));

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith(
        expect.stringContaining('Successfully updated phone numbers'),
        expect.objectContaining({ variant: 'success' }),
      );
    });

    expect(
      getByText('No people with phone numbers need attention'),
    ).toBeVisible();
  });
  it('should handle 50+ phone numbers gracefully', async () => {
    const largeTestData = Array.from({ length: 51 }, (_, index) => ({
      id: `person-${index}`,
      firstName: `FirstName${index}`,
      lastName: `LastName${index}`,
      phoneNumbers: {
        nodes: [
          {
            id: `phone-${index}`,
            number: `+123456789${index}`,
            primary: index === 0,
            source: 'Manual',
          },
        ],
      },
    }));

    const { getByText, getAllByTestId, queryByTestId, getByTestId } = render(
      <Components data={largeTestData} count={51} />,
    );
    await waitFor(() => {
      expect(queryByTestId('loading')).not.toBeInTheDocument();
    });

    expect(
      getByText('You have 51 phone numbers to confirm.'),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(getAllByTestId('phoneNumbers')).toHaveLength(51),
    );

    expect(queryByTestId('no-data')).not.toBeInTheDocument();
    expect(getByText('Confirm 51 as MPDX')).toBeInTheDocument();

    userEvent.click(getByTestId('source-button'));

    userEvent.click(getByText('Yes'));
    await waitFor(() => expect(mockEnqueue).toHaveBeenCalledTimes(51), {
      timeout: 2000,
    });
  });
});
