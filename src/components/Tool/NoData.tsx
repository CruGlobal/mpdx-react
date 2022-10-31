import React from 'react';
import { Typography } from '@mui/material';
import {
  mdiAccountGroup,
  mdiCurrencyUsd,
  mdiEmailOutline,
  mdiHome,
  mdiMap,
  mdiNewspaperVariantOutline,
  mdiPhone,
} from '@mdi/js';
import Icon from '@mdi/react';
import i18n from 'i18next';
import { NullStateBox } from '../Shared/Filters/NullState/NullStateBox';

interface Props {
  tool: string;
}

interface ToolText {
  primaryText: string;
  secondaryText: string;
  icon: string;
}

const textMap: { [key: string]: ToolText } = {
  fixCommitmentInfo: {
    primaryText: i18n.t('No contacts with commitment info need attention'),
    secondaryText: i18n.t(
      'Contacts with possibly incorrect commitment info will appear here.',
    ),
    icon: mdiCurrencyUsd,
  },
  fixMailingAddresses: {
    primaryText: i18n.t('No contacts with mailing addresses need attention'),
    secondaryText: i18n.t(
      'Contacts with new addresses or multiple primary mailing addresses will appear here.',
    ),
    icon: mdiMap,
  },
  fixSendNewsletter: {
    primaryText: i18n.t(
      'No contacts with an empty newsletter status need attention',
    ),
    secondaryText: i18n.t(
      'Contacts that appear here have an empty newsletter status and partner status set to financial, special, or pray.',
    ),
    icon: mdiNewspaperVariantOutline,
  },
  mergeContacts: {
    primaryText: i18n.t('No duplicate contacts need attention'),
    secondaryText: i18n.t(
      'People with similar names and partner account numbers will appear here.',
    ),
    icon: mdiHome,
  },
  fixEmailAddresses: {
    primaryText: i18n.t('No people with email addresses need attention'),
    secondaryText: i18n.t(
      'People with new email addresses or multiple primary email addresses will appear here.',
    ),
    icon: mdiEmailOutline,
  },
  fixPhoneNumbers: {
    primaryText: i18n.t('No people with phone numbers need attention'),
    secondaryText: i18n.t(
      'People with new phone numbers or multiple primary phone numbers will appear here.',
    ),
    icon: mdiPhone,
  },
  mergePeople: {
    primaryText: i18n.t('No duplicate people need attention'),
    secondaryText: i18n.t('People with similar names will appear here.'),
    icon: mdiAccountGroup,
  },
};

const NoData: React.FC<Props> = ({ tool }: Props) => {
  return (
    <NullStateBox data-testid={`${tool}-null-state`}>
      <Icon path={textMap[tool].icon} size={1.5} />
      <Typography variant="h5">{textMap[tool].primaryText}</Typography>
      <Typography>{textMap[tool].secondaryText}</Typography>
    </NullStateBox>
  );
};

export default NoData;
