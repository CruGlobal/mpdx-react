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
    const { getByRole, queryByTestId } = render(
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
    expect(getByRole('button', { name: 'Add star' })).toBeInTheDocument();
  });

  it('renders starred', async () => {
    const { queryByTestId, getByRole } = render(
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
    expect(getByRole('button', { name: 'Remove star' })).toBeInTheDocument();
  });

  it('should toggle starred state', async () => {
    const mutationSpy = jest.fn();

    const { getByRole } = render(
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

    userEvent.click(getByRole('button', { name: 'Add star' }));

    await waitFor(() =>
      expect(mutationSpy).toHaveGraphqlOperation('SetContactStarred', {
        accountListId,
        contactId,
        starred: true,
      }),
    );
  });
});
