import React, { ReactElement } from 'react';
import { Box, Grid, Theme } from '@mui/material';
import { motion } from 'framer-motion';
import { makeStyles } from 'tss-react/mui';
import { useGetToolNotificationsQuery } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/GetToolNotifcations.generated';
import { ToolName } from 'src/components/Layouts/Primary/TopBar/Items/NavMenu/NavMenu';
import { useAccountListId } from '../../../hooks/useAccountListId';
import { ToolsGridContainer } from '../styledComponents';
import Tool from './Tool';
import { ToolsListHome } from './ToolsListHome';

const useStyles = makeStyles()((theme: Theme) => ({
  toolIcon: {
    height: theme.spacing(5),
    width: theme.spacing(5),
    color: theme.palette.cruGrayDark.main,
  },
  outer: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
}));

const variants = {
  animate: {
    transition: {
      staggerChildren: 0.15,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
interface ToolHomeProps {
  onSetupTour: boolean;
}

const ToolsHome: React.FC<ToolHomeProps> = ({ onSetupTour }): ReactElement => {
  const { classes } = useStyles();
  const accountListId = useAccountListId();

  const { data, loading } = useGetToolNotificationsQuery({
    variables: { accountListId: accountListId ?? '' },
    skip: !accountListId,
  });

  const toolDataTotalCount: { [key: string]: number } = {
    [ToolName.FixCommitmentInfo]: data?.fixCommitmentInfo.totalCount ?? 0,
    [ToolName.FixMailingAddresses]: data?.fixMailingAddresses.totalCount ?? 0,
    [ToolName.FixSendNewsletter]: data?.fixSendNewsletter.totalCount ?? 0,
    [ToolName.FixEmailAddresses]: data?.fixEmailAddresses.totalCount ?? 0,
    [ToolName.FixPhoneNumbers]: data?.fixPhoneNumbers.totalCount ?? 0,
    [ToolName.MergeContacts]: data?.mergeContacts.totalCount ?? 0,
    [ToolName.MergePeople]: data?.mergePeople.totalCount ?? 0,
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      <Box className={classes.outer} data-testid="Home">
        <ToolsGridContainer container spacing={3}>
          {ToolsListHome.map((tool) => {
            const needsAttention =
              (!onSetupTour &&
                toolDataTotalCount &&
                toolDataTotalCount[tool.id] > 0) ||
              (onSetupTour && tool.id.includes('import'));
            return (
              <Grid item xs={12} sm={6} md={4} key={tool.tool}>
                <Tool
                  tool={tool.tool}
                  desc={tool.desc}
                  icon={tool.icon}
                  url={tool.url}
                  needsAttention={needsAttention}
                  totalCount={!onSetupTour ? toolDataTotalCount[tool.id] : 0}
                  loading={loading}
                  toolId={tool.id}
                />
              </Grid>
            );
          })}
        </ToolsGridContainer>
      </Box>
    </motion.div>
  );
};

export default ToolsHome;
