import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import React from 'react';
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

    const dateText = getByText(notLateDueDate.toFormat('MMM dd, yy'));

    expect(dateText).toBeInTheDocument();

    const style = dateText && window.getComputedStyle(dateText);

    expect(style?.color).toMatchInlineSnapshot(`"rgb(56, 63, 67)"`);
  });

  it('should render complete', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TaskDate isComplete={true} taskDate={notLateDueDate} />
      </ThemeProvider>,
    );

    const dateText = getByText(notLateDueDate.toFormat('MMM dd, yy'));

    expect(dateText).toBeInTheDocument();

    const style = dateText && window.getComputedStyle(dateText);

    expect(style?.color).toMatchInlineSnapshot(`"rgb(156, 159, 161)"`);
  });

  it('should render late', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TaskDate isComplete={false} taskDate={lateDueDate} />
      </ThemeProvider>,
    );

    const dateText = getByText(lateDueDate.toFormat('MMM dd, yy'));

    expect(dateText).toBeInTheDocument();

    const style = dateText && window.getComputedStyle(dateText);

    expect(style?.color).toMatchInlineSnapshot(`"rgb(211, 47, 47)"`);
  });

  it('should not render year', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <TaskDate isComplete={false} taskDate={currentDate} />
      </ThemeProvider>,
    );

    const dateText = getByText(currentDate.toFormat('MMM dd'));
    expect(dateText).toBeInTheDocument();
  });
});
