import React, { ReactElement } from 'react';
import {
    Box,
    makeStyles,
    Theme,
    Container,
    Typography,
    Grid,
    Card,
    CardActionArea,
    CardContent,
} from '@material-ui/core';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Props {
    items: { id: string; name: string }[];
}

const useStyles = makeStyles((theme: Theme) => ({
    box: {
        backgroundColor: theme.palette.primary.main,
        height: '350px',
    },
    container: {
        marginTop: '-160px',
        color: '#fff',
        [theme.breakpoints.down('xs')]: {
            marginTop: '-215px',
        },
    },
    cardContent: {
        height: '200px',
    },
    image: {
        marginTop: '-300px',
        height: '300px',
        textAlign: 'right',
        padding: '20px',
        '& img': {
            height: '160px',
        },
        [theme.breakpoints.down('xs')]: {
            display: 'none',
        },
    },
}));

const accountListsVariants = {
    animate: {
        transition: {
            staggerChildren: 0.1,
        },
    },
    exit: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const accountListVariants = {
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

const AccountLists = ({ items }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <>
            <motion.div initial={{ y: -300 }} animate={{ y: -50 }} transition={{ type: 'spring', stiffness: 100 }}>
                <Box className={classes.box}></Box>
            </motion.div>
            <Box className={classes.image}>
                <Container>
                    <img src="/drawkit/grape/drawkit-grape-pack-illustration-20.svg" alt="illustration" />
                </Container>
            </Box>
            <Container className={classes.container}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.5, ease: 'easeOut' } }}
                >
                    <Box mb={3}>
                        <Typography variant="h4" component="h1">
                            Your Account Lists
                        </Typography>
                    </Box>
                </motion.div>
                <motion.div initial="initial" animate="animate" exit="exit" variants={accountListsVariants}>
                    <Grid container spacing={3}>
                        {items.map((item) => (
                            <Grid key={item.id} item xs={12} sm={4}>
                                <motion.div variants={accountListVariants}>
                                    <Card elevation={3}>
                                        <Link href="/accountLists/[id]" as={`/accountLists/${item.id}`}>
                                            <CardActionArea>
                                                <CardContent className={classes.cardContent}>
                                                    <Typography>{item.name}</Typography>
                                                </CardContent>
                                            </CardActionArea>
                                        </Link>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
            </Container>
        </>
    );
};

export default AccountLists;
