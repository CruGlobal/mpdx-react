import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import theme from '../../../../../../theme';
import { TaskDate } from './TaskDate';

const notLateDueDate = DateTime.local(2021, 10, 12);
const lateDueDate = DateTime.local(2019, 10, 12);
const currentDate = DateTime.local(2020, 10, 12);

describe('TaskCommentsButton', () => {
  it('should render not complete', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TaskDate isComplete={false} taskDate={notLateDueDate} />
      </ThemeProvider>,
    );

    expect(getByText('Oct 12, 21')).toHaveStyle('color: #383F43');
  });

  it('should render complete', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TaskDate isComplete={true} taskDate={notLateDueDate} />
      </ThemeProvider>,
    );

    expect(getByText('Oct 12, 21')).toHaveStyle('color: #9C9FA1');
  });

  it('should render late', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TaskDate isComplete={false} taskDate={lateDueDate} />
      </ThemeProvider>,
    );

    expect(getByText('Oct 12, 19')).toHaveStyle('color: #991313');
  });

  it('should not render year', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TaskDate isComplete={false} taskDate={currentDate} />
      </ThemeProvider>,
    );

    expect(getByText('Oct 12')).toBeInTheDocument();
  });
});
