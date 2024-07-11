import React, { useContext } from 'react';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import {
  TableViewModeEnum,
  headerHeight,
} from 'src/components/Shared/Header/ListHeader';
import { ContactContextTypesEnum } from 'src/lib/contactContextTypes';
import { AppealsLeftPanel } from './AppealDetails/AppealLeftPanel/AppealsLeftPanel';
import { AppealsMainPanel } from './AppealDetails/AppealsMainPanel/AppealsMainPanel';
import { AppealsContext, AppealsType } from './AppealsContext/AppealsContext';

const AppealsDetailsPage: React.FC = () => {
  const { filterPanelOpen, setContactFocus, viewMode, contactDetailsOpen } =
    useContext(AppealsContext) as AppealsType;

  return (
    <SidePanelsLayout
      leftPanel={<AppealsLeftPanel />}
      leftOpen={filterPanelOpen}
      leftWidth="290px"
      mainContent={<AppealsMainPanel />}
      rightPanel={
        <DynamicContactsRightPanel
          onClose={() =>
            setContactFocus(
              undefined,
              true,
              viewMode === TableViewModeEnum.Flows,
              viewMode === TableViewModeEnum.Map,
            )
          }
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
