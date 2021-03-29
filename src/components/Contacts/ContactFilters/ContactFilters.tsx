import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import React, { useState } from 'react';
import { useContactFiltersLazyQuery } from './ContactFilters.generated';

interface Props {
  accountListId: string;
}

export const ContactFilters: React.FC<Props> = ({ accountListId }: Props) => {
  const [
    loadContactFilters,
    { data, loading, error },
  ] = useContactFiltersLazyQuery({ variables: { accountListId } });
  const [showAll, setShowAll] = useState(false);

  return (
    <>
      <Box px={2} pt={2}>
        <Typography variant="h6">Filter</Typography>
        {error && (
          <Typography variant="subtitle1" color="error" data-testID="ErrorText">
            Error: {error.toString()}
          </Typography>
        )}
        {/* {!data && (
          <button onClick={() => loadContactFilters()}>Load Filters</button>
        )} */}
      </Box>
      {loading ? (
        <Box px={2}>
          <CircularProgress />
        </Box>
      ) : !data ? (
        <Box px={2}>
          <Button color="primary" onClick={() => loadContactFilters()}>
            Load Filters
          </Button>
        </Box>
      ) : !data || data.contactFilters.length === 0 ? (
        <Box px={2}>No Filters</Box>
      ) : (
        <List dense={true} data-testID="FiltersList">
          {data.contactFilters.map(({ id, title, featured }) => (
            <Collapse key={id} in={showAll || featured}>
              <ListItem>
                <Typography variant="subtitle1">{title}</Typography>
              </ListItem>
            </Collapse>
          ))}
          <ListItem button onClick={() => setShowAll(!showAll)}>
            <ListItemText
              color="primary"
              primary={showAll ? 'See Fewer Filters' : 'See More Filters'}
              primaryTypographyProps={{
                color: 'primary',
                variant: 'subtitle1',
              }}
            />
            {showAll ? (
              <ExpandLess color="primary" />
            ) : (
              <ExpandMore color="primary" />
            )}
          </ListItem>
        </List>
      )}
    </>
  );
};
