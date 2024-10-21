import React, { useContext } from 'react';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import { ContactContextTypesEnum } from 'src/lib/contactContextTypes';
import { AppealsContext, AppealsType } from '../AppealsContext/AppealsContext';
import { AppealsLeftPanel } from './AppealLeftPanel/AppealsLeftPanel';
import { AppealsMainPanel } from './AppealsMainPanel/AppealsMainPanel';

const AppealsDetailsPage: React.FC = () => {
  const { filterPanelOpen, setContactFocus, contactDetailsOpen } = useContext(
    AppealsContext,
  ) as AppealsType;

  return (
    <SidePanelsLayout
      leftPanel={<AppealsLeftPanel />}
      leftOpen={filterPanelOpen}
      leftWidth="290px"
      mainContent={<AppealsMainPanel />}
      rightPanel={
        <DynamicContactsRightPanel
          onClose={() => setContactFocus(undefined)}
          contextType={ContactContextTypesEnum.Appeals}
        />
      }
      rightOpen={contactDetailsOpen}
      rightWidth="60%"
      headerHeight={headerHeight}
    />
  );
};

export default AppealsDetailsPage;
