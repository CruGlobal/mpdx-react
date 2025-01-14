import { Box, Skeleton, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccordionProps } from '../integrationsHelper';
import { useOktaAccountsQuery } from './OktaAccounts.generated';

export const OktaAccordion: React.FC<AccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  disabled,
}) => {
  const { t } = useTranslation();
  const { data, loading } = useOktaAccountsQuery();
  const oktaAccounts = data?.user?.keyAccounts;
  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={t('Okta')}
      value={''}
      disabled={disabled}
      image={
        <img
          src="/images/settings-preferences-integrations-okta.png"
          alt="Okta"
        />
      }
    >
      {loading && <Skeleton height="90px" />}
      {!loading &&
        oktaAccounts?.map((account) => (
          <Box style={{ marginTop: '20px' }} key={account.id}>
            <FieldWrapper>
              <TextField
                label={t('Email Address')}
                value={account.email}
                disabled={true}
              />
            </FieldWrapper>
          </Box>
        ))}
    </AccordionItem>
  );
};
