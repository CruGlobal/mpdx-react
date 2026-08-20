import React, { ReactElement, useMemo } from 'react';
import {
  mdiAccountGroup,
  mdiCurrencyUsd,
  mdiEmailOutline,
  mdiGoogle,
  mdiHome,
  mdiMap,
  mdiNewspaperVariantOutline,
  mdiPhone,
} from '@mdi/js';
import Icon from '@mdi/react';
import { Typography } from '@mui/material';
import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { NullStateBox } from '../Shared/Filters/NullState/NullStateBox';

interface Props {
  tool: string;
  button?: ReactElement;
}

interface ToolText {
  primaryText: string;
  secondaryText: string;
  icon: string;
}

const getTextMap = (t: TFunction): { [key: string]: ToolText } => ({
  fixCommitmentInfo: {
    primaryText: t('No contacts with commitment info need attention'),
    secondaryText: t(
      'Contacts with possibly incorrect commitment info will appear here.',
    ),
    icon: mdiCurrencyUsd,
  },
  fixMailingAddresses: {
    primaryText: t('No contacts with mailing addresses need attention'),
    secondaryText: t(
      'Contacts with new addresses or multiple primary mailing addresses will appear here.',
    ),
    icon: mdiMap,
  },
  fixSendNewsletter: {
    primaryText: t(
      'No contacts with an empty newsletter status need attention',
    ),
    secondaryText: t(
      'Contacts that appear here have an empty newsletter status and partner status set to financial, special, or pray.',
    ),
    icon: mdiNewspaperVariantOutline,
  },
  mergeContacts: {
    primaryText: t('No duplicate contacts need attention'),
    secondaryText: t(
      'People with similar names and partner account numbers will appear here.',
    ),
    icon: mdiHome,
  },
  fixEmailAddresses: {
    primaryText: t('No people with email addresses need attention'),
    secondaryText: t(
      'People with new email addresses or multiple primary email addresses will appear here.',
    ),
    icon: mdiEmailOutline,
  },
  fixPhoneNumbers: {
    primaryText: t('No people with phone numbers need attention'),
    secondaryText: t(
      'People with new phone numbers or multiple primary phone numbers will appear here.',
    ),
    icon: mdiPhone,
  },
  mergePeople: {
    primaryText: t('No duplicate people need attention'),
    secondaryText: t('People with similar names will appear here.'),
    icon: mdiAccountGroup,
  },
  googleImport: {
    primaryText: t("You haven't connected a Google account yet"),
    secondaryText: t('Add a Google account then try to import from Google.'),
    icon: mdiGoogle,
  },
});

const NoData: React.FC<Props> = ({ tool, button }: Props) => {
  const { t } = useTranslation();
  const textMap = useMemo(() => getTextMap(t), [t]);

  return (
    <NullStateBox data-testid={`${tool}-null-state`}>
      <Icon path={textMap[tool].icon} size={1.5} />
      <Typography variant="h5">{textMap[tool].primaryText}</Typography>
      <Typography my={1}>{textMap[tool].secondaryText}</Typography>
      {button}
    </NullStateBox>
  );
};

export default NoData;
