import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useSession } from 'next-auth/client';
import userEvent from '@testing-library/user-event';
// import { renderHook } from '@testing-library/react-hooks';
import {
  ExportFormatEnum,
  // ExportLabelTypeEnum,
  // ExportSortEnum,
} from '../../../../../../../graphql/types.generated';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import ExportPhysical from './ExportPhysical';
import { createExportedContactsMock } from './ExportPhysical.mock';
import {
  CreateExportedContactsMutation,
  // useCreateExportedContactsMutation,
} from './ExportPhysical.generated';

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
    const { getByText } = render(
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
    expect(getByText('Export Contacts')).toBeInTheDocument();
  });

  describe('Exporting Contacts', () => {
    const { location } = window;

    beforeAll(() => {
      // Have to ignore TS complaining about deleting window.location because location is not optional
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete window.location;
      window.location = { ...location, replace: jest.fn() };
    });

    afterAll(() => {
      window.location = location;
    });

    it('Exports Contacts and Downloads File', async () => {
      const url = 'someRandomUrlToFile';
      const mocks = {
        CreateExportedContacts: {
          exportContacts: url,
        },
      };
      const { getByText } = render(
        <GqlMockedProvider<CreateExportedContactsMutation> mocks={mocks}>
          <ExportPhysical
            accountListId={accountListId}
            handleClose={handleClose}
          />
        </GqlMockedProvider>,
      );
      userEvent.click(getByText('Advanced CSV'));
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          `${url}?access_token=${token}`,
        ),
      );
    });
  });

  describe('Exporting Contacts Mutation', () => {
    // it('Exports Contacts - PDF of Mail Merged Labels', async () => {
    //   const { result, waitForNextUpdate } = renderHook(
    //     () =>
    //       useCreateExportedContactsMutation({
    //         variables: {
    //           input: {
    //             mailing: false,
    //             format: ExportFormatEnum.Pdf,
    //             accountListId,
    //             labelType: ExportLabelTypeEnum.Avery5160,
    //             sort: ExportSortEnum.Name,
    //           },
    //         },
    //       }),
    //     { wrapper: GqlMockedProvider },
    //   );
    //   await waitForNextUpdate();
    //   expect(result.current[1].data?.exportContacts).toMatchInlineSnapshot(``);
    // });
    // it('Exports Contacts - CSV For Mail Merge', async () => {
    //   const { result, waitForNextUpdate } = renderHook(
    //     () =>
    //       useCreateExportedContactsMutation({
    //         variables: {
    //           input: {
    //             mailing: true,
    //             format: ExportFormatEnum.Csv,
    //             accountListId,
    //           },
    //         },
    //       }),
    //     { wrapper: GqlMockedProvider },
    //   );
    //   await waitForNextUpdate();
    //   expect(result.current[1].data?.exportContacts).toMatchInlineSnapshot(``);
    //   expect(result.current[1].called).toBeTruthy();
    // });
    // it('Exports - Advanced CSV', async () => {
    //   const { result, waitForNextUpdate } = renderHook(
    //     () =>
    //       useCreateExportedContactsMutation({
    //         variables: {
    //           input: {
    //             mailing: false,
    //             format: ExportFormatEnum.Csv,
    //             accountListId,
    //           },
    //         },
    //       }),
    //     { wrapper: GqlMockedProvider },
    //   );
    //   await waitForNextUpdate();
    //   expect(result.current[1].data?.exportContacts).toMatchInlineSnapshot(``);
    //   expect(result.current[1].called).toBeTruthy();
    // });
    // it('Exports - Advanced Exel(XLSX)', async () => {
    //   const { result, waitForNextUpdate } = renderHook(
    //     () =>
    //       useCreateExportedContactsMutation({
    //         variables: {
    //           input: {
    //             mailing: false,
    //             format: ExportFormatEnum.Xlsx,
    //             accountListId,
    //           },
    //         },
    //       }),
    //     { wrapper: GqlMockedProvider },
    //   );
    //   await waitForNextUpdate();
    //   expect(result.current[1].data?.exportContacts).toMatchInlineSnapshot(``);
    //   expect(result.current[1].called).toBeTruthy();
    // });
  });
});
