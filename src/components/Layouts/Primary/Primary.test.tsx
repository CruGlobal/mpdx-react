import React from 'react';
import { render } from '@testing-library/react';
import matchMediaMock from '../../../../__tests__/util/matchMediaMock';
import TestWrapper from '../../../../__tests__/util/TestWrapper';
import { getNotificationsMocks } from './TopBar/Items/NotificationMenu/NotificationMenu.mock';

import { getTopBarMock } from './TopBar/TopBar.mock';
import Primary from '.';

describe('Primary', () => {
  let mocks;
  beforeEach(() => {
    mocks = [...getNotificationsMocks(), getTopBarMock()];
    matchMediaMock({ width: '1024px' });
  });

  it('has correct defaults', () => {
    const { getByTestId, getByRole } = render(
      <TestWrapper
        mocks={mocks}
        initialState={{ accountListId: '1', breadcrumb: 'Dashboard' }}
      >
        <Primary>
          <div data-testid="PrimaryTestChildren"></div>
        </Primary>
      </TestWrapper>,
    );
    expect(getByTestId('PrimaryTestChildren')).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Dashboard' })).toBeVisible();
    expect(getByRole('menuitem', { name: 'Contacts' })).toBeVisible();
    expect(getByRole('menuitem', { name: 'Reports' })).toBeVisible();
    expect(getByRole('menuitem', { name: 'Tools' })).toBeVisible();
    expect(getByRole('menuitem', { name: 'Coaches' })).toBeVisible();
  });
});
