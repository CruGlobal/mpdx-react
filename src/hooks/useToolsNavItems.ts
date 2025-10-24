import { useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';

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

export function useToolsNavItems(): ToolsGroup[] {
  const { t } = useTranslation();

  const toolsNavItems: ToolsGroup[] = [
    {
      groupName: t('Appeals'),
      groupIcon: mdiWrench,
      items: [
        {
          tool: t('Appeals'),
          desc: t(
            'Set goals, create asks, and track progress for one-time needs',
          ),
          icon: mdiTrophy,
          id: 'appeals',
          url: 'appeals',
        },
      ],
    },
    {
      groupName: t('Contacts'),
      groupIcon: mdiHome,
      items: [
        {
          tool: t('Fix Commitment Info'),
          desc: t('Set the correct contacts commitment info for each contact'),

          icon: mdiCurrencyUsd,
          id: 'fixCommitmentInfo',
          url: 'fix/commitmentInfo',
        },
        {
          tool: t('Fix Mailing Addresses'),
          desc: t('Set the correct primary mailing address for each contact'),
          icon: mdiMap,
          id: 'fixMailingAddresses',
          url: 'fix/mailingAddresses',
        },
        {
          tool: t('Fix Send Newsletter'),
          desc: t('Set the correct newsletter state for each contact'),
          icon: mdiNewspaperVariantOutline,
          id: 'fixSendNewsletter',
          url: 'fix/sendNewsletter',
        },
        {
          tool: t('Merge Contacts'),
          desc: t('Review and merge duplicate contacts'),
          icon: mdiHome,
          id: 'mergeContacts',
          url: 'merge/contacts',
        },
      ],
    },
    {
      groupName: t('People'),
      groupIcon: mdiAccountGroup,
      items: [
        {
          tool: t('Fix Email Addresses'),
          desc: t('Set the correct primary email address for each person'),
          icon: mdiEmail,
          id: 'fixEmailAddresses',
          url: 'fix/emailAddresses',
        },
        {
          tool: t('Fix Phone Numbers'),
          desc: t('Set the correct primary phone number for each person'),
          icon: mdiPhone,
          id: 'fixPhoneNumbers',
          url: 'fix/phoneNumbers',
        },
        {
          tool: t('Merge People'),
          desc: t('Review and merge duplicate people'),
          icon: mdiAccountGroup,
          id: 'mergePeople',
          url: 'merge/people',
        },
      ],
    },
    {
      groupName: t('Imports'),
      groupIcon: mdiCloudUpload,
      items: [
        {
          tool: t('Import from Google'),
          desc: t('Import your contact information from your Google account'),

          icon: mdiGoogle,
          id: 'import/google',
          url: 'import/google',
        },
        {
          tool: t('Import from TntConnect'),
          desc: t('Import your contacts from your TntConnect database'),
          icon: mdiCloudUpload,
          id: 'import/tnt',
          url: 'import/tnt',
        },
        {
          tool: t('Import from CSV'),
          desc: t('Import contacts you have saved in a CSV file'),
          icon: mdiTable,
          id: 'import/csv',
          url: 'import/csv',
        },
      ],
    },
  ];

  return useMemo(() => toolsNavItems, [t]);
}
