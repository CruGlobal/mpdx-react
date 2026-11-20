import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { useIneligibleByGroup } from 'src/hooks/useIneligibleByGroup';

/** How the Staff Information card relates to the signed-in viewer. */
export const useStaffCardViewer = (
  viewingSpouse: boolean,
): { avatarSrc: string | null; otherIsViewer: boolean } => {
  const { data } = useGetUserQuery();
  // The questionnaire's staff member is always new staff, so any other viewer is their spouse
  const { inNsGoalCalcIneligibleGroup } = useIneligibleByGroup();
  const viewerIsStaffMember = !inNsGoalCalcIneligibleGroup;
  const showsStaffMember = !viewingSpouse;

  return {
    // Only the viewer's own avatar is available, and only on the staff member's card
    avatarSrc:
      showsStaffMember && viewerIsStaffMember
        ? (data?.user.avatar ?? null)
        : null,
    // The toggle's other person is the viewer when the card shows the other spouse
    otherIsViewer: viewingSpouse === viewerIsStaffMember,
  };
};
