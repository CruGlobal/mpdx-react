import { Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import * as Types from 'src/graphql/types.generated';
import useGetAppSettings from 'src/hooks/useGetAppSettings';
import { AccordianProps } from '../../accordianHelper';
import { InviteForm } from '../InviteForm/InviteForm';
import { MergeForm } from '../MergeForm/MergeForm';

const DividerWithPadding = styled(Divider)(() => ({
  marginTop: '20px',
  marginBottom: '20px',
}));

export const MergeSpouseAccountsAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const { appName } = useGetAppSettings();
  const accordianName = t('Merge Spouse Accounts');

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordianName}
      value={''}
      fullWidth={true}
    >
      <StyledFormLabel>{accordianName}</StyledFormLabel>
      <Typography>
        {t("Merge your account with your spouse's account for a unified view")}
      </Typography>
      <Typography>
        {t(
          ` If you are getting married and have two separate donation accounts, you can merge your {{appName}} accounts
          together at any time. No data will be lost when they are merged, and we can do it at any time
          regardless of the status of your staff accounts being merged.`,
          { appName },
        )}
      </Typography>

      <DividerWithPadding />

      <Typography variant="h6">
        {t('1. Share your accounts with each other.')}
      </Typography>

      <InviteForm type={Types.InviteTypeEnum.User} />

      <Typography>
        {t(
          'You will each get an email (you might need to check your spam) and will need to accept access to each other’s accounts.',
        )}
      </Typography>

      <DividerWithPadding />

      <Typography variant="h6" marginBottom={2}>
        {t('2. Merge Accounts')}
      </Typography>
      <MergeForm isSpouse={true} />
    </AccordionItem>
  );
};
