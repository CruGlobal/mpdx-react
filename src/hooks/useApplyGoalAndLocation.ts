import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useUpdateAccountPreferencesMutation } from 'src/components/Settings/preferences/accordions/UpdateAccountPreferences.generated';
import { currencyFormat } from 'src/lib/intlFormat';
import { useAccountGeographicLocationQuery } from './AccountGeographicLocation.generated';
import { useAccountListId } from './useAccountListId';
import { GEOGRAPHIC_LOCATION_NONE } from './useGoalCalculatorConstants';
import { useLocale } from './useLocale';

interface ApplyGoalAndLocationOptions {
  refetchQueries?: string[];
}

export const useApplyGoalAndLocation = (geographicLocation: string | null) => {
  const { t } = useTranslation();
  const locale = useLocale();
  const { enqueueSnackbar } = useSnackbar();
  const accountListId = useAccountListId();
  const { data } = useAccountGeographicLocationQuery({
    variables: { accountListId },
  });
  const [updateAccountPreferences, { loading }] =
    useUpdateAccountPreferencesMutation();

  // The location dropdowns will always default to "None" if the location is null, so we can treat null as "None" for comparison purposes.
  const normalizedGeographicLocation =
    geographicLocation ?? GEOGRAPHIC_LOCATION_NONE;
  const savedGeographicLocation =
    data?.accountList?.settings?.geographicLocation ?? GEOGRAPHIC_LOCATION_NONE;
  const geographicLocationChanged =
    savedGeographicLocation !== normalizedGeographicLocation;

  const applyMonthlyGoal = (
    monthlyGoal?: number,
    options?: ApplyGoalAndLocationOptions,
  ) => {
    return updateAccountPreferences({
      variables: {
        input: {
          id: accountListId,
          attributes: {
            id: accountListId,
            settings: {
              ...(monthlyGoal !== undefined && { monthlyGoal }),
              geographicLocation: normalizedGeographicLocation,
            },
          },
        },
      },
      refetchQueries: options?.refetchQueries,
      onCompleted: () => {
        // Salary and NSO questionnaire does not require a monthly goal, so
        // don't show a success message if undefined. The callers can handle
        // showing a success message if needed.
        if (monthlyGoal === undefined) {
          return;
        }

        const formattedTotal = currencyFormat(monthlyGoal, 'USD', locale);
        enqueueSnackbar(
          !geographicLocationChanged
            ? t(
                'Successfully updated your monthly goal to {{formattedTotal}}!',
                { formattedTotal },
              )
            : t(
                'Successfully updated your monthly goal to {{formattedTotal}} and geographic location to {{geographicLocation}}!',
                {
                  formattedTotal,
                  geographicLocation: normalizedGeographicLocation,
                },
              ),
          { variant: 'success' },
        );
      },
    });
  };

  return {
    applyMonthlyGoal,
    geographicLocationChanged,
    normalizedGeographicLocation,
    loading,
  };
};
