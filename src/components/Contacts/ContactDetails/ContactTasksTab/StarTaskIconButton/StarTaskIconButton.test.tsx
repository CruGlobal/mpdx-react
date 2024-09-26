import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { GqlMockedProvider } from '__tests__/util/graphqlMocking';
import theme from '../../../../../theme';
import { StarTaskIconButton } from './StarTaskIconButton';

const accountListId = 'abc';
const taskId = '1';

describe('StarTaskIconButton', () => {
  it('renders not starred', async () => {
    const { queryByTestId } = render(
      <GqlMockedProvider>
        <ThemeProvider theme={theme}>
          <StarTaskIconButton
            accountListId={accountListId}
            taskId={taskId}
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
          <StarTaskIconButton
            accountListId={accountListId}
            taskId={taskId}
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
});
