import React, { useMemo } from 'react';
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

  const sections = useMemo(
    () => [
      {
        title: `1. ${t('About this Form')}`,
        section: AdditionalSalaryRequestSectionEnum.AboutForm,
      },
      {
        title: `2. ${t('Complete Form')}`,
        section: AdditionalSalaryRequestSectionEnum.CompleteForm,
      },
      {
        title: `3. ${t('Receipt')}`,
        section: AdditionalSalaryRequestSectionEnum.Receipt,
      },
    ],
    [t],
  );

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
