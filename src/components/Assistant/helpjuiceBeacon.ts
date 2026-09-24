import { useEffect } from 'react';

// Sets one inline style on the Helpjuice beacon while active and puts back whatever was there before
export const useHelpjuiceBeaconStyle = (
  active: boolean,
  property: string,
  value: string,
): void => {
  useEffect(() => {
    const beacon = document.getElementById('helpjuice-widget');
    if (!active || !beacon) {
      return;
    }
    const previous = beacon.style.getPropertyValue(property);
    const priority = beacon.style.getPropertyPriority(property);
    beacon.style.setProperty(property, value, 'important');
    return () => beacon.style.setProperty(property, previous, priority);
  }, [active, property, value]);
};
