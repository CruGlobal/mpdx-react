import { CsvImportType } from './CsvImportContext';

export const constants = {
  newsletter: [
    {
      id: 'Physical',
      value: 'Physical',
    },
    {
      id: 'Email',
      value: 'Email',
    },
    {
      id: 'Both',
      value: 'Both',
    },
    {
      id: 'None',
      value: 'None',
    },
  ],
  pledgeCurrency: [
    {
      code: 'USD',
      codeSymbolString: 'USD $',
      name: 'USD',
    },
  ],
  pledgeFrequency: [
    { id: 'WEEKLY', key: '0.23076923076923', value: 'Weekly' },
    { id: 'MONTHLY', key: '1.0', value: 'Monthly' },
  ],
  sendAppeals: [
    { id: 'true', value: 'Yes' },
    { id: 'false', value: 'No' },
  ],
  status: {
    never_contacted: 'Never Contacted',
    ask_in_future: 'Ask in Future',
    cultivate_relationship: 'Cultivate Relationship',
    contact_for_appointment: 'Contact for Appointment',
    appointment_scheduled: 'Appointment Scheduled',
    call_for_decision: 'Call for Decision',
    partner_financial: 'Partner - Financial',
    partner_special: 'Partner - Special',
    partner_pray: 'Partner - Pray',
    not_interested: 'Not Interested',
    unresponsive: 'Unresponsive',
    never_ask: 'Never Ask',
    research_abandoned: 'Research Abandoned',
    expired_referral: 'Expired Referral',
  },
};

export const uploadDataFileHeaders = {
  first_name: 'first_name',
  last_name: 'last_name',
  full_name: 'full_name',
  weird: 'weird',
  foo: 'foo',
};

export const resetUploadData = (): CsvImportType => {
  return {
    id: 'csvFileId',
    fileConstants: {
      weird: 'Odd Value',
      foo: 'bar',
    },
    fileConstantsMappings: {
      send_appeals: [
        {
          id: '',
          values: ['Odd Value'],
        },
      ],
      newsletter: [
        {
          id: '',
          values: ['bar'],
        },
      ],
    },
    fileHeaders: uploadDataFileHeaders,
    fileHeadersMappings: {
      first_name: 'first_name',
      last_name: 'last_name',
      full_name: 'full_name',
      weird: 'send_appeals',
      foo: 'newsletter',
    },
    valuesToConstantsMappings: {
      send_appeals: {
        'Odd Value': null,
      },
      newsletter: {
        bar: null,
      },
    },
    sampleContacts: [
      {
        envelopeGreeting: 'Test Name',
        greeting: 'Test',
        name: 'Name, Test',
        sendNewsletter: 'PHYSICAL',
      },
    ],
    tagList: [] as string[],
  } as CsvImportType;
};

export const supportedHeaders = {
  church: 'Church',
  city: 'City',
  commitment_amount: 'Commitment Amount',
  commitment_currency: 'Commitment Currency',
  commitment_frequency: 'Commitment Frequency',
  country: 'Country',
  email_1: 'Email 1',
  email_2: 'Email 2',
  envelope_greeting: 'Envelope Greeting',
  first_name: 'First Name',
  greeting: 'Greeting',
  last_name: 'Last Name',
  likely_to_give: 'Likely To Give',
  metro_area: 'Metro Area',
  newsletter: 'Newsletter',
  notes: 'Notes',
  phone_1: 'Phone 1',
  phone_2: 'Phone 2',
  phone_3: 'Phone 3',
  region: 'Region',
  send_appeals: 'Send Goals?',
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
