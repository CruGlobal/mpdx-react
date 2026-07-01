import Head from 'next/head';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { blockImpersonatingNonDevelopers } from 'pages/api/utils/pagePropsHelpers';
import { NsoMpdQuestionnaire } from 'src/components/HrTools/NsoMpdQuestionnaire/NsoMpdQuestionnaire';
import {
  NsoMpdQuestionnaireProvider,
  useNsoMpdQuestionnaire,
} from 'src/components/HrTools/NsoMpdQuestionnaire/Shared/NsoMpdQuestionnaireContext';
import { SavingStatus } from 'src/components/HrTools/Shared/CalculationReports/SavingStatus/SavingStatus';
import { SidePanelsLayout } from 'src/components/Layouts/SidePanelsLayout';
import Loading from 'src/components/Loading';
import {
  HeaderTypeEnum,
  MultiPageHeader,
  multiPageHeaderHeight,
} from 'src/components/Shared/MultiPageLayout/MultiPageHeader';
import {
  MultiPageMenu,
  NavTypeEnum,
} from 'src/components/Shared/MultiPageLayout/MultiPageMenu/MultiPageMenu';
import {
  RequiredUserGroupEnum,
  UserTypeAccess,
} from 'src/components/Shared/UserTypeAccess/UserTypeAccess';
import { ReportPageWrapper } from 'src/components/Shared/styledComponents/ReportPageWrapper';
import { useAccountListId } from 'src/hooks/useAccountListId';
import { getAppName } from 'src/lib/getAppName';

interface NsoMpdQuestionnaireContentProps {
  isNavListOpen: boolean;
  onNavListToggle: () => void;
}

const NsoMpdQuestionnaireSavingStatus: React.FC = () => {
  const { questionnaire, loading, isMutating } = useNsoMpdQuestionnaire();
  return (
    <SavingStatus
      loading={loading}
      hasData={!!questionnaire}
      isMutating={isMutating}
      lastSavedAt={questionnaire?.updatedAt ?? null}
    />
  );
};

const NsoMpdQuestionnaireContent: React.FC<NsoMpdQuestionnaireContentProps> = ({
  isNavListOpen,
  onNavListToggle,
}) => {
  const { t } = useTranslation();

  return (
    <SidePanelsLayout
      isScrollBox={false}
      leftPanel={
        <MultiPageMenu
          isOpen={isNavListOpen}
          selectedId="nsoMpdQuestionnaire"
          onClose={onNavListToggle}
          navType={NavTypeEnum.HrTools}
        />
      }
      leftOpen={isNavListOpen}
      leftWidth="290px"
      headerHeight={multiPageHeaderHeight}
      mainContent={
        <>
          <MultiPageHeader
            isNavListOpen={isNavListOpen}
            onNavListToggle={onNavListToggle}
            title={t('NSO MPD Questionnaire')}
            rightExtra={<NsoMpdQuestionnaireSavingStatus />}
            headerType={HeaderTypeEnum.HrTools}
          />
          <NsoMpdQuestionnaire />
        </>
      }
    />
  );
};

export const NsoMpdQuestionnairePage: React.FC = () => {
  const { t } = useTranslation();
  const appName = getAppName();
  const accountListId = useAccountListId();
  const [isNavListOpen, setNavListOpen] = useState(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <>
      <Head>
        <title>{`${appName} | ${t('HR Tools | NSO MPD Questionnaire')}`}</title>
      </Head>
      {accountListId ? (
        <UserTypeAccess requireUserGroups={RequiredUserGroupEnum.NsGoalCalc}>
          <ReportPageWrapper>
            <NsoMpdQuestionnaireProvider>
              <NsoMpdQuestionnaireContent
                isNavListOpen={isNavListOpen}
                onNavListToggle={handleNavListToggle}
              />
            </NsoMpdQuestionnaireProvider>
          </ReportPageWrapper>
        </UserTypeAccess>
      ) : (
        <Loading loading />
      )}
    </>
  );
};

export const getServerSideProps = blockImpersonatingNonDevelopers;

export default NsoMpdQuestionnairePage;
