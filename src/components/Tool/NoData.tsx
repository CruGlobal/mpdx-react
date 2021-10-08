import React from 'react';
import { Box, Typography, styled } from '@material-ui/core';
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
import theme from '../../theme';

const StyledBox = styled(Box)(() => ({
  width: '100%',
  border: '1px solid',
  borderColor: theme.palette.cruGrayMedium.main,
  color: theme.palette.cruGrayDark.main,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  backgroundColor: theme.palette.cruGrayLight.main,
  paddingTop: theme.spacing(7),
  paddingBottom: theme.spacing(7),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  textAlign: 'center',
  boxShadow: `0px 0px 5px ${theme.palette.cruGrayMedium.main} inset`,
}));

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
    <StyledBox data-testid="no-data">
      <Icon path={textMap[tool].icon} size={1.5} />
      <Typography variant="h5">{textMap[tool].primaryText}</Typography>
      <Typography>{textMap[tool].secondaryText}</Typography>
    </StyledBox>
  );
};

export default NoData;
