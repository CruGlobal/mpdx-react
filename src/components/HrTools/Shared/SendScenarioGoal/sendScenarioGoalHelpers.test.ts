import i18n from 'src/lib/i18n';
import {
  SendableScenarioGoal,
  isValidEmailAddress,
  scenarioGoalRecipients,
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
      'A first name, last name, geographic location, and year are required before the worksheet can be emailed.',
    );
  });

  it('allows sending a scenario with no email address of its own', () => {
    expect(
      scenarioGoalSendBlockedReason(
        { ...sendableGoal, emailAddress: null, spouseEmailAddress: null },
        t,
      ),
    ).toBeNull();
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

  it.each(['', 'jane', 'jane@', '@example.com'])('rejects "%s"', (address) => {
    expect(isValidEmailAddress(address)).toBe(false);
  });
});
