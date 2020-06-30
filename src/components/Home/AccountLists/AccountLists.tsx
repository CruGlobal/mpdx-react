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

interface Props {
    items: { id: string; name: string }[];
}

const useStyles = makeStyles((theme: Theme) => ({
    box: {
        backgroundColor: theme.palette.primary.main,
        height: '300px',
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

const AccountLists = ({ items }: Props): ReactElement => {
    const classes = useStyles();

    return (
        <>
            <Box className={classes.box}></Box>
            <Box className={classes.image}>
                <Container>
                    <img src="/drawkit/grape/drawkit-grape-pack-illustration-20.svg" alt="illustration" />
                </Container>
            </Box>
            <Container className={classes.container}>
                <Box mb={3}>
                    <Typography variant="h4" component="h1">
                        Your Account Lists
                    </Typography>
                </Box>
                <Grid container spacing={3}>
                    {items.map((item) => (
                        <Grid key={item.id} item xs={12} sm={4}>
                            <Card elevation={3}>
                                <Link href="/accountLists/[id]" as={`/accountLists/${item.id}`}>
                                    <CardActionArea>
                                        <CardContent className={classes.cardContent}>
                                            <Typography>{item.name}</Typography>
                                        </CardContent>
                                    </CardActionArea>
                                </Link>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </>
    );
};

export default AccountLists;
