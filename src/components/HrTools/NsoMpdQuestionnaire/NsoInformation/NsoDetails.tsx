import React, { useMemo } from 'react';
import { Stack } from '@mui/material';
import { TFunction, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { NumberQuestion } from '../Shared/NumberQuestion';
import { RadioOption, RadioQuestion } from '../Shared/RadioQuestion';
import { getAmountSchema } from '../Shared/helpers/getAmountSchema';
import { getWholeNumberSchema } from '../Shared/helpers/getWholeNumberSchema';

export const getNsoDetailsSchema = (t: TFunction) =>
  yup.object({
    nsoHousing: yup.string().required(t('Please select an answer.')),
    nsoSessions: yup.string().required(t('Please select an answer.')),
    nsoSpecialNeedsSupportReceived: getAmountSchema(t),
    childcareChildrenCount: getWholeNumberSchema(
      t,
      t('Please enter a number, or 0 if you have none.'),
    ),
  });

export const NsoDetails: React.FC = () => {
  const { t } = useTranslation();

  const schema = useMemo(() => getNsoDetailsSchema(t), [t]);

  const housingOptions: RadioOption[] = [
    { value: 'SINGLE_ROOM', label: t('Single in hotel/dorm room') },
    { value: 'SHARED_ROOM', label: t('Sharing 2 in hotel/dorm room') },
    { value: 'COUPLE_ROOM', label: t('Couple in hotel/dorm room') },
    { value: 'FAMILY_ROOM', label: t('Family in a hotel/room') },
    { value: 'LOCAL_COMMUTING', label: t('Local / Commuting') },
  ];

  const sessionOptions: RadioOption[] = [
    { value: 'IBS_AND_NSO', label: t('IBS and NSO') },
    { value: 'NSO', label: t('NSO') },
  ];

  return (
    <Stack spacing={4}>
      <RadioQuestion
        fieldName="nsoHousing"
        schema={schema}
        label={t('Which of the following describes your NSO housing?')}
        options={housingOptions}
      />

      <RadioQuestion
        fieldName="nsoSessions"
        schema={schema}
        label={t('Which describes the sessions you are attending?')}
        options={sessionOptions}
      />

      <NumberQuestion
        fieldName="nsoSpecialNeedsSupportReceived"
        schema={schema}
        question={t(
          'How much special needs support have you already received for NSO?',
        )}
        helperText={t(
          'Round to the nearest dollar. Please enter 0 if you have none.',
        )}
      />

      <NumberQuestion
        fieldName="childcareChildrenCount"
        schema={schema}
        question={t(
          'If you are a parent with children in Childcare, please enter how many.',
        )}
        helperText={t('Please enter 0 if this does not apply to you.')}
      />
    </Stack>
  );
};
