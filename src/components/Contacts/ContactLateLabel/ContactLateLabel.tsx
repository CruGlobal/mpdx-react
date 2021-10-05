import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@material-ui/core';
import { DateTime, Duration } from 'luxon';
import { ContactRowFragment } from '../ContactRow/ContactRow.generated';

interface ContactLateLabelProps {
  lateAt: ContactRowFragment['lateAt'];
}

export const ContactLateLabel: React.FC<ContactLateLabelProps> = ({
  lateAt,
}) => {
  const { t } = useTranslation();

  const contactLateStatus: Duration | undefined = useMemo(() => {
    if (lateAt) {
      return DateTime.now().diff(DateTime.fromISO(lateAt), ['days']);
    }
  }, [lateAt]);

  return (
    <>
      {contactLateStatus && contactLateStatus?.days > 0 ? (
        <Typography component="span" color="textPrimary">
          {`(${t('On time')})`}
        </Typography>
      ) : (
        <Typography component="span" color="error">{`(${
          contactLateStatus?.days
        }+ ${t('days')} ${t('late')})`}</Typography>
      )}
    </>
  );
};
