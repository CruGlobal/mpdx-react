import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import { AppState } from '../../../App/rootReducer';
import { useApp } from '../../../App';
import { getNotificationsMocks } from './Items/NotificationMenu/NotificationMenu.mock';
import { getTopBarMultipleMock } from './TopBar.mock';
import TopBar from './TopBar';

let state: AppState;
const dispatch = jest.fn();

jest.mock('../../../App', () => ({
  useApp: jest.fn(),
}));

describe('TopBar', () => {
  let mocks;
  beforeEach(() => {
    mocks = [getTopBarMultipleMock(), ...getNotificationsMocks()];
    state = { accountListId: null, breadcrumb: null };
    (useApp as jest.Mock).mockReturnValue({
      state,
      dispatch,
    });
  });

  it('has correct defaults', () => {
    const { queryByText, getByTestId } = render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <TopBar />
      </MockedProvider>,
    );
    userEvent.click(getByTestId('profileMenuButton'));
    expect(queryByText('Manage Organizations')).not.toBeInTheDocument();
    expect(queryByText('Admin Console')).not.toBeInTheDocument();
    expect(queryByText('Backend Admin')).not.toBeInTheDocument();
    expect(queryByText('Sidekiq')).not.toBeInTheDocument();
  });
});
