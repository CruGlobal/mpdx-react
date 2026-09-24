import { MockedResponse } from '@apollo/client/testing';
import {
  AssistantSettingsDocument,
  AssistantSettingsFieldsFragment,
} from './AssistantSettings.generated';

export const assistantSettingsMock = (
  overrides: Partial<AssistantSettingsFieldsFragment> = {},
): AssistantSettingsFieldsFragment => ({
  id: 'assistant-settings-1',
  enabled: false,
  launcherHidden: false,
  helpEnabled: false,
  accountSummaryEnabled: false,
  partnersEnabled: false,
  partnerDetailsEnabled: false,
  suggestEnabled: false,
  prayerLettersEnabled: false,
  historyEnabled: false,
  profileReviewedAt: null,
  ministryRole: null,
  family: null,
  petsHobbies: null,
  personality: null,
  voiceNotes: null,
  sampleLetter: null,
  neverMention: null,
  ...overrides,
});

export const getAssistantSettingsMock = (
  overrides: Partial<AssistantSettingsFieldsFragment> = {},
): MockedResponse => ({
  request: { query: AssistantSettingsDocument },
  result: { data: { assistantSettings: assistantSettingsMock(overrides) } },
});
