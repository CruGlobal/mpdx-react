import React, { ReactElement, useState } from 'react';
import { makeStyles, Theme, Grid, Container, Box } from '@material-ui/core';
import { motion } from 'framer-motion';

import NavToolDrawer from '../NavToolList/NavToolDrawer';
import Tool from './Tool';
import { ToolsList } from './ToolList';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    padding: 20,
    marginRight: 17,
    display: 'flex',
    [theme.breakpoints.down('lg')]: {
      paddingLeft: 30,
      marginRight: 20,
    },
    [theme.breakpoints.down('md')]: {
      paddingLeft: 40,
      marginRight: 15,
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 45,
    },
  },
  toolIcon: {
    height: '40px',
    width: '40px',
    color: theme.palette.cruGrayDark.main,
  },
  outter: {
    display: 'flex',
    flexDirection: 'row',
    minWidth: '100vw',
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
  const [isNavListOpen, setNavListOpen] = useState<boolean>(false);

  const handleNavListToggle = () => {
    setNavListOpen(!isNavListOpen);
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      <Box className={classes.outter}>
        <NavToolDrawer open={isNavListOpen} toggle={handleNavListToggle} />
        <Container
          className={classes.container}
          style={{
            minWidth: isNavListOpen ? 'calc(97.5vw - 290px)' : '97.5vw',
            transition: 'min-width 0.15s linear',
          }}
        >
          <Grid container spacing={3}>
            {ToolsList.map((tool) => {
              return (
                <Grid item xs={12} sm={6} md={4} lg={4} key={tool.tool}>
                  <Tool
                    tool={tool.tool}
                    desc={tool.desc}
                    icon={tool.icon}
                    id={tool.id}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
    </motion.div>
  );
};

export default ToolHome;
