import i18n from 'src/lib/i18n';
import {
  SendableScenarioGoal,
  scenarioGoalRecipients,
  scenarioGoalSendBlockedReason,
} from './sendScenarioGoalHelpers';

const t = i18n.t;

const sendableGoal: SendableScenarioGoal = {
  id: 'scenario-1',
  firstName: 'Jane',
  lastName: 'Doe',
  geographicLocation: 'Orlando',
  calculationsYear: 2026,
  emailAddress: 'jane@example.com',
  spouseEmailAddress: null,
};

describe('scenarioGoalRecipients', () => {
  it('returns both addresses when the scenario has a spouse', () => {
    expect(
      scenarioGoalRecipients({
        ...sendableGoal,
        spouseEmailAddress: 'john@example.com',
      }),
    ).toEqual(['jane@example.com', 'john@example.com']);
  });

  it('lowercases and trims the way the API does', () => {
    expect(
      scenarioGoalRecipients({
        ...sendableGoal,
        emailAddress: '  Jane@Example.com ',
      }),
    ).toEqual(['jane@example.com']);
  });

  it('collapses a shared household address to one recipient', () => {
    expect(
      scenarioGoalRecipients({
        ...sendableGoal,
        spouseEmailAddress: 'JANE@example.com',
      }),
    ).toEqual(['jane@example.com']);
  });

  it('ignores blank addresses', () => {
    expect(
      scenarioGoalRecipients({
        ...sendableGoal,
        emailAddress: '   ',
        spouseEmailAddress: null,
      }),
    ).toEqual([]);
  });
});

describe('scenarioGoalSendBlockedReason', () => {
  it('returns null when the scenario can be sent', () => {
    expect(scenarioGoalSendBlockedReason(sendableGoal, t)).toBeNull();
  });

  it.each([
    'firstName',
    'lastName',
    'geographicLocation',
    'calculationsYear',
  ] as const)('blocks when %s is missing', (field) => {
    expect(
      scenarioGoalSendBlockedReason({ ...sendableGoal, [field]: null }, t),
    ).toBe(
      'A first name, last name, campus division, and year are required before the worksheet can be emailed.',
    );
  });

  it('blocks when no email address is on the scenario', () => {
    expect(
      scenarioGoalSendBlockedReason(
        { ...sendableGoal, emailAddress: null, spouseEmailAddress: null },
        t,
      ),
    ).toBe('This scenario goal has no email address to send the worksheet to.');
  });

  it('reports the missing fields before the missing address', () => {
    expect(
      scenarioGoalSendBlockedReason(
        { ...sendableGoal, lastName: null, emailAddress: null },
        t,
      ),
    ).toBe(
      'A first name, last name, campus division, and year are required before the worksheet can be emailed.',
    );
  });
});
