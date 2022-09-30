import React, { ReactElement, ReactNode } from 'react';
import { Box, Container, Typography, Theme, Grid } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { motion } from 'framer-motion';
import illustration2 from '../../images/drawkit/grape/drawkit-grape-pack-illustration-2.svg';

interface Props {
  title: string | ReactNode;
  subtitle: string | ReactNode;
  imgSrc?: string;
  children?: ReactNode;
}

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    '& > *': {
      marginRight: theme.spacing(2),
      '&:last-child': {
        marginRight: 0,
      },
    },
  },
  box: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '100vh',
    minWidth: '100vw',
    backgroundColor: theme.palette.mpdxBlue.main,
  },
  subtitle: {
    maxWidth: '450px',
  },
  whiteText: {
    color: theme.palette.common.white,
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

const divVariants = {
  initial: { x: -25, opacity: 0 },
  animate: { x: 0, opacity: 1 },
};

const Welcome = ({
  title,
  subtitle,
  imgSrc,
  children,
}: Props): ReactElement => {
  const { classes } = useStyles();

  return (
    <motion.main
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
    >
      <Box className={classes.box}>
        <Container>
          <Grid container spacing={2} alignItems="center">
            <Grid item sm={8}>
              <motion.div variants={divVariants}>
                {typeof title === 'string' ? (
                  <Typography
                    data-testid="welcomeTitle"
                    variant="h4"
                    component="h1"
                    className={classes.whiteText}
                  >
                    {title}
                  </Typography>
                ) : (
                  title
                )}
              </motion.div>
              <motion.div variants={divVariants}>
                {typeof subtitle === 'string' ? (
                  <Box my={3} className={classes.subtitle}>
                    <Typography
                      data-testid="welcomeSubtitle"
                      className={classes.whiteText}
                    >
                      {subtitle}
                    </Typography>
                  </Box>
                ) : (
                  subtitle
                )}
              </motion.div>
              <motion.div variants={divVariants}>
                <Box className={classes.container}>{children}</Box>
              </motion.div>
            </Grid>
            <Grid item sm={4}>
              <motion.img
                data-testid="welcomeImg"
                src={imgSrc || illustration2}
                variants={{
                  initial: { x: 25, opacity: 0 },
                  animate: { x: 0, opacity: 1 },
                }}
                alt="heading"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </motion.main>
  );
};

export default Welcome;
