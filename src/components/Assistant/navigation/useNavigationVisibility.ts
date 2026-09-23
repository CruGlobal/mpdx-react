import { useMemo } from 'react';
import { useLoadCoachingListQuery } from 'src/components/Coaching/LoadCoachingList.generated';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UserTypeEnum } from 'src/graphql/types.generated';
import { useDeveloperBypass } from 'src/hooks/useDeveloperBypass';
import { useHrToolsNavItems } from 'src/hooks/useHrToolsNavItems';
import { useReportNavItems } from 'src/hooks/useReportNavItems';
import { NavigationVisibility } from './intents';

// Mirrors what the nav shows, so the assistant never links to a page the user cannot see there
export const useNavigationVisibility = (): NavigationVisibility => {
  const { data: userData } = useGetUserQuery();
  const developerBypass = useDeveloperBypass();
  const { items: hrToolsItems, loading: hrToolsLoading } = useHrToolsNavItems();
  const reportItems = useReportNavItems();
  const { data: coachingData } = useLoadCoachingListQuery();

  const userType = userData?.user.userType;
  const canSeeHrTools =
    userType === UserTypeEnum.UsStaff ||
    userType === UserTypeEnum.HybridStaff ||
    developerBypass;
  const hrTools =
    (!userData || canSeeHrTools) && !hrToolsLoading && hrToolsItems.length > 0;
  const coaching = !!coachingData?.coachingAccountLists.totalCount;
  const staffFeatures = reportItems.some((item) => item.id === 'staffExpense');

  return useMemo(
    () => ({
      hr_tools: hrTools,
      coaching,
      reports: true,
      staff_features: staffFeatures,
    }),
    [hrTools, coaching, staffFeatures],
  );
};
