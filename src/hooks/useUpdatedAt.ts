import { useEffect, useMemo, useState } from 'react';

export const useUpdatedAt = (updatedAt: Date | null) => {
  const [, setUpdatedAt] = useState(Date.now());

  useEffect(() => {
    if (!updatedAt) {
      return;
    }

    const id = setInterval(() => {
      setUpdatedAt(Date.now());
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [updatedAt]);

  return useMemo(() => {
    if (!updatedAt) {
      return null;
    }

    const timeElapsed = Date.now() - updatedAt.getTime();
    const minutesElapsed = Math.floor(timeElapsed / 60_000);
    const hoursElapsed = Math.floor(minutesElapsed / 60);
    const daysElapsed = Math.floor(hoursElapsed / 24);

    if (minutesElapsed < 1) {
      return `Updated just now`;
    }

    if (hoursElapsed < 1) {
      return `Updated ${minutesElapsed} minutes ago`;
    }

    if (daysElapsed < 1) {
      return `Updated ${hoursElapsed} hours ago`;
    }

    return `Updated ${daysElapsed} day${daysElapsed === 1 ? '' : 's'} ago`;
  }, [updatedAt]);
};
