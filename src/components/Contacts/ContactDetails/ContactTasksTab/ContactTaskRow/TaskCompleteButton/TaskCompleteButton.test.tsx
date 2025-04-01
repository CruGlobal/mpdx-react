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

    expect(getByRole('button', { name: 'Complete Task' })).toHaveStyle(
      'background-color: transparent; color: rgb(0, 202, 153);',
    );
    expect(getByRole('img')).toBeInTheDocument();
  });

  it('should render complete', () => {
    const onClick = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TaskCompleteButton isComplete={true} onClick={onClick} />
      </ThemeProvider>,
    );

    expect(getByRole('button', { name: 'Complete Task' })).toHaveStyle(
      'background-color: rgb(0, 202, 153); color: rgb(255, 255, 255);',
    );
    expect(getByRole('img')).toBeInTheDocument();
  });

  it('should handle click', () => {
    const onClick = jest.fn();

    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TaskCompleteButton isComplete={false} onClick={onClick} />
      </ThemeProvider>,
    );

    userEvent.click(getByRole('button', { name: 'Complete Task' }));

    expect(onClick).toHaveBeenCalled();
  });
});
