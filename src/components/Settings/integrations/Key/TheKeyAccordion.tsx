import { Box, Skeleton, TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { AccordionProps } from '../integrationsHelper';
import { useGetKeyAccountsQuery } from './Key.generated';

export const TheKeyAccordion: React.FC<AccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
  disabled,
}) => {
  const { t } = useTranslation();
  const { data, loading } = useGetKeyAccountsQuery();
  const keyAccounts = data?.user?.keyAccounts;
  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={t('The Key / Relay')}
      value={''}
      disabled={disabled}
      image={
        <img
          src="/images/settings-preferences-intergrations-key.png"
          alt="The Key"
        />
      }
    >
      {loading && <Skeleton height="90px" />}
      {!loading &&
        keyAccounts?.map((account, idx) => (
          <Box style={{ marginTop: '20px' }} key={`email-${idx}`}>
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
