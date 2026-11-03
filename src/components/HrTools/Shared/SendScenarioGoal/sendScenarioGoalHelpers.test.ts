import i18n from 'src/lib/i18n';
import {
  SendableScenarioGoal,
  isValidEmailAddress,
  scenarioGoalSendBlockedReason,
  splitEmailAddresses,
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

describe('splitEmailAddresses', () => {
  it('splits on commas, semicolons, and whitespace and lowercases', () => {
    expect(
      splitEmailAddresses(
        ' A@example.com, b@example.com;c@example.com\nd@x.org ',
      ),
    ).toEqual(['a@example.com', 'b@example.com', 'c@example.com', 'd@x.org']);
  });

  it('returns nothing for blank text', () => {
    expect(splitEmailAddresses(' , ; ')).toEqual([]);
  });
});

describe('isValidEmailAddress', () => {
  it.each(['jane@example.com', 'first.last+tag@sub.example.org'])(
    'accepts %s',
    (address) => {
      expect(isValidEmailAddress(address)).toBe(true);
    },
  );

  it.each([
    '',
    'jane',
    'jane@',
    '@example.com',
    'coach@localhost',
    'a..b@example.com',
    'a@x.com,b@y.com',
  ])('rejects "%s" like the API\'s strict check', (address) => {
    expect(isValidEmailAddress(address)).toBe(false);
  });
});
