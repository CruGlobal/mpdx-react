import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsWrapper } from './wrapper';
import { suggestArticles } from 'src/lib/helpScout';

import { AccordionGroup } from 'src/components/Shared/Forms/Accordions/AccordionGroup';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FormWrapper } from 'src/components/Shared/Forms/Fields/FormWrapper';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { StyledOutlinedInput } from 'src/components/Shared/Forms/Field';
//import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { Typography, Card, List, ListItemText, Alert } from '@mui/material';
import theme from 'src/theme';

const StyledListItem = styled(ListItemText)(() => ({
  display: 'list-item',
}));

const StyledList = styled(List)(({ theme }) => ({
  listStyleType: 'disc',
  paddingLeft: theme.spacing(4),
}));

const ManageAccounts: React.FC = () => {
  const { t } = useTranslation();
  const [expandedPanel, setExpandedPanel] = useState('');
  // const [isValid, setIsValid] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const manageAccountsMockData = [
    {
      name: 'Jack Sparrow',
      email: 'jack.sparrow@cru.org',
    },
  ];

  useEffect(() => {
    suggestArticles('HS_SETTINGS_SERVICES_SUGGESTIONS');
  }, []);

  const handleAccordionChange = (panel: string) => {
    setExpandedPanel(expandedPanel === panel ? '' : panel);
  };

  const handleSubmit = () => {
    // eslint-disable-next-line no-console
    console.log('handleSubmithandleSubmit');
  };

  return (
    <SettingsWrapper
      pageTitle={t('Manage Accounts')}
      pageHeading={t('Manage Accounts')}
      selectedMenuId="manageAccounts"
    >
      <AccordionGroup title={t('')}>
        <AccordionItem
          onAccordionChange={handleAccordionChange}
          expandedPanel={expandedPanel}
          fullWidth={true}
          label={t('Manage Account Access')}
          value={''}
        >
          <Typography>
            Share this ministry account with other team members.
          </Typography>
          <Alert severity="info" sx={{ my: 2 }}>
            If you want to allow another mpdx user to have access to this
            ministry account, you can share access with them. Make sure you have
            the proper permissions and leadership consensus around this sharing
            before you do this. You will be able to remove access later.
          </Alert>
          {manageAccountsMockData[0] ? (
            <>
              <Typography mt={0} fontWeight={700}>
                Account currently shared with:
              </Typography>
              <StyledList>
                {manageAccountsMockData.map((item, index) => (
                  <StyledListItem key={index}>{item.name}</StyledListItem>
                ))}
              </StyledList>
            </>
          ) : (
            ''
          )}

          <Card sx={{ background: theme.palette.cruGrayLight.main, p: 2 }}>
            <FormWrapper
              onSubmit={handleSubmit}
              isValid={true}
              isSubmitting={false}
              buttonText="Share Account"
            >
              <FieldWrapper
                labelText={t('Invite someone to share this account:')}
                helperText={''}
              >
                <StyledOutlinedInput />
              </FieldWrapper>
            </FormWrapper>
          </Card>
        </AccordionItem>
      </AccordionGroup>
    </SettingsWrapper>
  );
};

export default ManageAccounts;
