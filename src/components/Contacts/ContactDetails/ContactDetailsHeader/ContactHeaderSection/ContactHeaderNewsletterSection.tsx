import React, { ReactElement } from 'react';
import { mdiNewspaperVariantOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Skeleton, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { getLocalizedSendNewsletter } from 'src/utils/functions/getLocalizedSendNewsletter';
import theme from '../../../../../theme';
import { ContactHeaderNewsletterFragment } from './ContactHeaderNewsletter.generated';
import { ContactHeaderSection } from './ContactHeaderSection';

interface Props {
  loading: boolean;
  contact?: ContactHeaderNewsletterFragment;
}

const TextSkeleton = styled(Skeleton)(({}) => ({
  display: 'inline',
  marginLeft: 18,
  width: 200,
  fontSize: 16,
}));

const NewsletterIcon: React.FC = () => (
  <Icon
    path={mdiNewspaperVariantOutline}
    size={1}
    color={theme.palette.cruGrayMedium.main}
  />
);

export const ContactHeaderNewsletterSection = ({
  loading,
  contact,
}: Props): ReactElement => {
  const newsletter = contact?.sendNewsletter;
  const { t } = useTranslation();

  if (loading) {
    return (
      <ContactHeaderSection icon={<NewsletterIcon />}>
        <TextSkeleton variant="text" />
      </ContactHeaderSection>
    );
  } else if (newsletter) {
    return (
      <ContactHeaderSection icon={<NewsletterIcon />}>
        <Typography variant="subtitle1" style={{ width: 'fit-content' }}>
          {t('Newsletter')}: {getLocalizedSendNewsletter(t, newsletter)}
        </Typography>
      </ContactHeaderSection>
    );
  }

  return (
    <ContactHeaderSection icon={<NewsletterIcon />}>
      <Typography variant="subtitle1">{'N/A'}</Typography>
    </ContactHeaderSection>
  );
};
