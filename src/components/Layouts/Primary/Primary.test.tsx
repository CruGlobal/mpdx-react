import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@material-ui/core';
import * as nextRouter from 'next/router';
import matchMediaMock from '../../../../__tests__/util/matchMediaMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import theme from '../../../theme';
import { getNotificationsMocks } from './TopBar/Items/NotificationMenu/NotificationMenu.mock';

import { getTopBarMock } from './TopBar/TopBar.mock';
import Primary from '.';

describe('Primary', () => {
  const useRouter = jest.spyOn(nextRouter, 'useRouter');
  const mocks = [...getNotificationsMocks(), getTopBarMock()];
  beforeEach(() => {
    matchMediaMock({ width: '1024px' });
    (useRouter as jest.SpyInstance<
      Pick<nextRouter.NextRouter, 'query' | 'isReady'>
    >).mockImplementation(() => ({
      query: { accountListId: 'accountListId' },
      isReady: true,
    }));
  });

  it('has correct defaults', () => {
    const { getByTestId, getByRole } = render(
      <ThemeProvider theme={theme}>
        <TestWrapper mocks={mocks}>
          <Primary>
            <div data-testid="PrimaryTestChildren"></div>
          </Primary>
        </TestWrapper>
      </ThemeProvider>,
    );
    expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Dashboard' })).toBeVisible();
    expect(getByRole('menuitem', { name: 'Contacts' })).toBeVisible();
    expect(getByRole('menuitem', { name: 'Reports' })).toBeVisible();
    expect(getByRole('menuitem', { name: 'Tools' })).toBeVisible();
    expect(getByRole('menuitem', { name: 'Coaches' })).toBeVisible();
  });
});
