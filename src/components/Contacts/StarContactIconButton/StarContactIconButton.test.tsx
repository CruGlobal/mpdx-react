import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { waitFor } from '@testing-library/dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../theme';
import { StarContactIconButton } from './StarContactIconButton';

const accountListId = 'abc';
const contactId = '1';

describe('StarTaskIconButton', () => {
  it('renders not starred', async () => {
    const { queryByTestId } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <StarContactIconButton
            accountListId={accountListId}
            contactId={contactId}
            isStarred={false}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    const starFilledIcon = queryByTestId('Filled Star Icon');
    const starOutlineIcon = queryByTestId('Outline Star Icon');

    expect(starFilledIcon).not.toBeInTheDocument();
    expect(starOutlineIcon).toBeInTheDocument();
  });

  it('renders starred', async () => {
    const { queryByTestId } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <StarContactIconButton
            accountListId={accountListId}
            contactId={contactId}
            isStarred={true}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    const starFilledIcon = queryByTestId('Filled Star Icon');
    const starOutlineIcon = queryByTestId('Outline Star Icon');

    expect(starFilledIcon).toBeInTheDocument();
    expect(starOutlineIcon).not.toBeInTheDocument();
  });

  it('should toggle starred state', async () => {
    const mutationSpy = jest.fn();

    const { getByTestId } = render(
      <GqlMockedProvider onCall={mutationSpy}>
        <ThemeProvider theme={theme}>
          <StarContactIconButton
            accountListId={accountListId}
            contactId={contactId}
            isStarred={false}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );
    const starOutlineIcon = getByTestId('Outline Star Icon');

    userEvent.click(starOutlineIcon);

    await waitFor(() =>
      expect(mutationSpy).toHaveBeenCalledWith({
        operation: expect.objectContaining({
          operationName: 'SetContactStarred',
          variables: { accountListId: 'abc', contactId: '1', starred: true },
        }),
        response: {
          data: {
            updateContact: {
              __typename: 'ContactUpdateMutationPayload',
              contact: { __typename: 'Contact', id: '2418942', starred: true },
            },
          },
        },
      }),
    );
  });
});
