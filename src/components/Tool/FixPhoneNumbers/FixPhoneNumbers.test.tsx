import { ThemeProvider } from '@material-ui/core';
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
import { GetInvalidPhoneNumbersQuery } from './GetInvalidPhoneNumbers.generated';
import FixPhoneNumbers from './FixPhoneNumbers';

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
    phoneNumbers: {
      nodes: [
        {
          id: 'id1',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          number: '+3533895895',
          primary: true,
        },
        {
          id: 'id12',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          number: '3533895895',
          primary: false,
        },
        {
          id: 'id3',
          updatedAt: new Date('2021-06-21T03:40:05-06:00').toISOString(),
          number: '+623533895895',
          primary: false,
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
        },
        {
          id: 'id5',
          updatedAt: new Date('2021-06-22T03:40:05-06:00').toISOString(),
          number: '+623535785056',
          primary: false,
        },
      ],
    },
  },
];

describe('FixPhoneNumbers-Home', () => {
  it('default with test data', async () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidPhoneNumbersQuery>
              mocks={{
                GetInvalidPhoneNumbers: {
                  people: {
                    nodes: testData,
                  },
                },
              }}
            >
              <FixPhoneNumbers accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(getByText('Fix Phone Numbers')).toBeInTheDocument(),
    );
    await expect(
      getByText('You have 2 phone numbers to confirm.'),
    ).toBeInTheDocument();
    expect(getByText('Confirm 2 as MPDX')).toBeInTheDocument();
    expect(getByText('Test Contact')).toBeInTheDocument();
    expect(getByText('Simba Lion')).toBeInTheDocument();
    expect(getByTestId('textfield-0-0')).toBeInTheDocument();
    expect(getByTestId('starIcon-0-0')).toBeInTheDocument();
  });

  it('change primary of first number', async () => {
    const { getByTestId, queryByTestId } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidPhoneNumbersQuery>
              mocks={{
                GetInvalidPhoneNumbers: {
                  people: {
                    nodes: testData,
                  },
                },
              }}
            >
              <FixPhoneNumbers accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );

    const star1 = await waitFor(() => getByTestId('starOutlineIcon-0-1'));
    userEvent.click(star1);

    expect(queryByTestId('starIcon-0-0')).not.toBeInTheDocument();
    expect(getByTestId('starIcon-0-1')).toBeInTheDocument();
    expect(getByTestId('starOutlineIcon-0-0')).toBeInTheDocument();
  });

  // it('delete third number from first person', async () => {
  //   const { getByTestId, queryByTestId } = render(
  //     <ThemeProvider theme={theme}>
  //       <TestRouter router={router}>
  //         <TestWrapper>
  //           <GqlMockedProvider<GetInvalidPhoneNumbersQuery>
  //             mocks={{
  //               GetInvalidPhoneNumbers: {
  //                 people: {
  //                   nodes: testData,
  //                 },
  //               },
  //             }}
  //           >
  //             <FixPhoneNumbers accountListId={accountListId}/>
  //           </GqlMockedProvider>
  //         </TestWrapper>
  //       </TestRouter>
  //     </ThemeProvider>,
  //   );

  //   const delete02 = await waitFor(() => getByTestId('delete-0-2'));
  //   userEvent.click(delete02);

  //   const deleteButton = getByTestId('phoneNumberDeleteButton');
  //   userEvent.click(deleteButton);

  //   expect(queryByTestId('textfield-0-2')).not.toBeInTheDocument();
  // });

  it('change third number from second person', async () => {
    const { getByDisplayValue } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidPhoneNumbersQuery>
              mocks={{
                GetInvalidPhoneNumbers: {
                  people: {
                    nodes: testData,
                  },
                },
              }}
            >
              <FixPhoneNumbers accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );

    await waitFor(() =>
      expect(getByDisplayValue('+623535785056')).toBeInTheDocument(),
    );
    const textfield11 = getByDisplayValue('+623535785056') as HTMLInputElement;
    userEvent.type(textfield11, '1');

    expect(textfield11.value).toBe('+6235357850561');
  });

  // it('change second number for second person to primary then delete it', async () => {
  //   const { getByTestId, queryByTestId } = render(
  //     <ThemeProvider theme={theme}>
  //       <TestRouter router={router}>
  //         <TestWrapper>
  //           <GqlMockedProvider<GetInvalidPhoneNumbersQuery>
  //             mocks={{
  //               GetInvalidPhoneNumbers: {
  //                 people: {
  //                   nodes: testData,
  //                 },
  //               },
  //             }}
  //           >
  //             <FixPhoneNumbers accountListId={accountListId}/>
  //           </GqlMockedProvider>
  //         </TestWrapper>
  //       </TestRouter>
  //     </ThemeProvider>,
  //   );

  //   const star11 = await waitFor(() => getByTestId('starOutlineIcon-1-1'));
  //   userEvent.click(star11);

  //   const delete11 = getByTestId('delete-1-1');
  //   userEvent.click(delete11);

  //   const deleteButton = getByTestId('phoneNumberDeleteButton');
  //   userEvent.click(deleteButton);

  //   expect(queryByTestId('starIcon-1-1')).not.toBeInTheDocument();
  //   expect(getByTestId('starIcon-1-0')).toBeInTheDocument();
  // });

  it('add a phone number to first person', async () => {
    const { getByTestId, getByDisplayValue } = render(
      <ThemeProvider theme={theme}>
        <TestRouter router={router}>
          <TestWrapper>
            <GqlMockedProvider<GetInvalidPhoneNumbersQuery>
              mocks={{
                GetInvalidPhoneNumbers: {
                  people: {
                    nodes: testData,
                  },
                },
              }}
            >
              <FixPhoneNumbers accountListId={accountListId} />
            </GqlMockedProvider>
          </TestWrapper>
        </TestRouter>
      </ThemeProvider>,
    );
    await waitFor(() =>
      expect(getByTestId('starIcon-1-0')).toBeInTheDocument(),
    );
    expect(getByTestId('textfield-1-0')).toBeInTheDocument();

    const textfieldNew1 = getByTestId(
      'addNewNumberInput-1',
    ) as HTMLInputElement;
    userEvent.type(textfieldNew1, '+12345');
    const addButton1 = getByTestId('addButton-1');
    userEvent.click(addButton1);

    expect(textfieldNew1.value).toBe('');
    expect(getByTestId('textfield-1-1')).toBeInTheDocument();
    expect(getByDisplayValue('+12345')).toBeInTheDocument();
  });
});
