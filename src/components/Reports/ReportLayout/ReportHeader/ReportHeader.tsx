import React from 'react';
import clsx from 'clsx';
// import { DateTime } from 'luxon';
import {
  Box,
  Button,
  ButtonGroup,
  Grid,
  SvgIcon,
  Typography,
  makeStyles,
} from '@material-ui/core';
import GetAppIcon from '@material-ui/icons/GetApp';
import CodeIcon from '@material-ui/icons/Code';
import PrintIcon from '@material-ui/icons/Print';

interface ReportHeaderProps {
  className?: string;
  title: string;
}

const useStyles = makeStyles(() => ({
  root: {},
  downloadCsv: {
    textDecoration: 'none',
  },
}));

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  className,
  title,
  ...rest
}) => {
  const classes = useStyles();

  return (
    <Box my={2}>
      <Grid
        container
        justify="space-between"
        className={clsx(classes.root, className)}
        {...rest}
      >
        <Grid item>
          <Typography variant="h5">{title}</Typography>
        </Grid>
        <Grid item>
          {/* <CSVLink 
            data={salaryCurrency}
            headers={headers}
            filename={`mpdx-salary-contributions-export-${DateTime.now().toISODate()}.csv`}
            className={clsx(classes.downloadCsv)}
          >
            <Button
              startIcon={
                <SvgIcon fontSize="small">
                  <DownloadIcon />
                </SvgIcon>
              }
            >
              Export
            </Button>
          </CSVLink> */}
          <ButtonGroup aria-label="report header button group">
            <Button
              startIcon={
                <SvgIcon fontSize="small">
                  <CodeIcon />
                </SvgIcon>
              }
            >
              Expand Partner Info
            </Button>
            <Button
              startIcon={
                <SvgIcon fontSize="small">
                  <GetAppIcon />
                </SvgIcon>
              }
            >
              Export
            </Button>
            <Button
              startIcon={
                <SvgIcon fontSize="small">
                  <PrintIcon />
                </SvgIcon>
              }
            >
              Print
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    </Box>
  );
};
