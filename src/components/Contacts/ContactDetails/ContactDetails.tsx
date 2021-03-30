import { AppBar, Box, Tab, Tabs } from '@material-ui/core';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetContactDetailsLazyQuery } from './ContactDetails.generated';

interface Props {
  accountListId: string;
  contactId: string | null;
}

export const ContactDetails: React.FC<Props> = ({
  accountListId,
  contactId,
}: Props) => {
  const { t } = useTranslation();

  const [
    loadContactDetails,
    { data, loading, error },
  ] = useGetContactDetailsLazyQuery();

  useEffect(() => {
    if (contactId != null) {
      loadContactDetails({ variables: { accountListId, contactId } });
    }
  }, [contactId]);

  return (
    <Box position="fixed">
      {loading ? <p>loading</p> : <p>{data?.contact.name}</p>}
      <AppBar position="static">
        <Tabs>
          <Tab label={t('Tasks')} />
          <Tab label={t('Donations')} />
          <Tab label={t('Referrals')} />
          <Tab label={t('Contact Details')} />
          <Tab label={t('Notes')} />
        </Tabs>
      </AppBar>
    </Box>
  );
};
