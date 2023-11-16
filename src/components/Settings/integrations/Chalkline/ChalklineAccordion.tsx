import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useSendToChalklineMutation } from './SendToChalkline.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { StyledFormLabel } from 'src/components/Shared/Forms/FieldHelper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';
import { StyledServicesButton, AccordionProps } from '../integrationsHelper';

export const ChalklineAccordion: React.FC<AccordionProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordionName = t('Chalk Line');
  const [showModal, setShowModal] = useState(false);
  const accountListId = useAccountListId();
  const [sendToChalkline] = useSendToChalklineMutation();
  const { enqueueSnackbar } = useSnackbar();
  const handleOpenModal = () => setShowModal(true);

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSendListToChalkLine = async () => {
    await sendToChalkline({
      variables: {
        input: {
          accountListId: accountListId ?? '',
        },
      },
      onCompleted: () => {
        enqueueSnackbar(t('Successfully Emailed Chalkine'), {
          variant: 'success',
        });
        enqueueSnackbar(t('Redirecting you to Chalkine.'), {
          variant: 'success',
        });
        setTimeout(() => {
          window.open('https://chalkline.org/order_mpdx/', '_blank');
        }, 1000);
      },
    });
  };

  return (
    <AccordionItem
      onAccordionChange={handleAccordionChange}
      expandedPanel={expandedPanel}
      label={accordionName}
      value={''}
      image={
        <img
          src="/images/settings-preferences-intergrations-chalkline.png"
          alt={accordionName}
        />
      }
    >
      <StyledFormLabel>{t('Chalkline Overview')}</StyledFormLabel>
      <Typography>
        {t(`Chalkline is a significant way to save valuable ministry time while more effectively
            connecting with your partners. Send physical newsletters to your current list using
            Chalkline with a simple click. Chalkline is a one way send available anytime you’re
            ready to send a new newsletter out.`)}
      </Typography>
      <StyledServicesButton variant="contained" onClick={handleOpenModal}>
        {t('Send my current Contacts to Chalkline')}
      </StyledServicesButton>

      <Confirmation
        isOpen={showModal}
        title={t('Confirm')}
        message={t(
          'Would you like MPDX to email Chalkline your newsletter list and open their order form in a new tab?',
        )}
        handleClose={handleCloseModal}
        mutation={handleSendListToChalkLine}
      />
    </AccordionItem>
  );
};
