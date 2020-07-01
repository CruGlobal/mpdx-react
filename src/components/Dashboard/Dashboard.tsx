import React, { ReactElement } from 'react';
import { Container, Grid, Box } from '@material-ui/core';
import { motion } from 'framer-motion';
import { GetDashboardQuery } from '../../../types/GetDashboardQuery';
import Welcome from './Welcome';
import MonthlyGoal from './MonthlyGoal';
import Balance from './Balance';
import DonationHistories from './DonationHistories';
import ThisWeek from './ThisWeek';

interface Props {
    data: GetDashboardQuery;
}

const variants = {
    animate: {
        transition: {
            delayChildren: 1,
            staggerChildren: 0.15,
        },
    },
    exit: {
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const Dashboard = ({ data }: Props): ReactElement => {
    return (
        <>
            <Welcome firstName={data.user?.firstName} />
            <Box py={5}>
                <Container>
                    <motion.div initial="initial" animate="animate" exit="exit" variants={variants}>
                        <Grid container spacing={3} alignItems="stretch">
                            <Grid xs={12} sm={8} item>
                                <MonthlyGoal
                                    goal={data.accountList?.monthlyGoal}
                                    received={data.accountList?.receivedPledges || 0}
                                    pledged={data.accountList?.committed || 0}
                                    currencyCode={data.accountList?.currency || 'USD'}
                                />
                            </Grid>
                            <Grid xs={12} sm={4} item>
                                <Balance
                                    balance={data.accountList?.balance}
                                    currencyCode={data.accountList?.currency || 'USD'}
                                />
                            </Grid>
                            <Grid xs={12} item>
                                <DonationHistories
                                    goal={data.accountList?.monthlyGoal}
                                    pledged={data.accountList?.committed}
                                    reportsDonationHistories={data.reportsDonationHistories}
                                    currencyCode={data.accountList?.currency || 'USD'}
                                />
                            </Grid>
                            <Grid xs={12} item>
                                <ThisWeek
                                    dueTasks={data.dueTasks}
                                    prayerRequestTasks={data.prayerRequestTasks}
                                    latePledgeContacts={data.latePledgeContacts}
                                    peopleWithBirthdays={data.reportsPeopleWithBirthdays?.periods[0]?.people}
                                    peopleWithAnniversaries={data.reportsPeopleWithAnniversaries?.periods[0]?.people}
                                />
                            </Grid>
                        </Grid>
                    </motion.div>
                </Container>
            </Box>
        </>
    );
};

export default Dashboard;
