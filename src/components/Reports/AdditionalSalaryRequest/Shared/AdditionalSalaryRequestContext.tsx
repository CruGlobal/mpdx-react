import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';

export type AdditionalSalaryRequestType = {
  selectedSection: AdditionalSalaryRequestSectionEnum;
  setSelectedSection: (section: AdditionalSalaryRequestSectionEnum) => void;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  setDrawerOpen: (open: boolean) => void;
  loading: boolean;
};

const AdditionalSalaryRequestContext =
  createContext<AdditionalSalaryRequestType | null>(null);

export const useAdditionalSalaryRequest = (): AdditionalSalaryRequestType => {
  const context = React.useContext(AdditionalSalaryRequestContext);
  if (context === null) {
    throw new Error(
      'Could not find AdditionalSalaryRequestContext. Make sure that your component is inside <AdditionalSalaryRequestProvider>.',
    );
  }
  return context;
};

interface Props {
  children?: React.ReactNode;
}

export const AdditionalSalaryRequestProvider: React.FC<Props> = ({
  children,
}) => {
  const [selectedSection, setSelectedSectionState] =
    useState<AdditionalSalaryRequestSectionEnum>(
      AdditionalSalaryRequestSectionEnum.AboutForm,
    );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading] = useState(false);

  const setSelectedSection = useCallback(
    (section: AdditionalSalaryRequestSectionEnum) => {
      setSelectedSectionState(section);
      if (section === AdditionalSalaryRequestSectionEnum.AboutForm) {
        setIsDrawerOpen(true);
      }
    },
    [],
  );

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);

  const contextValue = useMemo(
    () => ({
      selectedSection,
      setSelectedSection,
      isDrawerOpen,
      toggleDrawer,
      setDrawerOpen: setIsDrawerOpen,
      loading,
    }),
    [selectedSection, setSelectedSection, isDrawerOpen, toggleDrawer, loading],
  );

  return (
    <AdditionalSalaryRequestContext.Provider value={contextValue}>
      {children}
    </AdditionalSalaryRequestContext.Provider>
  );
};
