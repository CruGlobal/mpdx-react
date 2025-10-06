import { createContext, useContext } from 'react';
import { ActionTypeEnum } from '../../mockData';

export const CalendarTypeContext = createContext<ActionTypeEnum | null>(null);

export const useCalendarType = (): ActionTypeEnum => {
  const context = useContext(CalendarTypeContext);
  if (!context) {
    throw new Error(
      'Could not find CalendarTypeContext. Make sure that your component is inside <CalendarTypeProvider>.',
    );
  }
  return context;
};

interface CalendarContextProps {
  type: ActionTypeEnum;
  children?: React.ReactNode;
}

export const CalendarTypeProvider: React.FC<CalendarContextProps> = ({
  children,
  type,
}) => {
  return (
    <CalendarTypeContext.Provider value={type}>
      {children}
    </CalendarTypeContext.Provider>
  );
};
