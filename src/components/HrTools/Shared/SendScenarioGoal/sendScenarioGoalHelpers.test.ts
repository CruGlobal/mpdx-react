import i18n from 'src/lib/i18n';
import {
  SendableScenarioGoal,
  isValidEmailAddress,
  normalizeEmailAddress,
  scenarioGoalSendBlockedReason,
} from './sendScenarioGoalHelpers';

const t = i18n.t;

const sendableGoal: SendableScenarioGoal = {
  id: 'scenario-1',
  firstName: 'Jane',
  lastName: 'Doe',
  geographicLocation: 'Orlando',
  calculationsYear: 2026,
};

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
      'A first name, last name, geographic location, and year are required before the worksheet can be emailed.',
    );
  });
});

describe('normalizeEmailAddress', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmailAddress('  Jane@Example.com ')).toBe(
      'jane@example.com',
    );
  });
});

describe('isValidEmailAddress', () => {
  it.each(['jane@example.com', 'first.last+tag@sub.example.org'])(
    'accepts %s',
    (address) => {
      expect(isValidEmailAddress(address)).toBe(true);
    },
  );

  it.each(['', 'jane', 'jane@', '@example.com', 'a@x.com,b@y.com'])(
    'rejects "%s"',
    (address) => {
      expect(isValidEmailAddress(address)).toBe(false);
    },
  );
});
