import React, { ReactElement, ReactNode } from 'react';
import { makeStyles, Theme, Container, Typography } from '@material-ui/core';
import { motion } from 'framer-motion';

interface Props {
    heading: string | ReactNode;
    illustration?: number;
    overlap?: number;
}

const useStyles = makeStyles((theme: Theme) => ({
    div: {
        backgroundColor: theme.palette.primary.main,
        height: '350px',
        display: 'flex',
        alignItems: 'flex-end',
    },
    container: {
        display: 'flex',
        alignItems: 'flex-end',
    },
    pageHeading: {
        flex: 1,
        color: '#FFF',
    },
}));

const PageHeading = ({ heading, illustration = 20, overlap = 0 }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <motion.div
            initial={{ y: -350 }}
            animate={{ y: -50 }}
            exit={{ y: -350, transition: { delay: 0.5 } }}
            transition={{ type: 'spring', stiffness: 50 }}
            className={classes.div}
            style={{ marginBottom: -overlap - 50 }}
        >
            <Container className={classes.container} style={{ paddingBottom: overlap }}>
                <motion.div
                    animate={{ opacity: 1, transition: { delay: 1 } }}
                    initial={{ opacity: 0 }}
                    exit={{ opacity: 0 }}
                    className={classes.pageHeading}
                >
                    {typeof heading == 'string' ? (
                        <Typography variant="h4" component="h1">
                            {heading}
                        </Typography>
                    ) : (
                        heading
                    )}
                </motion.div>
                <motion.img
                    initial={{ x: 60, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, transition: { delay: 1.2 } }}
                    exit={{ x: -60, opacity: 0 }}
                    src={`/drawkit/grape/drawkit-grape-pack-illustration-${illustration}.svg`}
                    height={160}
                />
            </Container>
        </motion.div>
    );
};

export default PageHeading;
