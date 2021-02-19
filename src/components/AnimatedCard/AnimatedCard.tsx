import React, { ReactElement } from 'react';
import { Card, CardProps } from '@material-ui/core';
import { motion } from 'framer-motion';

const variants = {
  initial: {
    scale: 0.96,
    y: 30,
    opacity: 0,
  },
  animate: {
    scale: 1,
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.48, 0.15, 0.25, 0.96],
    },
  },
  exit: {
    scale: 0.6,
    y: 100,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: [0.48, 0.15, 0.25, 0.96],
    },
  },
};

const AnimatedCard = (props: CardProps): ReactElement => (
  <motion.div variants={variants} style={{ height: '100%' }}>
    <Card {...props} />
  </motion.div>
);

export default AnimatedCard;
