import React, { ReactElement, ReactNode } from 'react';
import { Box, Container, Typography, makeStyles, Theme, Grid } from '@material-ui/core';
import { motion } from 'framer-motion';

interface Props {
    title: string;
    subtitle: string;
    illustration?: number;
    children?: ReactNode;
}

const useStyles = makeStyles((theme: Theme) => ({
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
        minHeight: 'calc(100vh - 48px - env(safe-area-inset-top))',
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
    },
    subtitle: {
        maxWidth: '450px',
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
    { initial: { x: -25, opacity: 0 }, animate: { x: 0, opacity: 1 } }
}

const Welcome = ({ title, subtitle, illustration = 2, children }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={variants}>
            <Box className={classes.box}>
                <Container>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item sm={8}>
                            <motion.div variants={divVariants}>
                                <Typography variant="h4" component="h1">
                                    {title}
                                </Typography>
                            </motion.div>
                            <motion.div variants={divVariants}>
                                <Box my={3} className={classes.subtitle}>
                                    <Typography>{subtitle}</Typography>
                                </Box>
                            </motion.div>
                            <motion.div variants={divVariants}>
                                <Box className={classes.container}>{children}</Box>
                            </motion.div>
                        </Grid>
                        <Grid item sm={4}>
                            <motion.img
                                src={`/drawkit/grape/drawkit-grape-pack-illustration-${illustration}.svg`}
                                variants={{ initial: { x: 25, opacity: 0 }, animate: { x: 0, opacity: 1 } }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </motion.div>
    );
};

export default Welcome;
