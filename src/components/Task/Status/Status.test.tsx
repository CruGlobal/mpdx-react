import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useTaskModal from '../../../hooks/useTaskModal';
import theme from '../../../theme';
import { TaskModalEnum } from '../Modal/TaskModal';
import TaskStatus from '.';

jest.mock('../../../hooks/useTaskModal');

const openTaskModal = jest.fn();

// jsdom ignores pseudo elements in getComputedStyle, so read the rule
// for something like `.css-abc::before` straight from the page's style sheets
const pseudoElementStyles = (
  element: Element,
  pseudoElement: string,
): Record<string, string> => {
  const selectors = Array.from(element.classList).map(
    (className) => `.${className}${pseudoElement}`,
  );
  const styles: Record<string, string> = {};
  Array.from(document.styleSheets).forEach((sheet) => {
    Array.from(sheet.cssRules).forEach((cssRule) => {
      if (
        cssRule instanceof CSSStyleRule &&
        selectors.includes(cssRule.selectorText)
      ) {
        Array.from(cssRule.style).forEach((property) => {
          styles[property] = cssRule.style.getPropertyValue(property);
        });
      }
    });
  });
  return styles;
};

beforeEach(() => {
  (useTaskModal as jest.Mock).mockReturnValue({
    openTaskModal,
    preloadTaskModal: jest.fn(),
  });
});

describe('TaskStatus', () => {
  it('default', async () => {
    const { getByRole, findByText } = render(
      <ThemeProvider theme={theme}>
        <TaskStatus />
      </ThemeProvider>,
    );
    userEvent.hover(getByRole('button'));
    expect(await findByText('No Due Date')).toBeInTheDocument();
  });

  it('completedAt', async () => {
    const { getByRole, findByText } = render(
      <ThemeProvider theme={theme}>
        <TaskStatus completedAt="2009-12-31T11:00:00.000Z" />
      </ThemeProvider>,
    );
    userEvent.hover(getByRole('button'));
    expect(await findByText('Completed 10 years ago')).toBeInTheDocument();
  });

  it('startAt in past', async () => {
    const { getByRole, findByText } = render(
      <ThemeProvider theme={theme}>
        <TaskStatus startAt="2009-12-31T11:00:00.000Z" />
      </ThemeProvider>,
    );
    userEvent.hover(getByRole('button'));
    expect(await findByText('Overdue 10 years ago')).toBeInTheDocument();
  });

  it('startAt in future', async () => {
    const { getByRole, findByText } = render(
      <ThemeProvider theme={theme}>
        <TaskStatus startAt="2050-12-31T11:00:00.000Z" />
      </ThemeProvider>,
    );
    userEvent.hover(getByRole('button'));
    expect(await findByText('Due in 30 years')).toBeInTheDocument();
  });

  it('taskId', async () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <TaskStatus taskId="task-1" />
      </ThemeProvider>,
    );
    userEvent.click(getByRole('button'));
    await waitFor(() =>
      expect(openTaskModal).toHaveBeenCalledWith({
        taskId: 'task-1',
        view: TaskModalEnum.Complete,
      }),
    );
  });

  describe('complete button', () => {
    const renderCompleteButton = () => {
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <TaskStatus taskId="task-1" />
        </ThemeProvider>,
      );
      return getByRole('button', { name: 'No Due Date' });
    };

    it('keeps the small green circle look', () => {
      const button = renderCompleteButton();

      // 16px is the declared size. With the 8px padding and 2px border the
      // circle renders at 20px on screen.
      expect(button).toHaveStyle({
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        borderWidth: '2px',
        borderStyle: 'solid',
        borderColor: theme.palette.mpdxGreen.main,
        backgroundColor: theme.palette.common.white,
      });
    });

    it('has a tap area of at least 44px centered on the circle', () => {
      const button = renderCompleteButton();

      // The tap area hangs off the button, so the button has to be the box it
      // is placed in and must not clip it
      expect(button).toHaveStyle({ position: 'relative' });
      expect(button).not.toHaveStyle({ overflow: 'hidden' });

      const tapArea = pseudoElementStyles(button, '::before');
      expect(tapArea).toMatchObject({
        content: expect.stringMatching(/^(""|'')$/),
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      });
      expect(parseFloat(tapArea.width)).toBeGreaterThanOrEqual(44);
      expect(parseFloat(tapArea.height)).toBeGreaterThanOrEqual(44);
    });

    it('keeps the tap area behind the check icon so the due date title still shows', () => {
      const { getByRole } = render(
        <ThemeProvider theme={theme}>
          <TaskStatus taskId="task-1" startAt="2009-12-31T11:00:00.000Z" />
        </ThemeProvider>,
      );
      const button = getByRole('button', { name: 'Overdue 10 years ago' });

      // The due date title lives on the icon, so the icon has to stay on top
      expect(
        within(button).getByRole('img', { name: 'Overdue 10 years ago' }),
      ).toBeInTheDocument();
      // z-index -1 puts the tap area behind the icon, and isolate keeps it
      // inside the button instead of behind the card
      expect(button).toHaveStyle({ isolation: 'isolate' });
      expect(pseudoElementStyles(button, '::before')).toMatchObject({
        'z-index': '-1',
      });
    });
  });
});
