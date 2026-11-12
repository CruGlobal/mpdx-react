import i18n from 'src/lib/i18n';
import { coachLabel, coachName, coachToOption } from './coachHelpers';

const t = i18n.t;

const coach = (
  id: string,
  firstName: string | null,
  lastName: string | null,
  email: string | null = `${id}@cru.org`,
) => ({ id, firstName, lastName, email });

describe('coachName', () => {
  it.each([
    ['Amy', 'Wilson', 'Amy Wilson'],
    ['Amy', null, 'Amy'],
    [null, 'Jones', 'Jones'],
    [null, null, null],
    ['', '', null],
  ])('names (%s, %s) as %s', (firstName, lastName, name) => {
    expect(coachName({ firstName, lastName })).toBe(name);
  });
});

describe('coachLabel', () => {
  it('joins the names a coach has, without stray whitespace', () => {
    expect(coachLabel(coach('coach-x', null, 'Jones'), t)).toBe('Jones');
    expect(coachLabel(coach('coach-x', 'Amy', 'Wilson'), t)).toBe('Amy Wilson');
  });

  it('falls back to the email when no name is on file', () => {
    expect(coachLabel(coach('coach-7', null, null), t)).toBe('coach-7@cru.org');
  });

  it('falls back to a placeholder when there is no name and no email', () => {
    expect(coachLabel(coach('coach-8', null, null, null), t)).toBe(
      'Unnamed coach',
    );
  });
});

describe('coachToOption', () => {
  it.each([
    [coach('coach-1', 'Amy', 'Wilson'), 'Amy Wilson'],
    [coach('coach-7', null, null), 'coach-7@cru.org'],
    [coach('coach-8', null, null, null), 'Unnamed coach'],
  ])('labels the option for %j as "%s"', (option, name) => {
    expect(coachToOption(option, t)).toEqual({ id: option.id, name });
  });

  it('labels the option exactly as the table cell labels the same coach', () => {
    const nameless = coach('coach-8', null, null, null);
    expect(coachToOption(nameless, t).name).toBe(coachLabel(nameless, t));
  });
});
