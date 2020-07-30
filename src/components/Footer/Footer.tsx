import React, { ReactElement } from 'react';
import { Typography, Link, Container, Box, Grid } from '@material-ui/core';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        box: {
            backgroundColor: '#323232',
        },
        link: {
            color: '#fff',
        },
        copyright: {
            textAlign: 'right',
            color: '#fff',
            [theme.breakpoints.down('sm')]: {
                paddingTop: theme.spacing(3),
                textAlign: 'left',
            },
        },
        logo: {
            marginTop: '5px',
        },
    }),
);

const Footer = (): ReactElement => {
    const classes = useStyles();
    const { t } = useTranslation();
    const year = new Date().getFullYear();

    return (
        <Box py={5} className={classes.box}>
            <Container>
                <Grid container alignItems="center">
                    <Grid item xs={12} md={8} alignItems="center" container spacing={3}>
                        <Grid xs={12} sm="auto" className={classes.logo} item>
                            <img src={require('../../images/logo.svg')} alt="logo" />
                        </Grid>
                        <Grid xs={12} sm="auto" item>
                            <Link
                                href="https://get.mpdx.org/privacy-policy/"
                                className={classes.link}
                                data-testid="privacy"
                            >
                                {t('Privacy Policy')}
                            </Link>
                        </Grid>
                        <Grid xs={12} sm="auto" item>
                            <Link
                                href="https://get.mpdx.org/release-notes/"
                                className={classes.link}
                                data-testid="whats-new"
                            >
                                {t("What's New")}
                            </Link>
                        </Grid>
                        <Grid xs={12} sm="auto" item>
                            <Link
                                href="https://get.mpdx.org/terms-of-use/"
                                className={classes.link}
                                data-testid="terms-of-use"
                            >
                                {t('Terms of Use')}
                            </Link>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography className={classes.copyright} data-testid="copyright" variant="body2">
                            {t('© {{ year }}, Cru. All Rights Reserved.', { year })}
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Footer;
