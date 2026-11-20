import { DateTime } from 'luxon';
import {
  deadlineFormat,
  deadlineToPickerValue,
  pickerValueToDeadline,
} from './questionnaireDeadline';

describe('questionnaireDeadline', () => {
  it('shows a deadline in Eastern time whatever the viewer zone', () => {
    expect(deadlineFormat('2027-01-20T22:00:00Z', 'en-US')).toBe(
      'Jan 20, 2027, 5:00 PM EST',
    );
  });

  it('opens the picker on the Eastern wall-clock time', () => {
    const value = deadlineToPickerValue('2027-01-20T22:00:00Z');

    expect(value?.toFormat('yyyy-MM-dd HH:mm')).toBe('2027-01-20 17:00');
  });

  it('opens the picker empty when there is no deadline', () => {
    expect(deadlineToPickerValue(null)).toBeNull();
  });

  it('reads the picked wall-clock time as Eastern time', () => {
    const picked = DateTime.local(2027, 7, 1, 17, 0);

    expect(pickerValueToDeadline(picked)).toBe('2027-07-01T21:00:00.000Z');
  });
});
