import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import theme from '../../../../../../theme';
import { TaskCompleteButton } from './TaskCompleteButton';

describe('TaskCompleteButton', () => {
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

    expect(completeButtonStyle?.backgroundColor).toMatchInlineSnapshot(
      `"transparent"`,
    );
    expect(completeButtonStyle?.color).toMatchInlineSnapshot(
      `"rgb(56, 63, 67)"`,
    );
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

    expect(completeButtonStyle?.backgroundColor).toMatchInlineSnapshot(
      `"transparent"`,
    );
    expect(completeButtonStyle?.color).toMatchInlineSnapshot(
      `"rgb(56, 63, 67)"`,
    );
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
