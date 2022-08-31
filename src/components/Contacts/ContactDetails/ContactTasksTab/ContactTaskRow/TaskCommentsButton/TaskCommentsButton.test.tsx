import { MuiThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import theme from '../../../../../../theme';
import { TaskCommentsButton } from './TaskCommentsButton';

const numberOfComments = 10;

describe('TaskCommentsButton', () => {
  it('should render not complete', () => {
    const onClick = jest.fn();

    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <TaskCommentsButton
          isComplete={false}
          numberOfComments={numberOfComments}
          onClick={onClick}
        />
      </MuiThemeProvider>,
    );

    const numberText = getByText(`${numberOfComments}`);

    expect(numberText).toBeInTheDocument();

    const style = numberText && window.getComputedStyle(numberText);

    expect(style?.color).toMatchInlineSnapshot(`"rgb(56, 63, 67)"`);
  });

  it('should render complete', () => {
    const onClick = jest.fn();

    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <TaskCommentsButton
          isComplete={true}
          numberOfComments={numberOfComments}
          onClick={onClick}
        />
      </MuiThemeProvider>,
    );

    const numberText = getByText(`${numberOfComments}`);

    expect(numberText).toBeInTheDocument();

    const style = numberText && window.getComputedStyle(numberText);

    expect(style?.color).toMatchInlineSnapshot(`"rgb(156, 159, 161)"`);
  });

  it('should handle click', () => {
    const onClick = jest.fn();

    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <TaskCommentsButton
          isComplete={true}
          numberOfComments={numberOfComments}
          onClick={onClick}
        />
      </MuiThemeProvider>,
    );

    const commentsButton = getByRole('button');

    expect(commentsButton).toBeInTheDocument();

    userEvent.click(commentsButton);

    expect(onClick).toHaveBeenCalledWith();
  });
});
