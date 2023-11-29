import { AdapterLuxon as BaseAdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime, Info } from 'luxon';

// Customize AdapterLuxon to make the start of the week Sunday instead of Monday
// Based on https://github.com/mui/material-ui-pickers/issues/1270#issuecomment-567075962
export class AdapterLuxon extends BaseAdapterLuxon {
  getWeekdays = () => {
    // need to copy the existing, and use Info to preserve localization
    const days = Info.weekdaysFormat('narrow', { locale: this.locale });
    // remove Sun from end of list and move to start of list
    return [days[6], ...days.slice(0, 6)];
  };

  getWeekArray = (date: DateTime) => {
    const endDate = date
      .endOf('month')
      // if a month ends on sunday, luxon will consider it already the end of the week
      // but we need to get the _entire_ next week to properly lay that out
      // so we add one more day to cover that before getting the end of the week
      .plus({ days: 1 })
      .endOf('week');
    const startDate = date
      .startOf('month')
      .startOf('week')
      // must subtract 1, because startOf('week') will be Mon, but we want weeks to start on Sun
      // this is the basis for every day in a our calendar
      .minus({ days: 1 });

    const { days } = endDate.diff(startDate, 'days').toObject();

    const weeks: DateTime[][] = [];
    new Array(Math.round(days || 0))
      .fill(0)
      .map((_, index) => index)
      .map((day) => startDate.plus({ days: day }))
      .forEach((day, index) => {
        if (index === 0 || (index % 7 === 0 && index > 6)) {
          weeks.push([day]);
          return;
        }

        weeks[weeks.length - 1].push(day);
      });

    // a consequence of all this shifting back/forth 1 day is that you might end up with a week
    // where all the days are actually in the previous or next month.
    // this happens when the first day of the month is Sunday (Dec 2019 or Mar 2020 are examples)
    // or the last day of the month is Sunday (May 2020 or Jan 2021 is one example)
    // so we're only including weeks where ANY day is in the correct month to handle that
    return weeks.filter((w) => w.some((d) => d.month === date.month));
  };
}
