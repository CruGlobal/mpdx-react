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
        backgroundColor: theme.palette.primary.main,
        color: '#fff',
    },
    subtitle: {
        maxWidth: '450px',
    },
}));

const Welcome = ({ title, subtitle, illustration = 2, children }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <motion.div initial={{ y: -300 }} animate={{ y: -50 }} transition={{ type: 'spring', stiffness: 100 }}>
            <Box className={classes.box} py={10}>
                <Container>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item sm={8}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.5, ease: 'easeOut' } }}
                            >
                                <Typography variant="h4" component="h1">
                                    {title}
                                </Typography>
                            </motion.div>
                            <Box my={3} className={classes.subtitle}>
                                <Typography>{subtitle}</Typography>
                            </Box>
                            <Box className={classes.container}>{children}</Box>
                        </Grid>
                        <Grid item sm={4}>
                            <img
                                src={`/drawkit/grape/drawkit-grape-pack-illustration-${illustration}.svg`}
                                alt="illustration"
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </motion.div>
    );
};

export default Welcome;
