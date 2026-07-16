import React, { useMemo } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  CurrencyAdornment,
  PercentageAdornment,
} from 'src/components/HrTools/Shared/Adornments';
import { NewStaffQuestionnaireVariantEnum } from 'src/graphql/types.generated';
import { percentage } from 'src/lib/yupHelpers';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { NumberQuestion } from '../Shared/NumberQuestion';
import { getAmountSchema } from '../Shared/helpers/getAmountSchema';
import { getWholeNumberSchema } from '../Shared/helpers/getWholeNumberSchema';

export const getVariantQuestionsSchema = (t: TFunction) =>
  yup.object({
    healthcareDependentsCount: getWholeNumberSchema(
      t,
      t('Please enter a number of dependents, or 0 if you have none.'),
    ),
    spouseRequestedAnnualSalary: getAmountSchema(t),
    spouseContribution403bPercentage: percentage(
      t('403(b) contribution percentage'),
      t,
    ).required(t('Please enter a percentage, or 0 if you contribute none.')),
    spouseMhaAmount: getAmountSchema(t),
    staffConferenceTransfer: getAmountSchema(t),
    accountTransfers: getAmountSchema(t),
  });

export const VariantQuestions: React.FC = () => {
  const { t } = useTranslation();

  const schema = useMemo(() => getVariantQuestionsSchema(t), [t]);

  const { questionnaire } = useNsoMpdQuestionnaire();
  const { spouseFirstName, variant } = questionnaire ?? {};
  const spouseName = spouseFirstName || t('your spouse');

  return (
    <>
      {variant === NewStaffQuestionnaireVariantEnum.Sosa && (
        <NumberQuestion
          fieldName="healthcareDependentsCount"
          schema={schema}
          question={t(
            'How many total dependents would you like to cover by your Cru healthcare?',
          )}
          helperText={t(
            'Include your spouse as a dependent along with any unborn children and in process adoptions.',
          )}
        />
      )}

      {variant === NewStaffQuestionnaireVariantEnum.SpouseSeniorStaff && (
        <>
          <NumberQuestion
            fieldName="spouseRequestedAnnualSalary"
            schema={schema}
            question={t(
              "What is {{spouseName}}'s current requested annual salary?",
              {
                spouseName,
              },
            )}
            helperText={t('Round to the nearest dollar.')}
            startAdornment={<CurrencyAdornment />}
          />
          <NumberQuestion
            fieldName="spouseContribution403bPercentage"
            schema={schema}
            question={t(
              "What is {{spouseName}}'s 403(b) contribution percentage?",
              {
                spouseName,
              },
            )}
            helperText={t('Enter a percentage between 0 and 100.')}
            endAdornment={<PercentageAdornment />}
          />
          <NumberQuestion
            fieldName="spouseMhaAmount"
            schema={schema}
            question={t("What is {{spouseName}}'s current requested MHA?", {
              spouseName,
            })}
            helperText={t('Please enter zero if you have not requested MHA.')}
            startAdornment={<CurrencyAdornment />}
          />
          <NumberQuestion
            fieldName="staffConferenceTransfer"
            schema={schema}
            question={t(
              'How much do you set aside automatically each month for biannual staff conference?',
            )}
            helperText={t(
              'Please enter zero if you do not have a monthly amount taken out of your staff account for staff conference.',
            )}
            startAdornment={<CurrencyAdornment />}
          />
          <NumberQuestion
            fieldName="accountTransfers"
            schema={schema}
            question={t(
              'How much do you transfer in giving to other staff each month from your staff account?',
            )}
            helperText={t(
              'Please enter zero if you do not transfer money from your staff account each month as giving to other staff.',
            )}
            startAdornment={<CurrencyAdornment />}
          />
        </>
      )}
    </>
  );
};
