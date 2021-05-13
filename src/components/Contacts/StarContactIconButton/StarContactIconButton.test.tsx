import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
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
        <MuiThemeProvider theme={theme}>
          <StarContactIconButton
            accountListId={accountListId}
            contactId={contactId}
            isStarred={false}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    const starFilledIcon = queryByRole('img', { name: 'Filled Star Icon' });
    const starOutlineIcon = queryByRole('img', { name: 'Outline Star Icon' });

    expect(starFilledIcon).not.toBeInTheDocument();
    expect(starOutlineIcon).toBeInTheDocument();
  });

  it('renders starred', async () => {
    const { queryByRole } = render(
      <GqlMockedProvider<SetContactStarredMutation>>
        <MuiThemeProvider theme={theme}>
          <StarContactIconButton
            accountListId={accountListId}
            contactId={contactId}
            isStarred={true}
          />
        </MuiThemeProvider>
      </GqlMockedProvider>,
    );

    const starFilledIcon = queryByRole('img', { name: 'Filled Star Icon' });
    const starOutlineIcon = queryByRole('img', { name: 'Outline Star Icon' });

    expect(starFilledIcon).toBeInTheDocument();
    expect(starOutlineIcon).not.toBeInTheDocument();
  });
});
