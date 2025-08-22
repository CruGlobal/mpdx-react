import React from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList } from '../SharedComponents/SectionList';

export const SettingsSectionList: React.FC = () => {
  const { t } = useTranslation();

  const sections = [
    { title: t('Information'), complete: false },
    { title: t('Special Income'), complete: false },
    { title: t('One-time Goals'), complete: false },
  ];

  return <SectionList sections={sections} />;
};
