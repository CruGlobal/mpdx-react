import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { render, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ExportFormatEnum,
  ExportLabelTypeEnum,
  ExportSortEnum,
} from 'src/graphql/types.generated';
import { GqlMockedProvider } from '../../../../../../../__tests__/util/graphqlMocking';
import theme from '../../../../../../theme';
import ExportPhysical from './ExportPhysical';
import { CreateExportedContactsMutation } from './ExportPhysical.generated';

const accountListId = '111';
const handleClose = jest.fn();
jest.mock('next-auth/react');

describe('ExportPhysical', () => {
  beforeEach(() => {
    process.env.SITE_URL = 'http://localhost:3000';
  });
  const mocks = {
    CreateExportedContacts: {
      exportContacts: 'someRandomUrlToFile/abc1234',
    },
  };

  it('default', () => {
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          CreateExportedContacts: CreateExportedContactsMutation;
        }>
          mocks={mocks}
        >
          <ExportPhysical
            accountListId={accountListId}
            handleClose={handleClose}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    expect(getByText('Export Contacts')).toBeInTheDocument();
  });

  it('handles closing menu', () => {
    const { getByRole } = render(
      <ThemeProvider theme={theme}>
        <GqlMockedProvider<{
          CreateExportedContacts: CreateExportedContactsMutation;
        }>
          mocks={mocks}
        >
          <ExportPhysical
            accountListId={accountListId}
            handleClose={handleClose}
          />
        </GqlMockedProvider>
      </ThemeProvider>,
    );
    userEvent.click(getByRole('button', { hidden: true, name: 'Close' }));
    expect(handleClose).toHaveBeenCalled();
  });

  describe('Exporting Contacts', () => {
    const url = 'someRandomUrlToFile/abc1234';
    const createMock = (format: ExportFormatEnum) => {
      return {
        CreateExportedContacts: {
          exportContacts: `${url}.${format}`,
        },
      };
    };

    it('Exports Contacts and Downloads File - PDF of Mail Merged Labels | Avery5160 and Contact Name', async () => {
      const { getByText, getByTestId } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            CreateExportedContacts: CreateExportedContactsMutation;
          }>
            mocks={createMock(ExportFormatEnum.Pdf)}
          >
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
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
          `${url}.${ExportFormatEnum.Pdf}?access_token=apiToken`,
        ),
      );
    });

    it('Exports Contacts and Downloads File - PDF of Mail Merged Labels | Avery7160 and Zip', async () => {
      const { getByText, getByTestId, getByLabelText, getByRole } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            CreateExportedContacts: CreateExportedContactsMutation;
          }>
            mocks={createMock(ExportFormatEnum.Pdf)}
          >
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
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
          `${url}.${ExportFormatEnum.Pdf}?access_token=apiToken`,
        ),
      );
    });

    it('Exports Contacts and Downloads File - CSV For Mailing', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            CreateExportedContacts: CreateExportedContactsMutation;
          }>
            mocks={createMock(ExportFormatEnum.Csv)}
          >
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
      );
      userEvent.click(getByText('CSV for Mail Merge'));
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          `${url}.${ExportFormatEnum.Csv}?access_token=apiToken`,
        ),
      );
    });

    it('Exports Contacts and Downloads File - Advanced CSV', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            CreateExportedContacts: CreateExportedContactsMutation;
          }>
            mocks={createMock(ExportFormatEnum.Csv)}
          >
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
      );
      userEvent.click(getByText('Advanced CSV'));
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          `${url}.${ExportFormatEnum.Csv}?access_token=apiToken`,
        ),
      );
    });

    it('Exports Contacts and Downloads File - Advanced Excel (XLSX)', async () => {
      const { getByText } = render(
        <ThemeProvider theme={theme}>
          <GqlMockedProvider<{
            CreateExportedContacts: CreateExportedContactsMutation;
          }>
            mocks={createMock(ExportFormatEnum.Xlsx)}
          >
            <ExportPhysical
              accountListId={accountListId}
              handleClose={handleClose}
            />
          </GqlMockedProvider>
        </ThemeProvider>,
      );
      userEvent.click(getByText('Advanced Excel (XLSX)'));
      await waitFor(() =>
        expect(window.location.replace).toHaveBeenCalledWith(
          `${url}.${ExportFormatEnum.Xlsx}?access_token=apiToken`,
        ),
      );
    });
  });
});
