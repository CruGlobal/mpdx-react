import React, { ReactElement } from 'react';

export interface DonationFilter {
    donorAccountIds?: string[];
    designationAccountIds?: string[];
    before?: string;
    after?: string;
}

interface Props {
    initialFilter: DonationFilter;
}

const ReportsDonations = ({ initialFilter }: Props): ReactElement => <></>;

export default ReportsDonations;
