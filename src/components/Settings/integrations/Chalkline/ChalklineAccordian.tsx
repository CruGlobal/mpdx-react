import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { StyledFormLabel } from 'src/components/Shared/Forms/Field';
import { StyledServicesButton, AccordianProps } from '../../accordianHelper';
import { AccordionItem } from 'src/components/Shared/Forms/Accordions/AccordionItem';
import { useSendToChalklineMutation } from './SendToChalkline.generated';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { useSnackbar } from 'notistack';
import { Confirmation } from 'src/components/common/Modal/Confirmation/Confirmation';

export const ChalklineAccordian: React.FC<AccordianProps> = ({
  handleAccordionChange,
  expandedPanel,
}) => {
  const { t } = useTranslation();
  const accordianName = t('Chalk Line');
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
      label={accordianName}
      value={''}
      image={
        <img
          src="https://mpdx.org/07717b2f3dbaa95197c268541bff97a6.png"
          alt={accordianName}
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
