import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/dom';
import theme from '../../../theme';
import { GqlMockedProvider } from '../../../../__tests__/util/graphqlMocking';
import { SetContactStarredMutation } from './SetContactStarred.generated';
import { StarContactIconButton } from './StarContactIconButton';

const accountListId = 'abc';
const contactId = '1';

describe('StarTaskIconButton', () => {
  it('renders not starred', async () => {
    const { queryByRole } = render(
      <GqlMockedProvider<SetContactStarredMutation>>
        <ThemeProvider theme={theme}>
          <StarContactIconButton
            accountListId={accountListId}
            contactId={contactId}
            isStarred={false}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    const starFilledIcon = queryByRole('img', {
      hidden: true,
      name: 'Filled Star Icon',
    });
    const starOutlineIcon = queryByRole('img', {
      hidden: true,
      name: 'Outline Star Icon',
    });

    expect(starFilledIcon).not.toBeInTheDocument();
    expect(starOutlineIcon).toBeInTheDocument();
  });

  it('renders starred', async () => {
    const { queryByRole } = render(
      <GqlMockedProvider<SetContactStarredMutation>>
        <ThemeProvider theme={theme}>
          <StarContactIconButton
            accountListId={accountListId}
            contactId={contactId}
            isStarred={true}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    const starFilledIcon = queryByRole('img', {
      hidden: true,
      name: 'Filled Star Icon',
    });
    const starOutlineIcon = queryByRole('img', {
      hidden: true,
      name: 'Outline Star Icon',
    });

    expect(starFilledIcon).toBeInTheDocument();
    expect(starOutlineIcon).not.toBeInTheDocument();
  });

  it('should toggle starred state', async () => {
    const mutationSpy = jest.fn();

    const { getByRole } = render(
      <GqlMockedProvider<SetContactStarredMutation> onCall={mutationSpy}>
        <ThemeProvider theme={theme}>
          <StarContactIconButton
            accountListId={accountListId}
            contactId={contactId}
            isStarred={false}
          />
        </ThemeProvider>
      </GqlMockedProvider>,
    );

    userEvent.click(
      getByRole('img', {
        hidden: true,
        name: 'Outline Star Icon',
      }),
    );

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
