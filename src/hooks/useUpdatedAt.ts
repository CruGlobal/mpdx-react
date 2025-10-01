import { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';
import { formatRelativeTime } from 'src/lib/intlFormat';

export const useUpdatedAt = (updatedAt: DateTime | null, locale: string) => {
  const [now, setNow] = useState(DateTime.now());

  useEffect(() => {
    if (!updatedAt) {
      return;
    }

    const id = setInterval(() => {
      setNow(DateTime.now());
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [updatedAt]);

  return useMemo(() => {
    if (!updatedAt) {
      return null;
    }

    const milliseconds = updatedAt.diff(now).as('milliseconds');

    const relativeTime = formatRelativeTime(milliseconds, locale);
    return relativeTime === 'now'
      ? 'Updated just now'
      : `Updated ${relativeTime}`;
  }, [updatedAt, now]);
};
