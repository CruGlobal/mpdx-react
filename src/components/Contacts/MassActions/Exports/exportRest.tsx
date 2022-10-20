import { DateTime } from 'luxon';

interface restExportFields {
  type: string;
  attributes: {
    params: {
      filter: {
        account_list_id: string;
        any_tags: boolean;
        ids: string[];
      };
      template?: string;
      sort?: string;
    };
  };
}

export const exportRest = (
  accountListId: string,
  ids: string[],
  token: string,
  fileType: 'csv' | 'xlsx' | 'pdf',
  mailing = false,
  template = null,
  sort = null,
): void => {
  const exportPath = `contacts/exports${mailing ? '/mailing' : ''}`;
  const contentType =
    fileType === 'csv'
      ? 'text/csv'
      : fileType === 'xlsx'
      ? 'application/xlsx'
      : 'text/pdf';

  const fields: restExportFields = {
    type: 'export_logs',
    attributes: {
      params: {
        filter: {
          account_list_id: accountListId,
          any_tags: false,
          ids,
        },
      },
    },
  };

  if (template && sort) {
    fields.attributes.params.template = template;
    fields.attributes.params.sort = sort;
  }

  fetch(`${process.env.REST_API_URL}${exportPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/vnd.api+json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      data: fields,
    }),
  })
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      fetch(
        `${process.env.REST_API_URL}${exportPath}/${res.data.id}.${fileType}?access_token=${token}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': contentType,
          },
        },
      )
        .then((response) => response.blob())
        .then((blob) => URL.createObjectURL(blob))
        .then((url) => {
          const a = document.createElement('a');
          a.href = url;
          a.download = `contacts-${DateTime.now().toLocaleString({
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}`;
          a.click();
          URL.revokeObjectURL(url);
          a.remove();
        });
    });
};
