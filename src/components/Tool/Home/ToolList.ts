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
  mdiWrench,
} from '@mdi/js';

export interface ToolItem {
  tool: string;
  desc: string;
  icon: string;
  id: string;
  url: string;
}

interface ToolsGroup {
  groupName: string;
  groupIcon: string;
  items: ToolItem[];
}

export const ToolsList: ToolsGroup[] = [
  {
    groupName: 'Appeals',
    groupIcon: mdiWrench,
    items: [
      {
        tool: 'Appeal',
        desc: 'Set goals, create asks, and track progress for one-time needs',
        icon: mdiTrophy,
        id: 'appeals',
        url: 'appeals',
      },
    ],
  },
  {
    groupName: 'Contacts',
    groupIcon: mdiHome,
    items: [
      {
        tool: 'Fix Commitment Info',
        desc: 'Set the correct contacts commitment info for each contact',

        icon: mdiCurrencyUsd,
        id: 'fixCommitmentInfo',
        url: 'fix/commitmentInfo',
      },
      {
        tool: 'Fix Mailing Addresses',
        desc: 'Set the correct primary mailing address for each contact',
        icon: mdiMap,
        id: 'fixMailingAddresses',
        url: 'fix/mailingAddresses',
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
    ],
  },
  {
    groupName: 'People',
    groupIcon: mdiAccountGroup,
    items: [
      {
        tool: 'Fix Email Addresses',
        desc: 'Set the correct primary email address for each person',
        icon: mdiEmail,
        id: 'fixEmailAddresses',
        url: 'fix/emailAddresses',
      },
      {
        tool: 'Fix Phone Numbers',
        desc: 'Set the correct primary phone number for each person',
        icon: mdiPhone,
        id: 'fixPhoneNumbers',
        url: 'fix/phoneNumbers',
      },
      {
        tool: 'Merge People',
        desc: 'Review and merge duplicate people',
        icon: mdiAccountGroup,
        id: 'mergePeople',
        url: 'merge/people',
      },
    ],
  },
  {
    groupName: 'Imports',
    groupIcon: mdiCloudUpload,
    items: [
      {
        tool: 'Import from Google',
        desc: 'Import your contact information from your Google account',

        icon: mdiGoogle,
        id: 'import/google',
        url: 'import/google',
      },

      {
        tool: 'Import from TntConnect',
        desc: 'Import your contacts from your TntConnect database',
        icon: mdiCloudUpload,
        id: 'import/tnt',
        url: 'import/tnt',
      },

      {
        tool: 'Import from CSV',
        desc: 'Import contacts you have saved in a CSV file',
        icon: mdiTable,
        id: 'import/csv',
        url: 'import/csv',
      },
    ],
  },
];
