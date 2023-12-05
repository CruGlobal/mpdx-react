import { Box, TextField } from '@mui/material';
import Skeleton from '@mui/material/Skeleton';
import { useTranslation } from 'react-i18next';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { FieldWrapper } from 'src/components/Shared/Forms/FieldWrapper';
import { useGetKeyAccountsQuery } from './Key.generated';

interface TheKeyAccordionProps {
  handleAccordionChange: (panel: string) => void;
  expandedPanel: string;
}

export const TheKeyAccordion: React.FC<TheKeyAccordionProps> = ({
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
