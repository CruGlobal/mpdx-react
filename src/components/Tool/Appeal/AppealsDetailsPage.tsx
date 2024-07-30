import React, { useContext } from 'react';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import { AppealsLeftPanel } from './AppealDetails/AppealLeftPanel/AppealsLeftPanel';
import { AppealsMainPanel } from './AppealDetails/AppealsMainPanel/AppealsMainPanel';
import { AppealsContext, AppealsType } from './AppealsContext/AppealsContext';

const AppealsDetailsPage: React.FC = () => {
  const { filterPanelOpen, contactDetailsOpen } = useContext(
    AppealsContext,
  ) as AppealsType;

  return (
    <SidePanelsLayout
      leftPanel={<AppealsLeftPanel />}
      leftOpen={filterPanelOpen}
      leftWidth="290px"
      mainContent={<AppealsMainPanel />}
      rightPanel={<p>Contact</p>}
      rightOpen={contactDetailsOpen}
      rightWidth="60%"
      headerHeight={headerHeight}
    />
  );
};

export default AppealsDetailsPage;
