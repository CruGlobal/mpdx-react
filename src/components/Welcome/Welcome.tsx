import React, { ReactElement, ReactNode } from 'react';
import { Box, Container, Typography, makeStyles, Theme, Grid } from '@material-ui/core';
import { motion } from 'framer-motion';

interface Props {
    title: string | ReactNode;
    subtitle: string | ReactNode;
    imgSrc?: string;
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
        minHeight: '100vh',
        minWidth: '100vw',
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
    initial: { x: -25, opacity: 0 },
    animate: { x: 0, opacity: 1 },
};

const Welcome = ({ title, subtitle, imgSrc, children }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <motion.div initial="initial" animate="animate" exit="exit" variants={variants}>
            <Box className={classes.box}>
                <Container>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item sm={8}>
                            <motion.div variants={divVariants}>
                                {typeof title === 'string' ? (
                                    <Typography data-testid="welcomeTitle" variant="h4" component="h1">
                                        {title}
                                    </Typography>
                                ) : (
                                    title
                                )}
                            </motion.div>
                            <motion.div variants={divVariants}>
                                {typeof subtitle === 'string' ? (
                                    <Box my={3} className={classes.subtitle}>
                                        <Typography data-testid="welcomeSubtitle">{subtitle}</Typography>
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
                                src={
                                    imgSrc ||
                                    require(`../../images/drawkit/grape/drawkit-grape-pack-illustration-2.svg`)
                                }
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
