import React, { ReactElement } from 'react';
import { makeStyles, Theme, Grid, Box } from '@mui/material';
import { motion } from 'framer-motion';

import { useTranslation } from 'react-i18next';
import Tool from './Tool';
import { ToolsList } from './ToolList';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: theme.spacing(3),
    width: '70%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
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

const ToolHome = (): ReactElement => {
  const classes = useStyles();
  const toolsListFlattened = ToolsList.flatMap((tool) => tool.items);
  const { t } = useTranslation();

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      <Box className={classes.outer} data-testid="Home">
        <Grid container spacing={3} className={classes.container}>
          {toolsListFlattened.map((tool) => {
            return (
              <Grid item xs={12} sm={6} lg={4} key={tool.tool}>
                <Tool
                  tool={t('{{toolname}}', { toolname: tool.tool })}
                  desc={t('{{tooldesc}}', { tooldesc: tool.desc })}
                  icon={tool.icon}
                  id={tool.id}
                />
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </motion.div>
  );
};

export default ToolHome;
