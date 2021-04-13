import React from 'react';
import { render } from '@testing-library/react';
import ExportPhysical from './ExportPhysical';

const accountListId = '111';
const handleClose = jest.fn();

describe('ExportPhysical', () => {
  it('default', () => {
    const { queryByText } = render(
      <ExportPhysical
        accountListId={accountListId}
        handleClose={handleClose}
      />,
    );
    expect(queryByText('Export Contacts')).toBeInTheDocument();
  });
});
