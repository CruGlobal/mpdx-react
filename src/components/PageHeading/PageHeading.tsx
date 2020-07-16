import React, { ReactElement } from 'react';
import { makeStyles, Theme, Container, Typography, Box } from '@material-ui/core';
import { motion } from 'framer-motion';

interface Props {
    heading: string;
    subheading?: string;
    illustration?: string;
    overlap?: number;
}

const useStyles = makeStyles((theme: Theme) => ({
    div: {
        backgroundColor: theme.palette.primary.main,
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
        color: '#FFF',
    },
}));

const PageHeading = ({ heading, subheading, illustration, overlap = 0 }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <motion.div
            initial={{ y: -250 }}
            animate={{ y: 0, transition: { ease: 'easeInOut' } }}
            exit={{ y: -250, transition: { ease: 'easeInOut', delay: 0.75 } }}
            className={classes.div}
            style={{ marginBottom: -overlap }}
        >
            <Container className={classes.container} style={{ paddingBottom: overlap }}>
                <Box className={classes.pageHeading}>
                    <motion.div
                        animate={{ x: 0, opacity: 1, transition: { delay: 1 } }}
                        initial={{ x: -20, opacity: 0 }}
                        exit={{ x: -20, opacity: 0, transition: { delay: 0.2 } }}
                    >
                        <Typography variant="h4" component="h1">
                            {heading}
                        </Typography>
                    </motion.div>
                    {subheading && (
                        <motion.div
                            animate={{ x: 0, opacity: 1, transition: { delay: 1.2 } }}
                            initial={{ x: -20, opacity: 0 }}
                            exit={{ x: -20, opacity: 0 }}
                        >
                            <Typography>{subheading}</Typography>
                        </motion.div>
                    )}
                </Box>
                <Box display={{ xs: 'none', sm: 'block' }}>
                    <motion.img
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1, transition: { delay: 1.2 } }}
                        exit={{ x: 20, opacity: 0 }}
                        src={
                            illustration || require('../../images/drawkit/grape/drawkit-grape-pack-illustration-20.svg')
                        }
                        height={230 - overlap}
                    />
                </Box>
            </Container>
        </motion.div>
    );
};

export default PageHeading;
