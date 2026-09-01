import { loadConstantsMockData } from 'src/components/Constants/LoadConstantsMock';
import {
  ActivityTypeEnum,
  DisplayResultEnum,
  Phase,
  PhaseEnum,
  ResultEnum,
} from 'src/graphql/types.generated';
import { ActivityData } from 'src/hooks/usePhaseData';
import {
  extractSuggestedTags,
  getDatabaseValueFromResult,
  handleTaskActionChange,
  handleTaskPhaseChange,
} from './TaskModalHelper';

const phaseTags: string[] = loadConstantsMockData?.constant?.phases
  ?.find((phase) => phase?.id === PhaseEnum.Appointment)
  ?.results?.tags?.map((tag) => tag?.value as string) || [''];

const appointmentPhase: Phase | null =
  loadConstantsMockData?.constant?.phases?.find(
    (phase) => phase?.id === PhaseEnum.Appointment,
  ) || null;

const sampleSelectedSuggestedTags = [
  'asked for connections',
  'asked for support',
];
const otherTags = ['test', '2023'];
const allTags = [...otherTags, ...sampleSelectedSuggestedTags];

const activityTypes = new Map<ActivityTypeEnum, ActivityData>([
  [
    ActivityTypeEnum.AppointmentInPerson,
    {
      phaseId: PhaseEnum.Appointment,
      phase: 'Appointment',
      subject: 'In Person Appointment',
    },
  ],
]);

const setFieldValue = jest.fn();
const setActionSelected = jest.fn();
const noop = jest.fn();

describe('TaskModalHelper', () => {
  it('correctly splits suggested tags from tag list', async () => {
    expect(extractSuggestedTags(allTags, phaseTags).additionalTags).toEqual(
      otherTags,
    );
    expect(extractSuggestedTags(allTags, phaseTags).suggestedTags).toEqual(
      sampleSelectedSuggestedTags,
    );
  });

  it('keeps a custom task name when the phase changes before an action is selected', () => {
    handleTaskPhaseChange({
      phase: PhaseEnum.FollowUp,
      activities: [ActivityTypeEnum.FollowUpInPerson],
      activityType: undefined,
      currentTaskName: 'Coffee with the Johnsons',
      activityTypes,
      setFieldValue,
      setActionSelected,
      setFieldTouched: noop,
      setResultSelected: noop,
      setPhaseId: noop,
      setSelectedSuggestedTags: noop,
      focusActivity: noop,
    });

    expect(setFieldValue).not.toHaveBeenCalledWith(
      'subject',
      expect.anything(),
    );
  });

  it('clears the task name when the action is removed and the name is still the default', () => {
    handleTaskActionChange({
      activityType: null,
      previousActivityType: ActivityTypeEnum.AppointmentInPerson,
      currentTaskName: 'In Person Appointment',
      activityTypes,
      setFieldValue,
      setActionSelected,
      setFieldTouched: noop,
    });

    expect(setActionSelected).toHaveBeenCalledWith(null);
    expect(setFieldValue).toHaveBeenCalledWith('subject', '');
  });

  it('keeps a custom task name when the action is removed', () => {
    handleTaskActionChange({
      activityType: null,
      previousActivityType: ActivityTypeEnum.AppointmentInPerson,
      currentTaskName: 'Coffee with the Johnsons',
      activityTypes,
      setFieldValue,
      setActionSelected,
      setFieldTouched: noop,
    });

    expect(setActionSelected).toHaveBeenCalledWith(null);
    expect(setFieldValue).not.toHaveBeenCalledWith(
      'subject',
      expect.anything(),
    );
  });

  it('converts a display result to its backend result', () => {
    expect(
      getDatabaseValueFromResult(
        appointmentPhase,
        DisplayResultEnum.AppointmentResultCancelled,
        ActivityTypeEnum.AppointmentInPerson,
      ),
    ).toBe(ResultEnum.Attempted);
    expect(
      getDatabaseValueFromResult(
        appointmentPhase,
        DisplayResultEnum.AppointmentResultCancelled,
        ActivityTypeEnum.PartnerCareEmail,
      ),
    ).toBe(ResultEnum.None);
    expect(getDatabaseValueFromResult(null, ResultEnum.Attempted)).toBe(
      ResultEnum.Attempted,
    );
  });
});
