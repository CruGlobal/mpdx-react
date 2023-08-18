import { useTranslation } from 'react-i18next';
import { Box, TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { useGetKeyAccountsQuery } from './Key.generated';

interface TheKeyAccordianProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
}

export const TheKeyAccordian: React.FC<TheKeyAccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
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
