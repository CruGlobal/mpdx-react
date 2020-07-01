import React, { ReactElement } from 'react';
import { makeStyles, Theme, Container, Typography, Grid, CardActionArea, CardContent, Button } from '@material-ui/core';
import Link from 'next/link';
import { motion } from 'framer-motion';
import SubjectIcon from '@material-ui/icons/Subject';
import Welcome from '../Welcome';
import { GetAccountListsQuery } from '../../../types/GetAccountListsQuery';
import PageHeading from '../PageHeading';
import AnimatedCard from '../AnimatedCard';

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

const AccountLists = ({ data }: Props): ReactElement => {
    const classes = useStyles();

    if (data.accountLists.nodes.length > 0) {
        return (
            <>
                <PageHeading heading="Your Account Lists" overlap={100} />
                <motion.div initial="initial" animate="animate" exit="exit" variants={variants}>
                    <Container>
                        <Grid container spacing={3}>
                            {data.accountLists.nodes.map((item) => (
                                <Grid key={item.id} item xs={12} sm={4}>
                                    <AnimatedCard elevation={3}>
                                        <Link
                                            href="/accountLists/[accountListId]"
                                            as={`/accountLists/${item.id}`}
                                            scroll={false}
                                        >
                                            <CardActionArea>
                                                <CardContent className={classes.cardContent}>
                                                    <Typography>{item.name}</Typography>
                                                </CardContent>
                                            </CardActionArea>
                                        </Link>
                                    </AnimatedCard>
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
