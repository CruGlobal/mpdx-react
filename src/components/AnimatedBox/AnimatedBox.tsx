import React, { ReactElement } from 'react';
import { Box, BoxProps } from '@material-ui/core';
import { motion } from 'framer-motion';

const variants = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: {
            duration: 0.5,
            ease: [0.48, 0.15, 0.25, 0.96],
        },
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: [0.48, 0.15, 0.25, 0.96],
        },
    },
};

const AnimatedBox = (props: BoxProps): ReactElement => (
    <motion.div variants={variants} style={{ height: '100%' }}>
        <Box {...props} />
    </motion.div>
);

export default AnimatedBox;
