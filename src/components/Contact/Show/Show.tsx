import { Box, Grid, Paper, Tab } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import React, { ReactElement, useState } from 'react';
import ContactDetails from '../Details';

interface Props {
    contactId?: string;
}

const ContactShow = ({ contactId }: Props): ReactElement => {
    const [value, setValue] = useState('1');

    const handleChange = (_event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box m={2}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <ContactDetails contactId={contactId} />
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper>
                        <TabContext value={value}>
                            <TabList onChange={handleChange}>
                                <Tab label="Notes" value="1" />
                                <Tab label="Donations" value="2" />
                                <Tab label="Tasks" value="3" />
                                <Tab label="Referrals" value="4" />
                                <Tab label="Addresses" value="5" />
                                <Tab label="People" value="6" />
                            </TabList>
                            <TabPanel value="1">Item One</TabPanel>
                            <TabPanel value="2">Item Two</TabPanel>
                            <TabPanel value="3">Item Three</TabPanel>
                            <TabPanel value="4">Item Four</TabPanel>
                            <TabPanel value="5">Item Five</TabPanel>
                            <TabPanel value="6">Item Six</TabPanel>
                        </TabContext>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ContactShow;
