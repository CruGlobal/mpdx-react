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
  },
  {
    tool: 'Import from Google',
    desc: 'Import your contact information from your Google account',
    icon: mdiGoogle,
  },
  {
    tool: 'Import from CSV',
    desc: 'Import contacts you have saved in a CSV file',
    icon: mdiTable,
  },
  {
    tool: 'Import from TntConnect',
    desc: 'Import your contacts from your TntConnect database',
    icon: mdiCloudUpload,
  },
  {
    tool: 'Fix Commitment Info',
    desc: 'Set the correct contacts commitment info for each contact',
    icon: mdiCurrencyUsd,
  },
  {
    tool: 'Fix Email Addresses',
    desc: 'Set the correct primary email address for each person',
    icon: mdiEmail,
  },
  {
    tool: 'Fix Mailing Addresses',
    desc: 'Set the correct primary mailing address for each contact',
    icon: mdiMap,
  },
  {
    tool: 'Fix Phone Numbers',
    desc: 'Set the correct primary phone number for each person',
    icon: mdiPhone,
  },
  {
    tool: 'Fix Send Newsletter',
    desc: 'Set the correct newsletter state for each contact',
    icon: mdiNewspaperVariantOutline,
  },
  {
    tool: 'Merge Contacts',
    desc: 'Review and merge duplicate contacts',
    icon: mdiHome,
  },
  {
    tool: 'Merge People',
    desc: 'Review and merge duplicate people',
    icon: mdiAccountGroup,
  },
];
