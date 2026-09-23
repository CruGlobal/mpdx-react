import { useMemo } from 'react';
import { useLoadCoachingListQuery } from 'src/components/Coaching/LoadCoachingList.generated';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { useDeveloperBypass } from 'src/hooks/useDeveloperBypass';
import { useHrToolsNavItems } from 'src/hooks/useHrToolsNavItems';
import { useReportNavItems } from 'src/hooks/useReportNavItems';
import { useReportsDisabled } from 'src/hooks/useReportsDisabled';
import { NavigationVisibility } from './intents';

interface NavigationVisibilityResult {
  visibility: NavigationVisibility;
  isLoading: boolean;
}

// Mirrors what the nav shows, so the assistant never links to a page the user cannot see there
export const useNavigationVisibility = (): NavigationVisibilityResult => {
  const { data: userData, loading: userLoading } = useGetUserQuery();
  const developerBypass = useDeveloperBypass();
  const { items: hrToolsItems, loading: hrToolsLoading } = useHrToolsNavItems();
  const reportItems = useReportNavItems();
  const { loading: reportsDisabledLoading } = useReportsDisabled();
  const { data: coachingData, loading: coachingLoading } =
    useLoadCoachingListQuery();

  const userType = userData?.user.userType;
  const canSeeHrTools =
    userType === UserTypeEnum.UsStaff ||
    userType === UserTypeEnum.HybridStaff ||
    developerBypass;
  const hrTools =
    (!userData || canSeeHrTools) && !hrToolsLoading && hrToolsItems.length > 0;
  const coaching = !!coachingData?.coachingAccountLists.totalCount;
  const staffFeatures = reportItems.some((item) => item.id === 'staffExpense');

  const isLoading =
    userLoading || hrToolsLoading || reportsDisabledLoading || coachingLoading;

  return useMemo(
    () => ({
      visibility: {
        hr_tools: hrTools,
        coaching,
        reports: true,
        staff_features: staffFeatures,
      },
      isLoading,
    }),
    [hrTools, coaching, staffFeatures, isLoading],
  );
};
