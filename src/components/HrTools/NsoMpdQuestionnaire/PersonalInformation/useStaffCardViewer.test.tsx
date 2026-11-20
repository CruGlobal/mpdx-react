import { ReactElement } from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useGetUserQuery } from 'src/components/User/GetUser.generated';
import { UsStaffGroupEnum } from 'src/graphql/types.generated';
import { NsoMpdQuestionnaireTestWrapper } from '../NsoMpdQuestionnaireTestWrapper';
import { useNsoMpdQuestionnaire } from '../Shared/NsoMpdQuestionnaireContext';
import { useStaffCardViewer } from './useStaffCardViewer';

const renderViewer = (
  viewerIsStaffMember: boolean | null,
  usStaffGroup: UsStaffGroupEnum,
) =>
  renderHook(
    () => ({
      viewer: useStaffCardViewer(false),
      loaded:
        Boolean(useGetUserQuery().data) &&
        Boolean(useNsoMpdQuestionnaire().questionnaire),
    }),
    {
      wrapper: ({ children }: { children: ReactElement }) => (
        <NsoMpdQuestionnaireTestWrapper
          usStaffGroup={usStaffGroup}
          newStaffQuestionnaire={{ viewerIsStaffMember }}
        >
          {children}
        </NsoMpdQuestionnaireTestWrapper>
      ),
    },
  );

const staffMemberView = { avatarSrc: 'avatar.jpg', otherIsViewer: false };
const spouseView = { avatarSrc: null, otherIsViewer: true };

describe('useStaffCardViewer', () => {
  it('treats the viewer as the staff member when the API says so, whatever their group', async () => {
    const { result, waitFor } = renderViewer(
      true,
      UsStaffGroupEnum.SeniorStaff,
    );
    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(result.current.viewer).toEqual(staffMemberView);
  });

  it('treats the viewer as the spouse when the API says so, whatever their group', async () => {
    const { result, waitFor } = renderViewer(false, UsStaffGroupEnum.NewStaff);
    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(result.current.viewer).toEqual(spouseView);
  });

  it('guesses the staff member from a new staff group when the API does not know', async () => {
    const { result, waitFor } = renderViewer(null, UsStaffGroupEnum.NewStaff);
    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(result.current.viewer).toEqual(staffMemberView);
  });

  it('guesses the spouse from another staff group when the API does not know', async () => {
    const { result, waitFor } = renderViewer(
      null,
      UsStaffGroupEnum.SeniorStaff,
    );
    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(result.current.viewer).toEqual(spouseView);
  });
});
