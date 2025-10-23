import React from 'react';
import { List, ListItemButton, ListItemText, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AdditionalSalaryRequestSectionEnum } from '../AdditionalSalaryRequestHelper';
import { useAdditionalSalaryRequest } from './AdditionalSalaryRequestContext';

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: 0,
  paddingLeft: theme.spacing(3),
}));

export const SectionList: React.FC = () => {
  const { t } = useTranslation();
  const { selectedSection, setSelectedSection } = useAdditionalSalaryRequest();

  const sections = [
    {
      title: t('1. About this Form'),
      section: AdditionalSalaryRequestSectionEnum.AboutForm,
    },
    {
      title: t('2. Complete Form'),
      section: AdditionalSalaryRequestSectionEnum.CompleteForm,
    },
    {
      title: t('3. Receipt'),
      section: AdditionalSalaryRequestSectionEnum.Receipt,
    },
  ];

  return (
    <List disablePadding>
      {sections.map(({ title, section }) => {
        const active = selectedSection === section;
        return (
          <StyledListItemButton
            key={section}
            aria-current={active}
            selected={active}
            onClick={() => setSelectedSection(section)}
          >
            <ListItemText
              primary={title}
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </StyledListItemButton>
        );
      })}
    </List>
  );
};
