import { useState } from 'react';
import { Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { IntegrationAccordion } from 'src/components/Shared/Forms/Accordions/AccordionEnum';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { StyledFormLabel } from 'src/components/Shared/Forms/FieldHelper';
import { Confirmation } from 'src/components/Shared/Modal/Confirmation/Confirmation';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';
import { AccordionProps, StyledServicesButton } from '../integrationsHelper';
import { useSendToChalklineMutation } from './SendToChalkline.generated';

export const ChalklineAccordion: React.FC<AccordionProps> = ({
  handleAccordionChange,
  expandedAccordion,
  disabled,
}) => {
  const { t } = useTranslation();
  const accordionName = t('Chalk Line');
  const [showModal, setShowModal] = useState(false);
  const accountListId = useAccountListId();
  const [sendToChalkline] = useSendToChalklineMutation();
  const { enqueueSnackbar } = useSnackbar();
  const appName = getAppName();
  const handleOpenModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSendListToChalkLine = async () => {
    await sendToChalkline({
      variables: {
        input: {
          accountListId,
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully Emailed Chalk Line'), {
          variant: 'success',
        });
        enqueueSnackbar(t('Redirecting you to Chalk Line.'), {
          variant: 'success',
        });
        setTimeout(() => {
          window.open('https://www.chalkline.org/order-mpdx', '_blank');
        }, 1000);
      },
    });
  };

  return (
    <AccordionItem
      accordion={IntegrationAccordion.Chalkline}
      onAccordionChange={handleAccordionChange}
      expandedAccordion={expandedAccordion}
      label={accordionName}
      value={''}
      disabled={disabled}
      image={
        <img
          src="/images/settings-preferences-integrations-chalkline.png"
          alt={accordionName}
        />
      }
    >
      <StyledFormLabel>{t('Chalk Line Overview')}</StyledFormLabel>
      <Typography>
        {t(`Chalk Line is a significant way to save valuable ministry time while more effectively
            connecting with your partners. Send physical newsletters to your current list using
            Chalk Line with a simple click. Chalk Line is a one way send available anytime you’re
            ready to send a new newsletter out.`)}
      </Typography>
      <StyledServicesButton variant="contained" onClick={handleOpenModal}>
        {t('Send my current Contacts to Chalk Line')}
      </StyledServicesButton>

      <Confirmation
        isOpen={showModal}
        title={t('Confirm')}
        message={t(
          'Would you like {{appName}} to email Chalk Line your newsletter list and open their order form in a new tab?',
          { appName },
        )}
        handleClose={handleCloseModal}
        mutation={handleSendListToChalkLine}
      />
    </AccordionItem>
  );
};
