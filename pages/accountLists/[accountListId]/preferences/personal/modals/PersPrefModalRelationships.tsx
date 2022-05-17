import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  DialogContent,
  Grid,
  Hidden,
  MenuItem,
  styled,
} from '@material-ui/core';
import { AddCircle, Search } from '@material-ui/icons';
import Modal from '../../../../../../src/components/common/Modal/Modal';
import {
  PersPrefFieldWrapper,
  StyledOutlinedInput,
  StyledSelect,
} from '../shared/PersPrefForms';
import { info } from '../DemoContent';
import {
  AddButtonBox,
  DeleteButton,
  OptionHeadings,
  SectionHeading,
  StyledDialogActions,
  StyledGridContainer,
  StyledGridItem,
} from './PersPrefModalShared';

const AddRelationshipButton = styled(Button)({
  fontSize: 16,
  padding: '17.5px 14px',
  lineHeight: 1.1876,
});

interface RelationshipModalProps {
  isOpen: boolean;
  handleOpen: (val: boolean) => void;
}

const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  handleOpen,
}) => {
  const { t } = useTranslation();

  const handleClose = () => {
    handleOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      title={t('Person')}
      handleClose={handleClose}
      size={'md'}
    >
      <form>
        <DialogContent dividers>
          <PersPrefFieldWrapper labelText={t('Select Person')}>
            <StyledOutlinedInput startAdornment={<Search />} />
          </PersPrefFieldWrapper>
        </DialogContent>
        <StyledDialogActions>
          <Button onClick={handleClose} disableRipple disableElevation>
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            disableRipple
            disableElevation
          >
            {t('Save')}
          </Button>
        </StyledDialogActions>
      </form>
    </Modal>
  );
};

interface AddRelationshipProps {
  current?: {
    name: string;
    relation: string;
  };
}

const AddRelationship: React.FC<AddRelationshipProps> = ({
  current = null,
}) => {
  const { t } = useTranslation();
  const [relationshipOpen, setRelationshipOpen] = useState(false);

  const handleOpen = () => {
    setRelationshipOpen(true);
  };

  const relationships = [
    t('Husband'),
    t('Son'),
    t('Father'),
    t('Brother'),
    t('Uncle'),
    t('Newphew'),
    t('Cousin Male'),
    t('Grandfather'),
    t('Grandson'),
    t('Wife'),
    t('Daughter'),
    t('Mother'),
    t('Sister'),
    t('Aunt'),
    t('Niece'),
    t('Cousin Female'),
    t('Grandmother'),
    t('Granddaughter'),
  ];

  return (
    <StyledGridContainer container spacing={2}>
      <Grid item xs={12} sm={7}>
        {!current ? (
          <>
            <AddRelationshipButton
              variant="outlined"
              onClick={handleOpen}
              fullWidth
              disableRipple
            >
              Select Person
            </AddRelationshipButton>
            <RelationshipModal
              isOpen={relationshipOpen}
              handleOpen={setRelationshipOpen}
            />
          </>
        ) : (
          <PersPrefFieldWrapper formControlDisabled={true}>
            <StyledOutlinedInput value={current.name} />
          </PersPrefFieldWrapper>
        )}
      </Grid>
      <Grid item xs={12} sm={4}>
        <PersPrefFieldWrapper>
          <StyledSelect value={current ? current.relation : ''}>
            {relationships.map((current2) => (
              <MenuItem value={current2} key={current2}>
                {t(current2)}
              </MenuItem>
            ))}
          </StyledSelect>
        </PersPrefFieldWrapper>
      </Grid>
      <StyledGridItem item xs={12} sm={1}>
        <DeleteButton />
      </StyledGridItem>
    </StyledGridContainer>
  );
};

export const PersPrefModalRelationships: React.FC = () => {
  const { t } = useTranslation();

  const statuses = [
    t('Single'),
    t('Engaged'),
    t('Married'),
    t('Separated'),
    t('Divorced'),
    t('Widowed'),
  ];

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <PersPrefFieldWrapper labelText={t('Occupation')}>
            <StyledOutlinedInput value={info.occupation} />
          </PersPrefFieldWrapper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <PersPrefFieldWrapper labelText={t('Employer')}>
            <StyledOutlinedInput value={info.employer} />
          </PersPrefFieldWrapper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <PersPrefFieldWrapper labelText={t('Relationship Status')}>
            <StyledSelect value={info.marital_status}>
              {statuses.map((current) => (
                <MenuItem value={current} key={current}>
                  {t(current)}
                </MenuItem>
              ))}
            </StyledSelect>
          </PersPrefFieldWrapper>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={7} style={{ marginTop: 8 }}>
          <SectionHeading>{t('Relationships')}</SectionHeading>
        </Grid>
        <Hidden xsDown>
          <OptionHeadings smallCols={4} align="flex-start">
            {t('Type')}
          </OptionHeadings>
          <OptionHeadings smallCols={1}>{t('Delete')}</OptionHeadings>
        </Hidden>
      </Grid>
      {info.family_relationships.map((current, index) => (
        <AddRelationship current={current} key={index} />
      ))}
      <AddRelationship />
      <AddButtonBox>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddCircle />}
          disableRipple
        >
          {t('Add Relationship')}
        </Button>
      </AddButtonBox>
    </>
  );
};
