import {
  mdiAccountGroup,
  mdiCloudUpload,
  mdiCurrencyUsd,
  mdiEmail,
  mdiGoogle,
  mdiHome,
  mdiMap,
  mdiNewspaperVariantOutline,
  mdiPhone,
  mdiTable,
  mdiTrophy,
} from '@mdi/js';

export interface ToolItem {
  tool: string;
  desc: string;
  icon: string;
  id: string;
  url: string;
}

export const ToolsListHome: ToolItem[] = [
  {
    tool: 'Appeal',
    desc: 'Set goals, create asks, and track progress for one-time needs',
    icon: mdiTrophy,
    id: 'appeals',
    url: 'appeals',
  },
  {
    tool: 'Import from Google',
    desc: 'Import your contact information from your Google account',

    icon: mdiGoogle,
    id: 'import/google',
    url: 'import/google',
  },
  {
    tool: 'Import from CSV',
    desc: 'Import contacts you have saved in a CSV file',
    icon: mdiTable,
    id: 'import/csv',
    url: 'import/csv',
  },
  {
    tool: 'Import from TntConnect',
    desc: 'Import your contacts from your TntConnect database',
    icon: mdiCloudUpload,
    id: 'import/tnt',
    url: 'import/tnt',
  },
  {
    tool: 'Fix Commitment Info',
    desc: 'Set the correct contacts commitment info for each contact',

    icon: mdiCurrencyUsd,
    id: 'fixCommitmentInfo',
    url: 'fix/commitmentInfo',
  },
  {
    tool: 'Fix Email Addresses',
    desc: 'Set the correct primary email address for each person',
    icon: mdiEmail,
    id: 'fixEmailAddresses',
    url: 'fix/emailAddresses',
  },
  {
    tool: 'Fix Mailing Addresses',
    desc: 'Set the correct primary mailing address for each contact',
    icon: mdiMap,
    id: 'fixMailingAddresses',
    url: 'fix/mailingAddresses',
  },
  {
    tool: 'Fix Phone Numbers',
    desc: 'Set the correct primary phone number for each person',
    icon: mdiPhone,
    id: 'fixPhoneNumbers',
    url: 'fix/phoneNumbers',
  },
  {
    tool: 'Fix Send Newsletter',
    desc: 'Set the correct newsletter state for each contact',
    icon: mdiNewspaperVariantOutline,
    id: 'fixSendNewsletter',
    url: 'fix/sendNewsletter',
  },
  {
    tool: 'Merge Contacts',
    desc: 'Review and merge duplicate contacts',
    icon: mdiHome,
    id: 'mergeContacts',
    url: 'merge/contacts',
  },
  {
    tool: 'Merge People',
    desc: 'Review and merge duplicate people',
    icon: mdiAccountGroup,
    id: 'mergePeople',
    url: 'merge/people',
  },
];
