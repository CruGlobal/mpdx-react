interface RestExportFields {
  type: string;
  attributes: {
    params: {
      filter: {
        account_list_id: string;
        any_tags: boolean;
        ids: string[];
      };
      type?: string;
      sort?: string;
    };
  };
}

export const exportRest = async (
  apiToken: string,
  accountListId: string,
  ids: string[],
  fileType: 'csv' | 'xlsx' | 'pdf',
  mailing = false,
  template = null,
  sort = null,
): Promise<void> => {
  try {
    const exportPath = `contacts/exports${mailing ? '/mailing' : ''}`;
    const contentType =
      fileType === 'csv'
        ? 'text/csv'
        : fileType === 'xlsx'
        ? 'application/xlsx'
        : 'text/pdf';

    const fields: RestExportFields = {
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
      fields.attributes.params.type = template;
      fields.attributes.params.sort = sort;
    }

    return fetch(`${process.env.REST_API_URL}${exportPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        data: fields,
      }),
    })
      .then((res) => res.json())
      .then((res) =>
        fetch(
          `${process.env.REST_API_URL}${exportPath}/${res.data.id}.${fileType}?access_token=${apiToken}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': contentType,
            },
          },
        ),
      )
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contacts-${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })}.${fileType}`;
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
      })
      .catch((err) => {
        throw new Error(err);
      });
  } catch (err) {
    throw new Error((err as Error).message);
  }
};
