import React from 'react';
import { render } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useSession } from 'next-auth/client';
import { ExportFormatEnum } from '../../../../../../../graphql/types.generated';
import ExportPhysical from './ExportPhysical';
import { createExportedContactsMock } from './ExportPhysical.mock';

const accountListId = '111';
const token = 'someToken1234';
const handleClose = jest.fn();

jest.mock('next-auth/client');

describe('ExportPhysical', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue([
      {
        user: {
          token,
        },
      },
      false,
    ]);
  });

  it('default', () => {
    const { queryByText } = render(
      <MockedProvider
        mocks={[
          createExportedContactsMock(
            ExportFormatEnum.Csv,
            false,
            accountListId,
          ),
        ]}
      >
        <ExportPhysical
          accountListId={accountListId}
          handleClose={handleClose}
        />
      </MockedProvider>,
    );
    expect(queryByText('Export Contacts')).toBeInTheDocument();
  });
});
