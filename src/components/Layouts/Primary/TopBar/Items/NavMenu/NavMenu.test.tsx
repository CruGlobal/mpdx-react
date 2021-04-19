import React from 'react';
import { render } from '../../../../../../../__tests__/util/testingLibraryReactMock';
import TestWrapper from '../../../../../../../__tests__/util/TestWrapper';
import NavMenu from './NavMenu';

describe('NavMenu', () => {
  it('default', () => {
    const { getByRole } = render(
      <TestWrapper initialState={{ accountListId: '1' }}>
        <NavMenu />
      </TestWrapper>,
    );
    expect(getByRole('menuitem', { name: 'Dashboard' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Contacts' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Reports' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Tools' })).toBeInTheDocument();
    expect(getByRole('menuitem', { name: 'Coaches' })).toBeInTheDocument();
  });

  it('hidden', () => {
    const { queryByRole } = render(
      <TestWrapper initialState={{}}>
        <NavMenu />
      </TestWrapper>,
    );
    expect(queryByRole('menuitem')).toBeNull();
  });
});
