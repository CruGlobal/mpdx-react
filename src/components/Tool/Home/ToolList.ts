import {
  mdiTrophy,
  mdiGoogle,
  mdiTable,
  mdiCloudUpload,
  mdiCurrencyUsd,
  mdiEmail,
  mdiMap,
  mdiPhone,
  mdiNewspaperVariantOutline,
  mdiHome,
  mdiAccountGroup,
} from '@mdi/js';

export const ToolsList = [
  {
    tool: 'Appeal',
    desc: 'Set goals, create asks, and track progress for one-time needs',
    icon: mdiTrophy,
    id: 'appeals',
  },
  {
    tool: 'Import from Google',
    desc: 'Import your contact information from your Google account',
    icon: mdiGoogle,
    id: 'google',
  },
  {
    tool: 'Import from CSV',
    desc: 'Import contacts you have saved in a CSV file',
    icon: mdiTable,
    id: 'csv',
  },
  {
    tool: 'Import from TntConnect',
    desc: 'Import your contacts from your TntConnect database',
    icon: mdiCloudUpload,
    id: 'tntConnect',
  },
  {
    tool: 'Fix Commitment Info',
    desc: 'Set the correct contacts commitment info for each contact',
    icon: mdiCurrencyUsd,
    id: 'fixCommitmentInfo',
  },
  {
    tool: 'Fix Email Addresses',
    desc: 'Set the correct primary email address for each person',
    icon: mdiEmail,
    id: 'fixEmailAddresses',
  },
  {
    tool: 'Fix Mailing Addresses',
    desc: 'Set the correct primary mailing address for each contact',
    icon: mdiMap,
    id: 'fixMailingAddresses',
  },
  {
    tool: 'Fix Phone Numbers',
    desc: 'Set the correct primary phone number for each person',
    icon: mdiPhone,
    id: 'fixPhoneNumbers',
  },
  {
    tool: 'Fix Send Newsletter',
    desc: 'Set the correct newsletter state for each contact',
    icon: mdiNewspaperVariantOutline,
    id: 'fixSendNewsletter',
  },
  {
    tool: 'Merge Contacts',
    desc: 'Review and merge duplicate contacts',
    icon: mdiHome,
    id: 'mergeContacts',
  },
  {
    tool: 'Merge People',
    desc: 'Review and merge duplicate people',
    icon: mdiAccountGroup,
    id: 'mergePeople',
  },
];
