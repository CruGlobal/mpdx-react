import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import theme from '../../../../../../theme';
import { TaskCompleteButton } from './TaskCompleteButton';

describe('TaskCommentsButton', () => {
  it('should render not complete', () => {
    const onClick = jest.fn();

    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <TaskCompleteButton isComplete={false} onClick={onClick} />
      </MuiThemeProvider>,
    );

    const completeButton = getByRole('button');
    const checkIcon = getByRole('img', { hidden: true, name: 'Check Icon' });

    expect(completeButton).toBeInTheDocument();
    expect(checkIcon).toBeInTheDocument();

    const completeButtonStyle =
      completeButton && window.getComputedStyle(completeButton);
    const checkIconStyle = checkIcon && window.getComputedStyle(checkIcon);

    expect(completeButtonStyle?.backgroundColor).toMatchInlineSnapshot(
      `"transparent"`,
    );
    expect(checkIconStyle?.color).toMatchInlineSnapshot(`"rgb(0, 202, 153)"`);
  });

  it('should render complete', () => {
    const onClick = jest.fn();

    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <TaskCompleteButton isComplete={true} onClick={onClick} />
      </MuiThemeProvider>,
    );

    const completeButton = getByRole('button');
    const checkIcon = getByRole('img', { hidden: true, name: 'Check Icon' });

    expect(completeButton).toBeInTheDocument();
    expect(checkIcon).toBeInTheDocument();

    const completeButtonStyle =
      completeButton && window.getComputedStyle(completeButton);
    const checkIconStyle = checkIcon && window.getComputedStyle(checkIcon);

    expect(completeButtonStyle?.backgroundColor).toMatchInlineSnapshot(
      `"transparent"`,
    );
    expect(checkIconStyle?.color).toMatchInlineSnapshot(`"rgb(255, 255, 255)"`);
  });

  it('should handle click', () => {
    const onClick = jest.fn();

    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <TaskCompleteButton isComplete={true} onClick={onClick} />
      </MuiThemeProvider>,
    );

    const completeButton = getByRole('button');

    expect(completeButton).toBeInTheDocument();

    userEvent.click(completeButton);

    expect(onClick).toHaveBeenCalledWith();
  });
});
