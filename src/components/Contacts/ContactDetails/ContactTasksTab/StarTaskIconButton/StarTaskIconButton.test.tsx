import React from 'react';
import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import theme from '../../../../../theme';
import { GqlMockedProvider } from '../../../../../../__tests__/util/graphqlMocking';
import { SetTaskStarredMutation } from './SetTaskStarred.generated';
import { StarTaskIconButton } from './StarTaskIconButton';

const accountListId = 'abc';
const taskId = '1';

describe('StarTaskIconButton', () => {
  it('renders not starred', async () => {
    const { queryByRole } = render(
      <GqlMockedProvider<SetTaskStarredMutation>>
        <MuiThemeProvider theme={theme}>
          <StarTaskIconButton
            accountListId={accountListId}
            taskId={taskId}
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
      <GqlMockedProvider<SetTaskStarredMutation>>
        <MuiThemeProvider theme={theme}>
          <StarTaskIconButton
            accountListId={accountListId}
            taskId={taskId}
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
