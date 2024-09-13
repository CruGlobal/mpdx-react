import { useEffect, useState } from 'react';
import { invert } from 'lodash';
import { getSession } from 'next-auth/react';
import { TFunction } from 'react-i18next';
import { fetchAllData } from 'src/lib/deserializeJsonApi';
import { CsvImportType } from './CsvImportContext';

export const uploadFile = async ({
  accountListId,
  file,
  t,
}: {
  accountListId: string;
  file: File;
  t: TFunction;
}): Promise<object> => {
  const errorMessage = t(
    'Invalid CSV file - See help docs or send us a message with your CSV attached',
  );
  const form = new FormData();
  form.append('accountListId', accountListId);
  form.append('file', file);
  const response = await fetch('/api/uploads/csv-upload', {
    method: 'POST',
    body: form,
  }).catch(() => {
    throw new Error(errorMessage);
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(errorMessage);
  } else {
    return data.data;
  }
};

export const includeParam =
  'sample_contacts,sample_contacts.addresses,sample_contacts.primary_person,sample_contacts.primary_person.email_addresses,sample_contacts.primary_person.phone_numbers,sample_contacts.spouse,sample_contacts.spouse.email_addresses,sample_contacts.spouse.phone_numbers';

export const saveFile = async ({
  accountListId,
  initialData,
  uploadData,
  t,
}: {
  accountListId: string;
  initialData: CsvImportType;
  uploadData: CsvImportType;
  t: TFunction;
}): Promise<CsvImportType> => {
  const errorMessage = t(
    'Unable to save your CSV import settings - See help docs or send us a message with your CSV attached',
  );

  let tagListString = '';
  if (uploadData.tagList && Array.isArray(uploadData.tagList)) {
    tagListString = uploadData.tagList.join(',');
  }

  const patchedData = {
    ...uploadData,
    tagList: tagListString,
    fileHeadersMappings: invert(uploadData.fileHeadersMappings),
  };

  const form = new FormData();
  form.append('accountListId', accountListId);
  form.append('csvFileId', uploadData.id);
  form.append('initialData', JSON.stringify(initialData));
  form.append('patchedData', JSON.stringify(patchedData));
  form.append('include', includeParam);

  const response = await fetch('/api/csv-update', {
    method: 'PUT',
    body: form,
  }).catch(() => {
    throw new Error(errorMessage);
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(errorMessage);
  } else {
    return fetchAllData(data.data, data.included) as CsvImportType;
  }
};

export const getFile = async ({
  accountListId,
  csvFileId,
}: {
  accountListId: string;
  csvFileId: string;
}): Promise<CsvImportType> => {
  const session = await getSession();
  const apiToken = session?.user?.apiToken;

  const response = await fetch(
    `${process.env.REST_API_URL}account_lists/${accountListId}/imports/csv/${csvFileId}?include=${includeParam}`,
    {
      method: 'GET',
      headers: {
        authorization: `Bearer ${apiToken}`,
        'content-type': 'application/vnd.api+json',
      },
    },
  ).catch(() => {
    throw new Error('Failed to get CSV File');
  });

  const data = await response.json();
  const attributes = fetchAllData(data.data, data.included);

  if (response.status !== 200) {
    throw new Error('Failed to get CSV File');
  } else {
    return attributes as CsvImportType;
  }
};

//TODO: Refactor to use the API
export const getMaxFileSize = (): number => {
  return 150;
};

export const useSupportedHeaders = () => {
  const hardCodedSupportedHeaders = {
    church: 'Church',
    city: 'City',
    pledge_amount: 'Commitment Amount',
    pledge_currency: 'Commitment Currency',
    pledge_frequency: 'Commitment Frequency',
    country: 'Country',
    email_1: 'Email 1',
    email_2: 'Email 2',
    envelope_greeting: 'Envelope Greeting',
    first_name: 'First Name',
    full_name: 'Full Name',
    greeting: 'Greeting',
    last_name: 'Last Name',
    likely_to_give: 'Likely To Give',
    metro_area: 'Metro Area',
    newsletter: 'Newsletter',
    notes: 'Notes',
    phone_1: 'Phone 1',
    phone_2: 'Phone 2',
    phone_3: 'Phone 3',
    relationship_code: 'Relationship Code',
    referred_by: 'Connecting Partner',
    region: 'Region',
    send_appeals: 'Send Appeals?',
    spouse_email: 'Spouse Email',
    spouse_first_name: 'Spouse First Name',
    spouse_last_name: 'Spouse Last Name',
    spouse_phone: 'Spouse Phone',
    state: 'State',
    status: 'Status',
    street: 'Street',
    tags: 'Tags',
    website: 'Website',
    zip: 'Zip',
  };

  const [supportedHeaders, setSupportedHeaders] = useState(
    hardCodedSupportedHeaders,
  );

  useEffect(() => {
    const determineSupportedHeaders = () => {
      //TODO: Get this from Constants API
      setSupportedHeaders(hardCodedSupportedHeaders);
    };

    return () => {
      if (!supportedHeaders) {
        determineSupportedHeaders();
      }
    };
  }, []);

  return supportedHeaders;
};

export const useRequiredHeaders = () => {
  const hardCodedRequiredHeaders = ['first_name', 'last_name', 'full_name'];

  const [requiredHeaders, setRequiredHeaders] = useState(
    hardCodedRequiredHeaders,
  );

  useEffect(() => {
    const determineRequiredHeaders = () => {
      //TODO: Get this from Constants API (the hardCoded values will be added to the list returned from the API to match the Angular version)
      setRequiredHeaders(hardCodedRequiredHeaders);
    };

    return () => {
      if (!requiredHeaders) {
        determineRequiredHeaders();
      }
    };
  }, []);

  return requiredHeaders;
};
