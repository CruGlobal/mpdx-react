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
import i18n from 'src/lib/i18n';

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

export const ToolsListNav: ToolsGroup[] = [
  {
    groupName: i18n.t('Appeals'),
    groupIcon: mdiWrench,
    items: [
      {
        tool: i18n.t('Appeals'),
        desc: i18n.t(
          'Set goals, create asks, and track progress for one-time needs',
        ),
        icon: mdiTrophy,
        id: 'appeals',
        url: 'appeals',
      },
    ],
  },
  {
    groupName: i18n.t('Contacts'),
    groupIcon: mdiHome,
    items: [
      {
        tool: i18n.t('Fix Commitment Info'),
        desc: i18n.t(
          'Set the correct contacts commitment info for each contact',
        ),

        icon: mdiCurrencyUsd,
        id: 'fixCommitmentInfo',
        url: 'fix/commitmentInfo',
      },
      {
        tool: i18n.t('Fix Mailing Addresses'),
        desc: i18n.t(
          'Set the correct primary mailing address for each contact',
        ),
        icon: mdiMap,
        id: 'fixMailingAddresses',
        url: 'fix/mailingAddresses',
      },
      {
        tool: i18n.t('Fix Send Newsletter'),
        desc: i18n.t('Set the correct newsletter state for each contact'),
        icon: mdiNewspaperVariantOutline,
        id: 'fixSendNewsletter',
        url: 'fix/sendNewsletter',
      },
      {
        tool: i18n.t('Merge Contacts'),
        desc: i18n.t('Review and merge duplicate contacts'),
        icon: mdiHome,
        id: 'mergeContacts',
        url: 'merge/contacts',
      },
    ],
  },
  {
    groupName: i18n.t('People'),
    groupIcon: mdiAccountGroup,
    items: [
      {
        tool: i18n.t('Fix Email Addresses'),
        desc: i18n.t('Set the correct primary email address for each person'),
        icon: mdiEmail,
        id: 'fixEmailAddresses',
        url: 'fix/emailAddresses',
      },
      {
        tool: i18n.t('Fix Phone Numbers'),
        desc: i18n.t('Set the correct primary phone number for each person'),
        icon: mdiPhone,
        id: 'fixPhoneNumbers',
        url: 'fix/phoneNumbers',
      },
      {
        tool: i18n.t('Merge People'),
        desc: i18n.t('Review and merge duplicate people'),
        icon: mdiAccountGroup,
        id: 'mergePeople',
        url: 'merge/people',
      },
    ],
  },
  {
    groupName: i18n.t('Imports'),
    groupIcon: mdiCloudUpload,
    items: [
      {
        tool: i18n.t('Import from Google'),
        desc: i18n.t(
          'Import your contact information from your Google account',
        ),

        icon: mdiGoogle,
        id: 'import/google',
        url: 'import/google',
      },
      {
        tool: i18n.t('Import from TntConnect'),
        desc: i18n.t('Import your contacts from your TntConnect database'),
        icon: mdiCloudUpload,
        id: 'import/tnt',
        url: 'import/tnt',
      },
      {
        tool: i18n.t('Import from CSV'),
        desc: i18n.t('Import contacts you have saved in a CSV file'),
        icon: mdiTable,
        id: 'import/csv',
        url: 'import/csv',
      },
    ],
  },
];
