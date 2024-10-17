import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
  PhaseEnum,
  StatusEnum,
} from 'src/graphql/types.generated';
import { possiblePartnerStatus } from './possiblePartnerStatus';

const followUpPhase: Phase | null =
  loadConstantsMockData?.constant?.phases?.find(
    (phase) => phase?.id === PhaseEnum.FollowUp,
  ) || null;

describe('possiblePartnerStatus', () => {
  it('provides the correct suggestedPartnerStatus', async () => {
    expect(
      possiblePartnerStatus(
        followUpPhase,
        DisplayResultEnum.FollowUpResultPartnerFinancial,
        ActivityTypeEnum.FollowUpEmail,
      )?.suggestedContactStatus,
    ).toEqual(StatusEnum.PartnerFinancial);
  });
  it('returns null if the Result provided is not in the Phase', async () => {
    expect(
      possiblePartnerStatus(
        followUpPhase,
        DisplayResultEnum.InitiationResultAppointmentScheduled,
        ActivityTypeEnum.FollowUpEmail,
      )?.suggestedContactStatus,
    ).toEqual(null);
  });
});
