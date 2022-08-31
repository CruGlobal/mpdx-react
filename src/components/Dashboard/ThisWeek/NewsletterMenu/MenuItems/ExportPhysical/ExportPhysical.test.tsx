import React from 'react';
import { render, waitFor, within } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import userEvent from '@testing-library/user-event';
import { MuiThemeProvider } from '@mui/material';
import {
  ExportFormatEnum,
  ExportLabelTypeEnum,
  ExportSortEnum,
} from '../../../../../../../graphql/types.generated';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import ExportPhysical from './ExportPhysical';
import { CreateExportedContactsMutation } from './ExportPhysical.generated';

const accountListId = '111';
const apiToken = 'someToken1234';
const handleClose = jest.fn();

jest.mock('next-auth/react');

describe('ExportPhysical', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          apiToken,
        },
      },
      status: 'authenticated',
    });
  });

  const mocks = {
    CreateExportedContacts: {
      exportContacts: 'someRandomUrlToFile/abc1234',
    },
  };

  it('default', () => {
    const { getByText } = render(
      <MuiThemeProvider theme={theme}>
        <GqlMockedProvider<CreateExportedContactsMutation> mocks={mocks}>
          <ExportPhysical
            accountListId={accountListId}
            handleClose={handleClose}
          />
        </GqlMockedProvider>
      </MuiThemeProvider>,
    );
    expect(getByText('Export Contacts')).toBeInTheDocument();
  });

  it('handles closing menu', () => {
    const { getByRole } = render(
      <MuiThemeProvider theme={theme}>
        <GqlMockedProvider<CreateExportedContactsMutation> mocks={mocks}>
          <ExportPhysical
            accountListId={accountListId}
            handleClose={handleClose}
          />
        </GqlMockedProvider>
      </MuiThemeProvider>,
    );
    userEvent.click(getByRole('button', { hidden: true, name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Exporting Contacts', () => {
    const { location } = window;

    const url = 'someRandomUrlToFile/abc1234';
    const createMock = (format: ExportFormatEnum) => {
      return {
        CreateExportedContacts: {
          exportContacts: `${url}.${format}`,
        },
      };
    };

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

    it('Exports Contacts and Downloads File - PDF of Mail Merged Labels | Avery5160 and Contact Name', async () => {
      const { getByText, getByTestId } = render(
        <MuiThemeProvider theme={theme}>
          <GqlMockedProvider<CreateExportedContactsMutation>
            mocks={createMock(ExportFormatEnum.Pdf)}
          >
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </MuiThemeProvider>,
      );
      userEvent.click(getByText('PDF of Mail Merged Labels'));
      // value of the select is held in a child Input element, so we must reference that element for the value
      expect(getByTestId('label-template-select').childNodes[1]).toHaveValue(
        ExportLabelTypeEnum.Avery5160,
      );
      expect(getByTestId('sort-by-select').childNodes[1]).toHaveValue(
        ExportSortEnum.Name,
      );

      userEvent.click(getByText('Export'));
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          `${url}.${ExportFormatEnum.Pdf}?access_token=${apiToken}`,
        ),
      );
    });

    it('Exports Contacts and Downloads File - PDF of Mail Merged Labels | Avery7160 and Zip', async () => {
      const { getByText, getByTestId, getByLabelText, getByRole } = render(
        <MuiThemeProvider theme={theme}>
          <GqlMockedProvider<CreateExportedContactsMutation>
            mocks={createMock(ExportFormatEnum.Pdf)}
          >
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </MuiThemeProvider>,
      );

      userEvent.click(getByText('PDF of Mail Merged Labels'));
      //  material ui selects do not use actual Select elements in the DOM
      //  reference https://stackoverflow.com/a/61491607
      userEvent.click(getByLabelText('Label Template'));
      const listBox1 = within(getByRole('listbox'));
      userEvent.click(listBox1.getByText('Avery 7160'));
      // value of the select is held in a child Input element, so we must reference that element for the value
      expect(getByTestId('label-template-select').childNodes[1]).toHaveValue(
        ExportLabelTypeEnum.Avery7160,
      );

      userEvent.click(getByLabelText('Sort By'));
      const listBox2 = within(getByRole('listbox'));
      userEvent.click(listBox2.getByText('Zip'));
      expect(getByTestId('sort-by-select').childNodes[1]).toHaveValue(
        ExportSortEnum.Zip,
      );

      userEvent.click(getByText('Export'));
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          `${url}.${ExportFormatEnum.Pdf}?access_token=${apiToken}`,
        ),
      );
    });

    it('Exports Contacts and Downloads File - CSV For Mailing', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <GqlMockedProvider<CreateExportedContactsMutation>
            mocks={createMock(ExportFormatEnum.Csv)}
          >
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </MuiThemeProvider>,
      );
      userEvent.click(getByText('CSV for Mail Merge'));
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          `${url}.${ExportFormatEnum.Csv}?access_token=${apiToken}`,
        ),
      );
    });

    it('Exports Contacts and Downloads File - Advanced CSV', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <GqlMockedProvider<CreateExportedContactsMutation>
            mocks={createMock(ExportFormatEnum.Csv)}
          >
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </MuiThemeProvider>,
      );
      userEvent.click(getByText('Advanced CSV'));
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          `${url}.${ExportFormatEnum.Csv}?access_token=${apiToken}`,
        ),
      );
    });

    it('Exports Contacts and Downloads File - Advanced Excel (XLSX)', async () => {
      const { getByText } = render(
        <MuiThemeProvider theme={theme}>
          <GqlMockedProvider<CreateExportedContactsMutation>
            mocks={createMock(ExportFormatEnum.Xlsx)}
          >
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </MuiThemeProvider>,
      );
      userEvent.click(getByText('Advanced Excel (XLSX)'));
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          `${url}.${ExportFormatEnum.Xlsx}?access_token=${apiToken}`,
        ),
      );
    });
  });
});
