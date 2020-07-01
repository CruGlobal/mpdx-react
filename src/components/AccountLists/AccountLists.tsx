import React, { ReactElement } from 'react';
import {
    makeStyles,
    Theme,
    Container,
    Typography,
    Grid,
    Card,
    CardActionArea,
    CardContent,
    Button,
} from '@material-ui/core';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SubjectIcon from '@material-ui/icons/Subject';
import Welcome from '../Welcome';
import { GetAccountListsQuery } from '../../../types/GetAccountListsQuery';
import PageHeading from '../PageHeading';

interface Props {
    data: GetAccountListsQuery;
}

const useStyles = makeStyles((theme: Theme) => ({
    cardContent: {
        height: '200px',
    },
    image: {
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
            staggerChildren: 0.15,
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
        z: 1,
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

const AccountLists = ({ data }: Props): ReactElement => {
    const classes = useStyles();

    if (data.accountLists.nodes.length > 0) {
        return (
            <>
                <PageHeading heading="Your Account Lists" overlap={100} />
                <motion.div initial="initial" animate="animate" exit="exit" variants={accountListsVariants}>
                    <Container>
                        <Grid container spacing={3}>
                            {data.accountLists.nodes.map((item) => (
                                <Grid key={item.id} item xs={12} sm={4}>
                                    <motion.div variants={accountListVariants}>
                                        <Card elevation={3}>
                                            <Link href="/accountLists/[accountListId]" as={`/accountLists/${item.id}`}>
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
                    </Container>
                </motion.div>
            </>
        );
    } else {
        return (
            <Welcome
                title="Welcome to MPDX"
                subtitle="MPDX is fundraising software from Cru that helps you grow and maintain your ministry
partners in a quick and easy way."
            >
                <Button size="large" variant="contained">
                    Get Started
                </Button>
                <Button
                    size="large"
                    startIcon={<SubjectIcon />}
                    href="https://help.mpdx.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Find help
                </Button>
            </Welcome>
        );
    }
};

export default AccountLists;
