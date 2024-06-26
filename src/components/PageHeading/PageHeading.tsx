import React, { ReactElement } from 'react';
import { Box, Container, Theme, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { makeStyles } from 'tss-react/mui';
import illustration20 from '../../images/drawkit/grape/drawkit-grape-pack-illustration-20.svg';

interface Props {
  heading: string;
  subheading?: string;
  imgSrc?: string;
  overlap?: number;
  height?: number;
  image?: boolean;
}

const useStyles = makeStyles()((theme: Theme) => ({
  div: {
    backgroundColor: theme.palette.mpdxBlue.main,
    height: '250px',
    display: 'flex',
    alignItems: 'flex-end',
    marginBottom: theme.spacing(2),
  },
  container: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  pageHeading: {
    flex: 1,
    color: theme.palette.common.white,
  },
}));

const PageHeading = ({
  heading,
  subheading,
  imgSrc,
  overlap = 20,
  height = 250,
  image = true,
}: Props): ReactElement => {
  const { classes } = useStyles();

  return (
    <motion.div
      initial={{ y: -height }}
      animate={{ y: 0, transition: { ease: 'easeInOut' } }}
      exit={{ y: -height, transition: { ease: 'easeInOut', delay: 0.75 } }}
      className={classes.div}
      style={{ marginBottom: -overlap, height }}
      data-testid="PageHeading"
    >
      <Container
        className={classes.container}
        style={{ paddingBottom: overlap }}
        data-testid="PageHeadingContainer"
      >
        <Box className={classes.pageHeading}>
          <motion.div
            animate={{ x: 0, opacity: 1, transition: { delay: 1 } }}
            initial={{ x: -20, opacity: 0 }}
            exit={{ x: -20, opacity: 0, transition: { delay: 0.2 } }}
          >
            <Typography
              variant="h4"
              component="h1"
              data-testid="PageHeadingHeading"
            >
              {heading}
            </Typography>
          </motion.div>
          {subheading && (
            <motion.div
              animate={{ x: 0, opacity: 1, transition: { delay: 1.2 } }}
              initial={{ x: -20, opacity: 0 }}
              exit={{ x: -20, opacity: 0 }}
            >
              <Typography data-testid="PageHeadingSubheading">
                {subheading}
              </Typography>
            </motion.div>
          )}
        </Box>
        {image && (
          <Box display={{ xs: 'none', sm: 'block' }} fontSize={0}>
            <motion.img
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1, transition: { delay: 1.2 } }}
              exit={{ x: 20, opacity: 0 }}
              data-testid="PageHeadingImg"
              src={imgSrc || illustration20}
              height={height - 20 - overlap}
              alt="heading"
            />
          </Box>
        )}
      </Container>
    </motion.div>
  );
};

export default PageHeading;
