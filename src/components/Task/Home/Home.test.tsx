import React from 'react';
import { ThemeProvider } from '@mui/material';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import { getDataForTaskDrawerMock } from '../Drawer/Form/Form.mock';
import { render } from '../../../../__tests__/util/testingLibraryReactMock';
import {
  getTasksForTaskListMock,
  getFilteredTasksForTaskListMock,
} from '../List/List.mock';
import { ActivityTypeEnum } from '../../../../graphql/types.generated';
import theme from '../../../theme';
import TaskHome from '.';

const accountListId = 'abc';

jest.mock('next/router', () => ({
  useRouter: () => {
    return {
      query: { accountListId },
      isReady: true,
    };
  },
}));

describe('TaskHome', () => {
  it('has correct defaults', async () => {
    const mocks = [
      getTasksForTaskListMock(accountListId),
      getDataForTaskDrawerMock(accountListId),
    ];
    const { findByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <TaskHome />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(
      await findByText('On the Journey with the Johnson Family'),
    ).toBeInTheDocument();
  });

  it('has correct overrides', async () => {
    const filter = {
      accountListId,
      activityType: [ActivityTypeEnum.Appointment],
      completed: true,
      tags: ['tag-1', 'tag-2'],
      userIds: ['user-1'],
      contactIds: ['contact-1'],
      wildcardSearch: 'journey',
    };
    const { findByText } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper
          mocks={[
            getFilteredTasksForTaskListMock(accountListId, filter),
            getDataForTaskDrawerMock(accountListId),
          ]}
        >
          <TaskHome initialFilter={filter} />
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(
      await findByText('On the Journey with the Johnson Family'),
    ).toBeInTheDocument();
  });
});
