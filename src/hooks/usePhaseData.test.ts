import { renderHook } from '@testing-library/react-hooks';
import { PhaseEnum } from 'src/graphql/types.generated';
import { usePhaseData } from 'src/hooks/usePhaseData';

describe('usePhaseData', () => {
  it('should return correctly formatted phaseData', () => {
    const { result } = renderHook(() => usePhaseData(PhaseEnum.FollowUp));
    // taskPhases
    expect(result.current.taskPhases).toEqual([
      'INITIATION',
      'APPOINTMENT',
      'FOLLOW_UP',
      'PARTNER_CARE',
    ]);

    //phaseData
    expect(result.current.phaseData?.id).toEqual('FOLLOW_UP');
    expect(result.current.phaseData?.tasks).toEqual([
      'FOLLOW_UP_PHONE_CALL',
      'FOLLOW_UP_EMAIL',
      'FOLLOW_UP_TEXT_MESSAGE',
      'FOLLOW_UP_SOCIAL_MEDIA',
      'FOLLOW_UP_IN_PERSON',
    ]);
    expect(result.current.phaseData?.contactStatuses).toEqual([
      'CALL_FOR_DECISION',
    ]);

    // activitiesByPhase
    expect(
      Object.fromEntries(result.current.activitiesByPhase.entries()),
    ).toEqual({
      APPOINTMENT: [
        'APPOINTMENT_IN_PERSON',
        'APPOINTMENT_PHONE_CALL',
        'APPOINTMENT_VIDEO_CALL',
      ],
      ARCHIVE: [],
      CONNECTION: [],
      FOLLOW_UP: [
        'FOLLOW_UP_PHONE_CALL',
        'FOLLOW_UP_EMAIL',
        'FOLLOW_UP_TEXT_MESSAGE',
        'FOLLOW_UP_SOCIAL_MEDIA',
        'FOLLOW_UP_IN_PERSON',
      ],
      INITIATION: [
        'INITIATION_PHONE_CALL',
        'INITIATION_EMAIL',
        'INITIATION_TEXT_MESSAGE',
        'INITIATION_SOCIAL_MEDIA',
        'INITIATION_LETTER',
        'INITIATION_SPECIAL_GIFT_APPEAL',
        'INITIATION_IN_PERSON',
      ],
      PARTNER_CARE: [
        'PARTNER_CARE_PHONE_CALL',
        'PARTNER_CARE_EMAIL',
        'PARTNER_CARE_TEXT_MESSAGE',
        'PARTNER_CARE_SOCIAL_MEDIA',
        'PARTNER_CARE_IN_PERSON',
        'PARTNER_CARE_THANK',
        'PARTNER_CARE_DIGITAL_NEWSLETTER',
        'PARTNER_CARE_PHYSICAL_NEWSLETTER',
        'PARTNER_CARE_PRAYER_REQUEST',
        'PARTNER_CARE_UPDATE_INFORMATION',
        'PARTNER_CARE_TO_DO',
      ],
    });

    // activityTypes
    expect(
      Object.fromEntries(result.current.activityTypes.entries()),
    ).toMatchObject({
      INITIATION_LETTER: {
        name: 'Letter',
        phase: 'Initiation',
        phaseId: 'INITIATION',
        title: 'Initiation - Letter',
      },
      INITIATION_SPECIAL_GIFT_APPEAL: {
        name: 'Special Gift Appeal',
        phase: 'Initiation',
        phaseId: 'INITIATION',
        title: 'Initiation - Special Gift Appeal',
      },
      FOLLOW_UP_TEXT_MESSAGE: {
        name: 'Text Message',
        phase: 'Follow-Up',
        phaseId: 'FOLLOW_UP',
        title: 'Follow-Up - Text Message',
      },
      INITIATION_EMAIL: {
        name: 'Email',
        phase: 'Initiation',
        phaseId: 'INITIATION',
        title: 'Initiation - Email',
      },
      FOLLOW_UP_SOCIAL_MEDIA: {
        name: 'Social Media',
        phase: 'Follow-Up',
        phaseId: 'FOLLOW_UP',
        title: 'Follow-Up - Social Media',
      },
      APPOINTMENT_VIDEO_CALL: {
        name: 'Video Call',
        phase: 'Appointment',
        phaseId: 'APPOINTMENT',
        title: 'Appointment - Video Call',
      },
      PARTNER_CARE_TEXT_MESSAGE: {
        name: 'Text Message',
        phase: 'Partner Care',
        phaseId: 'PARTNER_CARE',
        title: 'Partner Care - Text Message',
      },
      INITIATION_SOCIAL_MEDIA: {
        name: 'Social Media',
        phase: 'Initiation',
        phaseId: 'INITIATION',
        title: 'Initiation - Social Media',
      },
    });
  });
});
