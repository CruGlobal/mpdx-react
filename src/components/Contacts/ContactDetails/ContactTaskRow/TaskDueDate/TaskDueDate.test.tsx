import { MuiThemeProvider } from '@material-ui/core';
import { render } from '@testing-library/react';
import { DateTime } from 'luxon';
import React from 'react';
import theme from '../../../../../theme';
import { TaskDueDate } from './TaskDueDate';

const notLateDueDate = DateTime.local(2021, 10, 12);
const lateDueDate = DateTime.local(2019, 10, 12);

describe('TaskCommentsButton', () => {
  it('should render not complete', async () => {
    const { queryByText } = render(
      <MuiThemeProvider theme={theme}>
        <TaskDueDate isComplete={false} dueDate={notLateDueDate} />
      </MuiThemeProvider>,
    );

    const dateText = queryByText(notLateDueDate.toFormat('MMM dd'));

    expect(dateText).toBeInTheDocument();

    const style = dateText && window.getComputedStyle(dateText);

    expect(style?.color).toMatchInlineSnapshot(`"rgb(56, 63, 67)"`);
  });

  it('should render complete', async () => {
    const { queryByText } = render(
      <MuiThemeProvider theme={theme}>
        <TaskDueDate isComplete={true} dueDate={notLateDueDate} />
      </MuiThemeProvider>,
    );

    const dateText = queryByText(notLateDueDate.toFormat('MMM dd'));

    expect(dateText).toBeInTheDocument();

    const style = dateText && window.getComputedStyle(dateText);

    expect(style?.color).toMatchInlineSnapshot(`"rgb(156, 159, 161)"`);
  });

  it('should render late', async () => {
    const { queryByText } = render(
      <MuiThemeProvider theme={theme}>
        <TaskDueDate isComplete={false} dueDate={lateDueDate} />
      </MuiThemeProvider>,
    );

    const dateText = queryByText(notLateDueDate.toFormat('MMM dd'));

    expect(dateText).toBeInTheDocument();

    const style = dateText && window.getComputedStyle(dateText);

    expect(style?.color).toMatchInlineSnapshot(`"rgb(244, 67, 54)"`);
  });
});
