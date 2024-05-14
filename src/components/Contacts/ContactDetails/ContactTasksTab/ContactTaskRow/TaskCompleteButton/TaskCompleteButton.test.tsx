import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import theme from '../../../../../../theme';
import { TaskCompleteButton } from './TaskCompleteButton';

describe('TaskCompleteButton', () => {
  it('should render not complete', () => {
    const onClick = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TaskCompleteButton isComplete={false} onClick={onClick} />
      </ThemeProvider>,
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
      `"rgb(0, 202, 153)"`,
    );
  });

  it('should render complete', () => {
    const onClick = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TaskCompleteButton isComplete={true} onClick={onClick} />
      </ThemeProvider>,
    );

    const completeButton = getByRole('button');
    const checkIcon = getByRole('img', { hidden: true, name: 'Check Icon' });

    expect(completeButton).toBeInTheDocument();
    expect(checkIcon).toBeInTheDocument();

    const completeButtonStyle =
      completeButton && window.getComputedStyle(completeButton);

    expect(completeButtonStyle?.backgroundColor).toMatchInlineSnapshot(
      `"rgb(0, 202, 153)"`,
    );
    expect(completeButtonStyle?.color).toMatchInlineSnapshot(
      `"rgb(255, 255, 255)"`,
    );
  });

  it('should handle click', () => {
    const onClick = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TaskCompleteButton isComplete={true} onClick={onClick} />
      </ThemeProvider>,
    );

    const completeButton = getByRole('button');

    expect(completeButton).toBeInTheDocument();

    userEvent.click(completeButton);

    expect(onClick).toHaveBeenCalled();
  });
});
