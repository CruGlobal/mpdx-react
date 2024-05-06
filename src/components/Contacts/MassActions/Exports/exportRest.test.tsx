import { waitFor } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import { exportRest } from './exportRest';

const accountListId = '111';
const ids = ['1', '2', '3'];
const fileType = 'csv';
const mailing = false;
const template = null;
const sort = null;
const apiToken = 'BearerToken123';
fetchMock.enableMocks();

global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

const file = 'Contact Name,Greeting\r\nJohn Doe, Mr\r\nJane Doe, Mrs\r\n';

describe('exportRest()', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    fetchMock.mockResponses(
      [
        JSON.stringify({
          data: {
            id: 'abc123',
          },
        }),
        { status: 200 },
      ],
      [file, { status: 200 }],
    );
    process.env.REST_API_URL = 'https://api.stage.mpdx.org/api/v2/';
  });

  it('Default with CSV', async () => {
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    await exportRest(
      apiToken,
      accountListId,
      ids,
      fileType,
      mailing,
      template,
      sort,
    );

    await waitFor(() => {
      expect(fetchMock.mock.calls[0][0]).toEqual(
        'https://api.stage.mpdx.org/api/v2/contacts/exports',
      );
    });

    const {
      data: { attributes },
    } = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
    const filters = attributes.params.filter;
    expect(filters.account_list_id).toEqual(accountListId);
    expect(filters.any_tags).toEqual(false);
    expect(filters.ids).toEqual(ids);

    await waitFor(() => {
      expect(fetchMock.mock.calls[1][0]).toEqual(
        `https://api.stage.mpdx.org/api/v2/contacts/exports/abc123.csv?access_token=${apiToken}`,
      );
    });

    expect((fetchMock.mock.calls[1][1]?.headers ?? {})['Content-Type']).toEqual(
      'text/csv',
    );

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  it('sends requests to mailing', async () => {
    await exportRest(
      apiToken,
      accountListId,
      ids,
      'xlsx',
      !mailing,
      template,
      sort,
    );

    await waitFor(() => {
      expect(fetchMock.mock.calls[1][0]).toEqual(
        `https://api.stage.mpdx.org/api/v2/contacts/exports/mailing/abc123.xlsx?access_token=${apiToken}`,
      );
    });
  });

  it('XLSX', async () => {
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    await exportRest(
      apiToken,
      accountListId,
      ids,
      'xlsx',
      mailing,
      template,
      sort,
    );

    expect((fetchMock.mock.calls[1][1]?.headers ?? {})['Content-Type']).toEqual(
      'application/xlsx',
    );
  });

  it('PDF', async () => {
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    await exportRest(
      apiToken,
      accountListId,
      ids,
      'pdf',
      mailing,
      template,
      sort,
    );

    expect((fetchMock.mock.calls[1][1]?.headers ?? {})['Content-Type']).toEqual(
      'text/pdf',
    );
  });
});

describe('exportRest() Returns errors', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    process.env.REST_API_URL = 'https://api.stage.mpdx.org/api/v2/';
  });

  it('should return an error when fetch file fails', async () => {
    fetchMock.mockResponse(
      JSON.stringify({
        data: {
          id: 'abc123',
        },
      }),
      { status: 200 },
    );
    fetchMock.mockReject(new Error('Unknown Error'));

    expect(global.URL.createObjectURL).not.toHaveBeenCalled();

    try {
      await exportRest(
        apiToken,
        accountListId,
        ids,
        'pdf',
        mailing,
        template,
        sort,
      );
    } catch (err) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect((err as Error).message).toEqual('Error: Unknown Error');
    }
  });
});
