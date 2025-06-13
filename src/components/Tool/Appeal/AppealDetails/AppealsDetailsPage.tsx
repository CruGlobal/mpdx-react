import React, { useContext } from 'react';
import { DynamicContactsRightPanel } from 'src/components/Contacts/ContactsRightPanel/DynamicContactsRightPanel';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import { headerHeight } from 'src/components/Shared/Header/ListHeader';
import {
  ContactPanelProvider,
  useContactPanel,
} from 'src/components/common/ContactPanelProvider/ContactPanelProvider';
import { AppealsContext, AppealsType } from '../AppealsContext/AppealsContext';
import { AppealsLeftPanel } from './AppealLeftPanel/AppealsLeftPanel';
import { AppealsMainPanel } from './AppealsMainPanel/AppealsMainPanel';

const PageContent: React.FC = () => {
  const { isOpen } = useContactPanel();
  const { filterPanelOpen } = useContext(AppealsContext) as AppealsType;

  return (
    <SidePanelsLayout
      leftPanel={<AppealsLeftPanel />}
      leftOpen={filterPanelOpen}
      leftWidth="290px"
      mainContent={<AppealsMainPanel />}
      rightPanel={isOpen ? <DynamicContactsRightPanel /> : undefined}
      rightOpen={isOpen}
      rightWidth="60%"
      headerHeight={headerHeight}
    />
  );
};

const AppealsDetailsPage: React.FC = () => (
  <ContactPanelProvider contactIdParam="appealId">
    <PageContent />
  </ContactPanelProvider>
);

export default AppealsDetailsPage;
