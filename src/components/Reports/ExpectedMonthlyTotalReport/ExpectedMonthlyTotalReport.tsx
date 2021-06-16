import React, { ReactElement } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Box } from '@material-ui/core';
import Loading from '../../../../src/components/Loading';
import { ExpectedMonthlyTotalReportHeader } from './Header/ExpectedMonthlyTotalReportHeader';
import { ExpectedMonthlyTotalReportTable } from './Table/ExpectedMonthlyTotalReportTable';
import { ExpectedMonthlyTotalReportEmpty } from './Empty/ExpectedMonthlyTotalReportEmpty';
