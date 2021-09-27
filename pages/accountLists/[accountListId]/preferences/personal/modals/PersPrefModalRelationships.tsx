import { useState } from 'react';
import { Button, DialogContent, Grid, Hidden, styled } from '@material-ui/core';
import { AddCircle, Search } from '@material-ui/icons';
import Modal from '../../../../../../src/components/common/Modal/Modal';
import { PersPrefField } from '../shared/PersPrefForms';
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

const AddPersonButton = styled(Button)({
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
  const handleClose = () => {
    handleOpen(false);
  };

  return (
    <Modal isOpen={isOpen} title="Person" handleClose={handleClose} size={'md'}>
      <form>
        <DialogContent dividers>
          <PersPrefField label="Select Person" inputStartIcon={<Search />} />
        </DialogContent>
        <StyledDialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="primary">
            Save
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
  const [relationshipOpen, setRelationshipOpen] = useState(false);

  const handleOpen = () => {
    setRelationshipOpen(true);
  };

  return (
    <StyledGridContainer container spacing={2}>
      <Grid item xs={12} sm={7}>
        {!current ? (
          <>
            <AddPersonButton
              variant="outlined"
              onClick={handleOpen}
              fullWidth
              disableRipple
            >
              Select Person
            </AddPersonButton>
            <RelationshipModal
              isOpen={relationshipOpen}
              handleOpen={setRelationshipOpen}
            />
          </>
        ) : (
          <PersPrefField inputValue={current.name} disabled={true} />
        )}
      </Grid>
      <Grid item xs={12} sm={4}>
        <PersPrefField
          type="select"
          options={[
            ['Husband'],
            ['Son'],
            ['Father'],
            ['Brother'],
            ['Uncle'],
            ['Newphew'],
            ['Cousin Male'],
            ['Grandfather'],
            ['Grandson'],
            ['Wife'],
            ['Daughter'],
            ['Mother'],
            ['Sister'],
            ['Aunt'],
            ['Niece'],
            ['Cousin Female'],
            ['Grandmother'],
            ['Granddaughter'],
          ]}
          selectValue={current ? current.relation : ''}
        />
      </Grid>
      <StyledGridItem item xs={12} sm={1}>
        <DeleteButton />
      </StyledGridItem>
    </StyledGridContainer>
  );
};

export const PersPrefModalRelationships: React.FC = () => {
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <PersPrefField label="Occupation" inputValue={info.occupation} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <PersPrefField label="Employer" inputValue={info.employer} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <PersPrefField
            label="Relationship Status"
            type="select"
            options={[
              ['Single', 'Single'],
              ['Engaged', 'Engaged'],
              ['Married', 'Married'],
              ['Separated', 'Separated'],
              ['Divorced', 'Divorced'],
              ['Widowed', 'Widowed'],
            ]}
            selectValue={info.marital_status}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={7} style={{ marginTop: 8 }}>
          <SectionHeading>Relationships</SectionHeading>
        </Grid>
        <Hidden xsDown>
          <OptionHeadings smallCols={4} align="left">
            Type
          </OptionHeadings>
          <OptionHeadings smallCols={1}>Delete</OptionHeadings>
        </Hidden>
      </Grid>
      {info.family_relationships.map((current, index) => (
        <AddRelationship current={current} key={index} />
      ))}
      <AddRelationship />
      <AddButtonBox>
        <Button variant="outlined" size="small" startIcon={<AddCircle />}>
          Add Relationship
        </Button>
      </AddButtonBox>
    </>
  );
};
