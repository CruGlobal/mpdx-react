import { useCallback, useMemo, useRef } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import {
  AsrStatusEnum,
  ElectionType403bEnum,
  ProgressiveApprovalTierReasonEnum,
} from 'src/graphql/types.generated';
import { useLocale } from 'src/hooks/useLocale';
import i18n from 'src/lib/i18n';
import { currencyFormat } from 'src/lib/intlFormat';
import { amount, phoneNumber } from 'src/lib/yupHelpers';
import { CompleteFormValues } from '../AdditionalSalaryRequest';
import {
  useAdditionalSalaryRequestQuery,
  useSubmitAdditionalSalaryRequestMutation,
  useUpdateAdditionalSalaryRequestMutation,
} from '../AdditionalSalaryRequest.generated';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';
import { getTotal } from './Helper/getTotal';
import { useFormUserInfo } from './useFormUserInfo';

export const useAdditionalSalaryRequestForm = (
  providedInitialValues?: CompleteFormValues,
) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const {
    handleNextStep,
    user,
    salaryInfo,
    isInternational,
    requestId,
    isSpouse,
    fieldConfig,
  } = useAdditionalSalaryRequest();

  const { primaryAccountBalance } = useFormUserInfo();

  const { data: requestData } = useAdditionalSalaryRequestQuery({
    variables: { isSpouse },
  });
  const individualCap =
    requestData?.latestAdditionalSalaryRequest?.calculations.currentSalaryCap ??
    0;

  const [updateAdditionalSalaryRequest] =
    useUpdateAdditionalSalaryRequestMutation();

  const [submitAdditionalSalaryRequest] =
    useSubmitAdditionalSalaryRequestMutation();

  const lastValidTotalRef = useRef<number>(0);

  const createCurrencyValidation = useCallback(
    (fieldName: string, max?: number) => {
      let schema = amount(fieldName, t).nullable();
      if (max !== null && max !== undefined) {
        schema = schema.max(
          max,
          t('Exceeds {{amount}} limit', {
            amount: currencyFormat(max, 'USD', locale, {
              showTrailingZeros: true,
            }),
          }),
        );
      }
      return schema;
    },
    [t, locale],
  );

  const defaultInitialValues: CompleteFormValues = {
    ...Object.fromEntries(fieldConfig.map(({ key }) => [key, '0'])),
    totalAdditionalSalaryRequested: '0',
    additionalInfo: '',
    electionType403b: ElectionType403bEnum.None,
    phoneNumber: user?.staffInfo?.primaryPhoneNumber || '',
    emailAddress: user?.staffInfo?.emailAddress || '',
  } as CompleteFormValues;

  const initialValuesRef = useRef<CompleteFormValues | null>(null);

  if (!initialValuesRef.current) {
    if (providedInitialValues) {
      initialValuesRef.current = providedInitialValues;
    } else {
      const request = requestData?.latestAdditionalSalaryRequest;
      if (request && request.status !== AsrStatusEnum.ApprovedAndPaid) {
        initialValuesRef.current = {
          ...Object.fromEntries(
            fieldConfig.map(({ key }) => [
              key,
              String((request[key as keyof typeof request] as number) ?? ''),
            ]),
          ),
          phoneNumber:
            request.phoneNumber || user?.staffInfo?.primaryPhoneNumber || '',
          emailAddress:
            request.emailAddress || user?.staffInfo?.emailAddress || '',
          totalAdditionalSalaryRequested:
            request.totalAdditionalSalaryRequested || '',
          additionalInfo: request.additionalInfo || '',
          electionType403b:
            request.electionType403b ?? ElectionType403bEnum.None,
        } as CompleteFormValues;
      }
    }
  }

  const initialValues = initialValuesRef.current ?? defaultInitialValues;

  const getMaxForField = useCallback(
    (field: (typeof fieldConfig)[number]): number | undefined => {
      if (!field.salaryInfoIntKey || !field.salaryInfoUssKey || !salaryInfo) {
        return undefined;
      }
      const key = isInternational
        ? field.salaryInfoIntKey
        : field.salaryInfoUssKey;
      return salaryInfo[key] as number | undefined;
    },
    [salaryInfo, isInternational],
  );

  const validationSchema = useMemo(
    () =>
      yup.object({
        ...Object.fromEntries(
          fieldConfig.map((field) => [
            field.key,
            createCurrencyValidation(field.label, getMaxForField(field)),
          ]),
        ),
        phoneNumber: phoneNumber(i18n.t).required(
          i18n.t('Phone Number is required.'),
        ),
        emailAddress: yup
          .string()
          .required(t('Email address is required'))
          .email(t('Please enter a valid email address')),
        totalAdditionalSalaryRequested: yup
          .number()
          .test(
            'total-within-remaining-allowable-salary',
            t('Exceeds account balance.'),
            function () {
              const total = getTotal(this.parent as CompleteFormValues);

              if (total >= 0) {
                lastValidTotalRef.current = total;
              }

              return lastValidTotalRef.current <= primaryAccountBalance;
            },
          ),
        additionalInfo: yup
          .string()
          .test(
            'required-when-exceeds-cap',
            t('Additional info is required for requests exceeding your cap.'),
            function (value) {
              if (
                requestData?.latestAdditionalSalaryRequest
                  ?.progressiveApprovalTierReason ===
                ProgressiveApprovalTierReasonEnum.BoardCapException
              ) {
                return true;
              }
              const total = getTotal(this.parent as CompleteFormValues);
              if (total > 0) {
                lastValidTotalRef.current = total;
              }
              const stableTotal = total > 0 ? total : lastValidTotalRef.current;

              const exceedsCap = stableTotal > individualCap;

              if (exceedsCap) {
                return !!value && value.trim().length > 0;
              }
              return true;
            },
          ),
        electionType403b: yup
          .string()
          .required(
            t('Please select how you would like to contribute to your 403(b).'),
          ),
      }),
    [
      createCurrencyValidation,
      fieldConfig,
      getMaxForField,
      t,
      primaryAccountBalance,
      individualCap,
      locale,
      requestData,
    ],
  );

  const onSubmit = useCallback(
    async (values: CompleteFormValues) => {
      if (!requestId) {
        return;
      }

      await updateAdditionalSalaryRequest({
        variables: {
          id: requestId,
          attributes: {
            ...Object.fromEntries(
              Object.entries(values)
                // The total is computed server-side
                .filter(([key]) => key !== 'totalAdditionalSalaryRequested')
                .map(([key, value]) =>
                  typeof value === 'string' &&
                  key !== 'phoneNumber' &&
                  key !== 'emailAddress' &&
                  key !== 'additionalInfo' &&
                  key !== 'electionType403b'
                    ? [key, parseFloat(value) || 0]
                    : [key, value],
                ),
            ),
          },
        },
      });

      await submitAdditionalSalaryRequest({
        variables: {
          id: requestId,
        },
      });

      handleNextStep();
    },
    [
      requestId,
      updateAdditionalSalaryRequest,
      submitAdditionalSalaryRequest,
      handleNextStep,
    ],
  );

  const formik = useFormik<CompleteFormValues>({
    initialValues,
    validationSchema,
    onSubmit,
    enableReinitialize: true,
    validateOnMount: true,
  });

  return { ...formik, validationSchema };
};
