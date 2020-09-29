import React, { ReactElement, useEffect, useMemo } from 'react';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Grid,
    InputLabel,
    makeStyles,
    MenuItem,
    Select,
    Switch,
    TextField,
    Theme,
    Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Autocomplete } from '@material-ui/lab';
import { DatePicker } from '@material-ui/pickers';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { find, pick } from 'lodash/fp';
import { Formik } from 'formik';
import { useApp } from '../../App';
import { GetContactForContactDetailsQuery } from '../../../../types/GetContactForContactDetailsQuery';
import {
    ContactCreateInput,
    LikelyToGiveEnum,
    PledgeFrequencyEnum,
    PreferredContactMethodEnum,
    SendNewsletterEnum,
    StatusEnum,
} from '../../../../types/globalTypes';
import { dateFormat } from '../../../lib/intlFormat/intlFormat';
import { CreateContactMutation } from '../../../../types/CreateContactMutation';
import { UpdateContactMutation } from '../../../../types/UpdateContactMutation';
import Autosave from '../../Autosave';
import ContactItem from '../Item';

export const GET_CONTACT_FOR_CONTACT_DETAILS_QUERY = gql`
    query GetContactForContactDetailsQuery($accountListId: ID!, $contactId: ID!) {
        accountListUsers(accountListId: $accountListId) {
            nodes {
                id
                user {
                    id
                    firstName
                    lastName
                }
            }
        }
        accountList(id: $accountListId) {
            id
            contactTagList
        }
        contact(accountListId: $accountListId, id: $contactId) {
            id
            name
            sendNewsletter
            status
            tagList
            pledgeAmount
            pledgeCurrency
            pledgeFrequency
            pledgeReceived
            pledgeStartDate
            user {
                id
                firstName
                lastName
            }
            primaryPerson {
                id
                title
                firstName
                lastName
                suffix
                primaryEmailAddress {
                    id
                    email
                    location
                }
                primaryPhoneNumber {
                    id
                    number
                    location
                }
            }
            primaryAddress {
                id
                street
                city
                state
                postalCode
                location
            }
            lastDonation {
                id
                paymentMethod
                amount {
                    amount
                    currency
                    conversionDate
                }
            }
            likelyToGive
            totalDonations
            envelopeGreeting
            greeting
            contactReferralsToMe {
                nodes {
                    id
                    referredBy {
                        id
                        name
                    }
                }
            }
            noAppeals
            preferredContactMethod
            locale
            timezone
            churchName
            nextAsk
            website
            contactDonorAccounts {
                nodes {
                    id
                    donorAccount {
                        id
                        accountNumber
                        organization {
                            id
                            name
                        }
                    }
                }
            }
            notes
            source
        }
    }
`;

export const CREATE_CONTACT_MUTATION = gql`
    mutation CreateContactMutation($accountListId: ID!, $attributes: ContactCreateInput!) {
        createContact(input: { accountListId: $accountListId, attributes: $attributes }) {
            contact {
                id
                name
                sendNewsletter
                status
                tagList
                pledgeAmount
                pledgeCurrency
                pledgeFrequency
                pledgeReceived
                pledgeStartDate
                user {
                    id
                    firstName
                    lastName
                }
                primaryPerson {
                    id
                    primaryEmailAddress {
                        id
                        email
                        location
                    }
                    primaryPhoneNumber {
                        id
                        number
                        location
                    }
                }
                primaryAddress {
                    id
                    street
                    city
                    state
                    postalCode
                    location
                }
                lastDonation {
                    id
                    paymentMethod
                    amount {
                        amount
                        currency
                        conversionDate
                    }
                }
                likelyToGive
                totalDonations
                envelopeGreeting
                greeting
                contactReferralsToMe {
                    nodes {
                        id
                        referredBy {
                            id
                            name
                        }
                    }
                }
                noAppeals
                preferredContactMethod
                locale
                timezone
                churchName
                nextAsk
                website
                contactDonorAccounts {
                    nodes {
                        id
                        donorAccount {
                            id
                            accountNumber
                            organization {
                                id
                                name
                            }
                        }
                    }
                }
                notes
                source
            }
        }
    }
`;

export const UPDATE_CONTACT_MUTATION = gql`
    mutation UpdateContactMutation($accountListId: ID!, $attributes: ContactUpdateInput!) {
        updateContact(input: { accountListId: $accountListId, attributes: $attributes }) {
            contact {
                id
                name
                sendNewsletter
                status
                tagList
                pledgeAmount
                pledgeCurrency
                pledgeFrequency
                pledgeReceived
                pledgeStartDate
                user {
                    id
                    firstName
                    lastName
                }
                primaryPerson {
                    id
                    primaryEmailAddress {
                        id
                        email
                        location
                    }
                    primaryPhoneNumber {
                        id
                        number
                        location
                    }
                }
                primaryAddress {
                    id
                    street
                    city
                    state
                    postalCode
                    location
                }
                lastDonation {
                    id
                    paymentMethod
                    amount {
                        amount
                        currency
                        conversionDate
                    }
                }
                likelyToGive
                totalDonations
                envelopeGreeting
                greeting
                contactReferralsToMe {
                    nodes {
                        id
                        referredBy {
                            id
                            name
                        }
                    }
                }
                noAppeals
                preferredContactMethod
                locale
                timezone
                churchName
                nextAsk
                website
                contactDonorAccounts {
                    nodes {
                        id
                        donorAccount {
                            id
                            accountNumber
                            organization {
                                id
                                name
                            }
                        }
                    }
                }
                notes
                source
            }
        }
    }
`;

const contactSchema: yup.ObjectSchema<ContactCreateInput> = yup.object({
    name: yup.string().required(),
    status: yup.mixed<StatusEnum>().nullable(),
    sendNewsletter: yup.mixed<SendNewsletterEnum>().nullable(),
    pledgeReceived: yup.boolean().nullable(),
    pledgeAmount: yup.number().nullable().when('status', {
        is: StatusEnum.PARTNER_FINANCIAL,
        then: yup.number().required(),
    }),
    pledgeCurrency: yup.string().nullable().when('status', {
        is: StatusEnum.PARTNER_FINANCIAL,
        then: yup.string().required(),
    }),
    pledgeFrequency: yup.mixed<PledgeFrequencyEnum>().nullable().when('status', {
        is: StatusEnum.PARTNER_FINANCIAL,
        then: yup.mixed<PledgeFrequencyEnum>().required(),
    }),
    pledgeStartDate: yup.date().nullable(),
    userId: yup.string().nullable(),
    tagList: yup.array().of(yup.string()),
    likelyToGive: yup.mixed<LikelyToGiveEnum>().nullable(),
    nextAsk: yup.date().nullable(),
    envelopeGreeting: yup.string().nullable(),
    greeting: yup.string().nullable(),
    noAppeals: yup.boolean().nullable(),
    preferredContactMethod: yup.mixed<PreferredContactMethodEnum>().nullable(),
    locale: yup.string().nullable(),
    timezone: yup.string().nullable(),
    churchName: yup.string().nullable(),
    website: yup.string().nullable(),
    notes: yup.string().nullable(),
});

const useStyles = makeStyles((_theme: Theme) => ({
    formControl: {
        width: '100%',
    },
}));

interface Props {
    contactId?: string;
}

const ContactDetails = ({ contactId }: Props): ReactElement => {
    const classes = useStyles();
    const { state } = useApp();
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const [getContact, { data, loading }] = useLazyQuery<GetContactForContactDetailsQuery>(
        GET_CONTACT_FOR_CONTACT_DETAILS_QUERY,
    );
    const onLoad = async (): Promise<void> => {
        if (state.accountListId && contactId) {
            await getContact({ variables: { accountListId: state.accountListId, contactId } });
        }
    };

    useEffect(() => {
        onLoad();
    }, []);

    useEffect(() => {
        onLoad();
    }, [state.accountListId, contactId]);

    const timezones = [
        { id: 'American Samoa', name: t('(GMT-11:00) American Samoa') },
        { id: 'International Date Line West', name: t('(GMT-11:00) International Date Line West') },
        { id: 'Midway Island', name: t('(GMT-11:00) Midway Island') },
        { id: 'Samoa', name: t('(GMT-11:00) Samoa') },
        { id: 'Hawaii', name: t('(GMT-10:00) Hawaii') },
        { id: 'Alaska', name: t('(GMT-09:00) Alaska') },
        { id: 'Pacific Time (US & Canada)', name: t('(GMT-08:00) Pacific Time (US & Canada)') },
        { id: 'Tijuana', name: t('(GMT-08:00) Tijuana') },
        { id: 'Arizona', name: t('(GMT-07:00) Arizona') },
        { id: 'Chihuahua', name: t('(GMT-07:00) Chihuahua') },
        { id: 'Mazatlan', name: t('(GMT-07:00) Mazatlan') },
        { id: 'Mountain Time (US & Canada)', name: t('(GMT-07:00) Mountain Time (US & Canada)') },
        { id: 'Central America', name: t('(GMT-06:00) Central America') },
        { id: 'Central Time (US & Canada)', name: t('(GMT-06:00) Central Time (US & Canada)') },
        { id: 'Guadalajara', name: t('(GMT-06:00) Guadalajara') },
        { id: 'Mexico City', name: t('(GMT-06:00) Mexico City') },
        { id: 'Monterrey', name: t('(GMT-06:00) Monterrey') },
        { id: 'Saskatchewan', name: t('(GMT-06:00) Saskatchewan') },
        { id: 'Bogota', name: t('(GMT-05:00) Bogota') },
        { id: 'Eastern Time (US & Canada)', name: t('(GMT-05:00) Eastern Time (US & Canada)') },
        { id: 'Indiana (East)', name: t('(GMT-05:00) Indiana (East)') },
        { id: 'Lima', name: t('(GMT-05:00) Lima') },
        { id: 'Quito', name: t('(GMT-05:00) Quito') },
        { id: 'Atlantic Time (Canada)', name: t('(GMT-04:00) Atlantic Time (Canada)') },
        { id: 'Caracas', name: t('(GMT-04:00) Caracas') },
        { id: 'Georgetown', name: t('(GMT-04:00) Georgetown') },
        { id: 'La Paz', name: t('(GMT-04:00) La Paz') },
        { id: 'Santiago', name: t('(GMT-04:00) Santiago') },
        { id: 'Newfoundland', name: t('(GMT-03:30) Newfoundland') },
        { id: 'Brasilia', name: t('(GMT-03:00) Brasilia') },
        { id: 'Buenos Aires', name: t('(GMT-03:00) Buenos Aires') },
        { id: 'Greenland', name: t('(GMT-03:00) Greenland') },
        { id: 'Montevideo', name: t('(GMT-03:00) Montevideo') },
        { id: 'Mid-Atlantic', name: t('(GMT-02:00) Mid-Atlantic') },
        { id: 'Azores', name: t('(GMT-01:00) Azores') },
        { id: 'Cape Verde Is.', name: t('(GMT-01:00) Cape Verde Is.') },
        { id: 'Casablanca', name: t('(GMT+00:00) Casablanca') },
        { id: 'Dublin', name: t('(GMT+00:00) Dublin') },
        { id: 'Edinburgh', name: t('(GMT+00:00) Edinburgh') },
        { id: 'Lisbon', name: t('(GMT+00:00) Lisbon') },
        { id: 'London', name: t('(GMT+00:00) London') },
        { id: 'Monrovia', name: t('(GMT+00:00) Monrovia') },
        { id: 'UTC', name: t('(GMT+00:00) UTC') },
        { id: 'Amsterdam', name: t('(GMT+01:00) Amsterdam') },
        { id: 'Belgrade', name: t('(GMT+01:00) Belgrade') },
        { id: 'Berlin', name: t('(GMT+01:00) Berlin') },
        { id: 'Bern', name: t('(GMT+01:00) Bern') },
        { id: 'Bratislava', name: t('(GMT+01:00) Bratislava') },
        { id: 'Brussels', name: t('(GMT+01:00) Brussels') },
        { id: 'Budapest', name: t('(GMT+01:00) Budapest') },
        { id: 'Copenhagen', name: t('(GMT+01:00) Copenhagen') },
        { id: 'Ljubljana', name: t('(GMT+01:00) Ljubljana') },
        { id: 'Madrid', name: t('(GMT+01:00) Madrid') },
        { id: 'Paris', name: t('(GMT+01:00) Paris') },
        { id: 'Prague', name: t('(GMT+01:00) Prague') },
        { id: 'Rome', name: t('(GMT+01:00) Rome') },
        { id: 'Sarajevo', name: t('(GMT+01:00) Sarajevo') },
        { id: 'Skopje', name: t('(GMT+01:00) Skopje') },
        { id: 'Stockholm', name: t('(GMT+01:00) Stockholm') },
        { id: 'Vienna', name: t('(GMT+01:00) Vienna') },
        { id: 'Warsaw', name: t('(GMT+01:00) Warsaw') },
        { id: 'West Central Africa', name: t('(GMT+01:00) West Central Africa') },
        { id: 'Zagreb', name: t('(GMT+01:00) Zagreb') },
        { id: 'Athens', name: t('(GMT+02:00) Athens') },
        { id: 'Bucharest', name: t('(GMT+02:00) Bucharest') },
        { id: 'Cairo', name: t('(GMT+02:00) Cairo') },
        { id: 'Harare', name: t('(GMT+02:00) Harare') },
        { id: 'Helsinki', name: t('(GMT+02:00) Helsinki') },
        { id: 'Istanbul', name: t('(GMT+02:00) Istanbul') },
        { id: 'Jerusalem', name: t('(GMT+02:00) Jerusalem') },
        { id: 'Kaliningrad', name: t('(GMT+02:00) Kaliningrad') },
        { id: 'Kyiv', name: t('(GMT+02:00) Kyiv') },
        { id: 'Pretoria', name: t('(GMT+02:00) Pretoria') },
        { id: 'Riga', name: t('(GMT+02:00) Riga') },
        { id: 'Sofia', name: t('(GMT+02:00) Sofia') },
        { id: 'Tallinn', name: t('(GMT+02:00) Tallinn') },
        { id: 'Vilnius', name: t('(GMT+02:00) Vilnius') },
        { id: 'Baghdad', name: t('(GMT+03:00) Baghdad') },
        { id: 'Kuwait', name: t('(GMT+03:00) Kuwait') },
        { id: 'Minsk', name: t('(GMT+03:00) Minsk') },
        { id: 'Moscow', name: t('(GMT+03:00) Moscow') },
        { id: 'Nairobi', name: t('(GMT+03:00) Nairobi') },
        { id: 'Riyadh', name: t('(GMT+03:00) Riyadh') },
        { id: 'St. Petersburg', name: t('(GMT+03:00) St. Petersburg') },
        { id: 'Volgograd', name: t('(GMT+03:00) Volgograd') },
        { id: 'Tehran', name: t('(GMT+03:30) Tehran') },
        { id: 'Abu Dhabi', name: t('(GMT+04:00) Abu Dhabi') },
        { id: 'Baku', name: t('(GMT+04:00) Baku') },
        { id: 'Muscat', name: t('(GMT+04:00) Muscat') },
        { id: 'Samara', name: t('(GMT+04:00) Samara') },
        { id: 'Tbilisi', name: t('(GMT+04:00) Tbilisi') },
        { id: 'Yerevan', name: t('(GMT+04:00) Yerevan') },
        { id: 'Kabul', name: t('(GMT+04:30) Kabul') },
        { id: 'Ekaterinburg', name: t('(GMT+05:00) Ekaterinburg') },
        { id: 'Islamabad', name: t('(GMT+05:00) Islamabad') },
        { id: 'Karachi', name: t('(GMT+05:00) Karachi') },
        { id: 'Tashkent', name: t('(GMT+05:00) Tashkent') },
        { id: 'Chennai', name: t('(GMT+05:30) Chennai') },
        { id: 'Kolkata', name: t('(GMT+05:30) Kolkata') },
        { id: 'Mumbai', name: t('(GMT+05:30) Mumbai') },
        { id: 'New Delhi', name: t('(GMT+05:30) New Delhi') },
        { id: 'Sri Jayawardenepura', name: t('(GMT+05:30) Sri Jayawardenepura') },
        { id: 'Kathmandu', name: t('(GMT+05:45) Kathmandu') },
        { id: 'Almaty', name: t('(GMT+06:00) Almaty') },
        { id: 'Astana', name: t('(GMT+06:00) Astana') },
        { id: 'Dhaka', name: t('(GMT+06:00) Dhaka') },
        { id: 'Urumqi', name: t('(GMT+06:00) Urumqi') },
        { id: 'Rangoon', name: t('(GMT+06:30) Rangoon') },
        { id: 'Bangkok', name: t('(GMT+07:00) Bangkok') },
        { id: 'Hanoi', name: t('(GMT+07:00) Hanoi') },
        { id: 'Jakarta', name: t('(GMT+07:00) Jakarta') },
        { id: 'Krasnoyarsk', name: t('(GMT+07:00) Krasnoyarsk') },
        { id: 'Novosibirsk', name: t('(GMT+07:00) Novosibirsk') },
        { id: 'Beijing', name: t('(GMT+08:00) Beijing') },
        { id: 'Chongqing', name: t('(GMT+08:00) Chongqing') },
        { id: 'Hong Kong', name: t('(GMT+08:00) Hong Kong') },
        { id: 'Irkutsk', name: t('(GMT+08:00) Irkutsk') },
        { id: 'Kuala Lumpur', name: t('(GMT+08:00) Kuala Lumpur') },
        { id: 'Perth', name: t('(GMT+08:00) Perth') },
        { id: 'Singapore', name: t('(GMT+08:00) Singapore') },
        { id: 'Taipei', name: t('(GMT+08:00) Taipei') },
        { id: 'Ulaanbaatar', name: t('(GMT+08:00) Ulaanbaatar') },
        { id: 'Osaka', name: t('(GMT+09:00) Osaka') },
        { id: 'Sapporo', name: t('(GMT+09:00) Sapporo') },
        { id: 'Seoul', name: t('(GMT+09:00) Seoul') },
        { id: 'Tokyo', name: t('(GMT+09:00) Tokyo') },
        { id: 'Yakutsk', name: t('(GMT+09:00) Yakutsk') },
        { id: 'Adelaide', name: t('(GMT+09:30) Adelaide') },
        { id: 'Darwin', name: t('(GMT+09:30) Darwin') },
        { id: 'Brisbane', name: t('(GMT+10:00) Brisbane') },
        { id: 'Canberra', name: t('(GMT+10:00) Canberra') },
        { id: 'Guam', name: t('(GMT+10:00) Guam') },
        { id: 'Hobart', name: t('(GMT+10:00) Hobart') },
        { id: 'Melbourne', name: t('(GMT+10:00) Melbourne') },
        { id: 'Port Moresby', name: t('(GMT+10:00) Port Moresby') },
        { id: 'Sydney', name: t('(GMT+10:00) Sydney') },
        { id: 'Vladivostok', name: t('(GMT+10:00) Vladivostok') },
        { id: 'Magadan', name: t('(GMT+11:00) Magadan') },
        { id: 'New Caledonia', name: t('(GMT+11:00) New Caledonia') },
        { id: 'Solomon Is.', name: t('(GMT+11:00) Solomon Is.') },
        { id: 'Srednekolymsk', name: t('(GMT+11:00) Srednekolymsk') },
        { id: 'Auckland', name: t('(GMT+12:00) Auckland') },
        { id: 'Fiji', name: t('(GMT+12:00) Fiji') },
        { id: 'Kamchatka', name: t('(GMT+12:00) Kamchatka') },
        { id: 'Marshall Is.', name: t('(GMT+12:00) Marshall Is.') },
        { id: 'Wellington', name: t('(GMT+12:00) Wellington') },
        { id: 'Chatham Is.', name: t('(GMT+12:45) Chatham Is.') },
        { key: "Nuku'alofa", name: t("(GMT+13:00) Nuku'alofa") },
        { id: 'Tokelau Is.', name: t('(GMT+13:00) Tokelau Is.') },
    ];

    const locales = [
        { id: 'aa', name: t('Afar') },
        { id: 'ab', name: t('Abkhazian') },
        { id: 'ace', name: t('Achinese') },
        { id: 'ach', name: t('Acoli') },
        { id: 'ada', name: t('Adangme') },
        { id: 'ady', name: t('Adyghe') },
        { id: 'ae', name: t('Avestan') },
        { id: 'aeb', name: t('Tunisian Arabic') },
        { id: 'af', name: t('Afrikaans') },
        { id: 'afh', name: t('Afrihili') },
        { id: 'agq', name: t('Aghem') },
        { id: 'ain', name: t('Ainu') },
        { id: 'ak', name: t('Akan') },
        { id: 'akk', name: t('Akkadian') },
        { id: 'akz', name: t('Alabama') },
        { id: 'ale', name: t('Aleut') },
        { id: 'aln', name: t('Gheg Albanian') },
        { id: 'alt', name: t('Southern Altai') },
        { id: 'am', name: t('Amharic') },
        { id: 'an', name: t('Aragonese') },
        { id: 'ang', name: t('Old English') },
        { id: 'anp', name: t('Angika') },
        { id: 'ar', name: t('Arabic') },
        { id: 'ar-001', name: t('Modern Standard Arabic') },
        { id: 'arc', name: t('Aramaic') },
        { id: 'arn', name: t('Mapuche') },
        { id: 'aro', name: t('Araona') },
        { id: 'arp', name: t('Arapaho') },
        { id: 'arq', name: t('Algerian Arabic') },
        { id: 'arw', name: t('Arawak') },
        { id: 'ary', name: t('Moroccan Arabic') },
        { id: 'arz', name: t('Egyptian Arabic') },
        { id: 'as', name: t('Assamese') },
        { id: 'asa', name: t('Asu') },
        { id: 'ase', name: t('American Sign Language') },
        { id: 'ast', name: t('Asturian') },
        { id: 'av', name: t('Avaric') },
        { id: 'avk', name: t('Kotava') },
        { id: 'awa', name: t('Awadhi') },
        { id: 'ay', name: t('Aymara') },
        { id: 'az', name: t('Azeri') },
        { id: 'ba', name: t('Bashkir') },
        { id: 'bal', name: t('Baluchi') },
        { id: 'ban', name: t('Balinese') },
        { id: 'bar', name: t('Bavarian') },
        { id: 'bas', name: t('Basaa') },
        { id: 'bax', name: t('Bamun') },
        { id: 'bbc', name: t('Batak Toba') },
        { id: 'bbj', name: t('Ghomala') },
        { id: 'be', name: t('Belarusian') },
        { id: 'bej', name: t('Beja') },
        { id: 'bem', name: t('Bemba') },
        { id: 'bew', name: t('Betawi') },
        { id: 'bez', name: t('Bena') },
        { id: 'bfd', name: t('Bafut') },
        { id: 'bfq', name: t('Badaga') },
        { id: 'bg', name: t('Bulgarian') },
        { id: 'bgn', name: t('Western Balochi') },
        { id: 'bho', name: t('Bhojpuri') },
        { id: 'bi', name: t('Bislama') },
        { id: 'bik', name: t('Bikol') },
        { id: 'bin', name: t('Bini') },
        { id: 'bjn', name: t('Banjar') },
        { id: 'bkm', name: t('Kom') },
        { id: 'bla', name: t('Siksika') },
        { id: 'bm', name: t('Bambara') },
        { id: 'bn', name: t('Bengali') },
        { id: 'bo', name: t('Tibetan') },
        { id: 'bpy', name: t('Bishnupriya') },
        { id: 'bqi', name: t('Bakhtiari') },
        { id: 'br', name: t('Breton') },
        { id: 'bra', name: t('Braj') },
        { id: 'brh', name: t('Brahui') },
        { id: 'brx', name: t('Bodo') },
        { id: 'bs', name: t('Bosnian') },
        { id: 'bss', name: t('Akoose') },
        { id: 'bua', name: t('Buriat') },
        { id: 'bug', name: t('Buginese') },
        { id: 'bum', name: t('Bulu') },
        { id: 'byn', name: t('Blin') },
        { id: 'byv', name: t('Medumba') },
        { id: 'ca', name: t('Catalan') },
        { id: 'cad', name: t('Caddo') },
        { id: 'car', name: t('Carib') },
        { id: 'cay', name: t('Cayuga') },
        { id: 'cch', name: t('Atsam') },
        { id: 'ce', name: t('Chechen') },
        { id: 'ceb', name: t('Cebuano') },
        { id: 'cgg', name: t('Chiga') },
        { id: 'ch', name: t('Chamorro') },
        { id: 'chb', name: t('Chibcha') },
        { id: 'chg', name: t('Chagatai') },
        { id: 'chk', name: t('Chuukese') },
        { id: 'chm', name: t('Mari') },
        { id: 'chn', name: t('Chinook Jargon') },
        { id: 'cho', name: t('Choctaw') },
        { id: 'chp', name: t('Chipewyan') },
        { id: 'chr', name: t('Cherokee') },
        { id: 'chy', name: t('Cheyenne') },
        { id: 'ckb', name: t('Central Kurdish') },
        { id: 'co', name: t('Corsican') },
        { id: 'cop', name: t('Coptic') },
        { id: 'cps', name: t('Capiznon') },
        { id: 'cr', name: t('Cree') },
        { id: 'crh', name: t('Crimean Turkish') },
        { id: 'cs', name: t('Czech') },
        { id: 'csb', name: t('Kashubian') },
        { id: 'cu', name: t('Church Slavic') },
        { id: 'cv', name: t('Chuvash') },
        { id: 'cy', name: t('Welsh') },
        { id: 'da', name: t('Danish') },
        { id: 'dak', name: t('Dakota') },
        { id: 'dar', name: t('Dargwa') },
        { id: 'dav', name: t('Taita') },
        { id: 'de', name: t('German') },
        { id: 'de-AT', name: t('Austrian German') },
        { id: 'de-CH', name: t('Swiss High German') },
        { id: 'del', name: t('Delaware') },
        { id: 'den', name: t('Slave') },
        { id: 'dgr', name: t('Dogrib') },
        { id: 'din', name: t('Dinka') },
        { id: 'dje', name: t('Zarma') },
        { id: 'doi', name: t('Dogri') },
        { id: 'dsb', name: t('Lower Sorbian') },
        { id: 'dtp', name: t('Central Dusun') },
        { id: 'dua', name: t('Duala') },
        { id: 'dum', name: t('Middle Dutch') },
        { id: 'dv', name: t('Divehi') },
        { id: 'dyo', name: t('Jola-Fonyi') },
        { id: 'dyu', name: t('Dyula') },
        { id: 'dz', name: t('Dzongkha') },
        { id: 'dzg', name: t('Dazaga') },
        { id: 'ebu', name: t('Embu') },
        { id: 'ee', name: t('Ewe') },
        { id: 'efi', name: t('Efik') },
        { id: 'egl', name: t('Emilian') },
        { id: 'egy', name: t('Ancient Egyptian') },
        { id: 'eka', name: t('Ekajuk') },
        { id: 'el', name: t('Greek') },
        { id: 'elx', name: t('Elamite') },
        { id: 'en', name: t('English') },
        { id: 'en-AU', name: t('Australian English') },
        { id: 'en-CA', name: t('Canadian English') },
        { id: 'en-GB', name: t('UK English') },
        { id: 'en-US', name: t('US English') },
        { id: 'enm', name: t('Middle English') },
        { id: 'eo', name: t('Esperanto') },
        { id: 'es', name: t('Spanish') },
        { id: 'es-419', name: t('Latin American Spanish') },
        { id: 'es-ES', name: t('European Spanish') },
        { id: 'es-MX', name: t('Mexican Spanish') },
        { id: 'esu', name: t('Central Yupik') },
        { id: 'et', name: t('Estonian') },
        { id: 'eu', name: t('Basque') },
        { id: 'ewo', name: t('Ewondo') },
        { id: 'ext', name: t('Extremaduran') },
        { id: 'fa', name: t('Persian') },
        { id: 'fa-AF', name: t('Dari') },
        { id: 'fan', name: t('Fang') },
        { id: 'fat', name: t('Fanti') },
        { id: 'ff', name: t('Fulah') },
        { id: 'fi', name: t('Finnish') },
        { id: 'fil', name: t('Filipino') },
        { id: 'fit', name: t('Tornedalen Finnish') },
        { id: 'fj', name: t('Fijian') },
        { id: 'fo', name: t('Faroese') },
        { id: 'fon', name: t('Fon') },
        { id: 'fr', name: t('French') },
        { id: 'fr-CA', name: t('Canadian French') },
        { id: 'fr-CH', name: t('Swiss French') },
        { id: 'frc', name: t('Cajun French') },
        { id: 'frm', name: t('Middle French') },
        { id: 'fro', name: t('Old French') },
        { id: 'frp', name: t('Arpitan') },
        { id: 'frr', name: t('Northern Frisian') },
        { id: 'frs', name: t('Eastern Frisian') },
        { id: 'fur', name: t('Friulian') },
        { id: 'fy', name: t('Western Frisian') },
        { id: 'ga', name: t('Irish') },
        { id: 'gaa', name: t('Ga') },
        { id: 'gag', name: t('Gagauz') },
        { id: 'gan', name: t('Gan Chinese') },
        { id: 'gay', name: t('Gayo') },
        { id: 'gba', name: t('Gbaya') },
        { id: 'gbz', name: t('Zoroastrian Dari') },
        { id: 'gd', name: t('Scottish Gaelic') },
        { id: 'gez', name: t('Geez') },
        { id: 'gil', name: t('Gilbertese') },
        { id: 'gl', name: t('Galician') },
        { id: 'glk', name: t('Gilaki') },
        { id: 'gmh', name: t('Middle High German') },
        { id: 'gn', name: t('Guarani') },
        { id: 'goh', name: t('Old High German') },
        { id: 'gom', name: t('Goan Konkani') },
        { id: 'gon', name: t('Gondi') },
        { id: 'gor', name: t('Gorontalo') },
        { id: 'got', name: t('Gothic') },
        { id: 'grb', name: t('Grebo') },
        { id: 'grc', name: t('Ancient Greek') },
        { id: 'gsw', name: t('Swiss German') },
        { id: 'gu', name: t('Gujarati') },
        { id: 'guc', name: t('Wayuu') },
        { id: 'gur', name: t('Frafra') },
        { id: 'guz', name: t('Gusii') },
        { id: 'gv', name: t('Manx') },
        { id: 'gwi', name: t('Gwichʼin') },
        { id: 'ha', name: t('Hausa') },
        { id: 'hai', name: t('Haida') },
        { id: 'hak', name: t('Hakka Chinese') },
        { id: 'haw', name: t('Hawaiian') },
        { id: 'he', name: t('Hebrew') },
        { id: 'hi', name: t('Hindi') },
        { id: 'hif', name: t('Fiji Hindi') },
        { id: 'hil', name: t('Hiligaynon') },
        { id: 'hit', name: t('Hittite') },
        { id: 'hmn', name: t('Hmong') },
        { id: 'ho', name: t('Hiri Motu') },
        { id: 'hr', name: t('Croatian') },
        { id: 'hsb', name: t('Upper Sorbian') },
        { id: 'hsn', name: t('Xiang Chinese') },
        { id: 'ht', name: t('Haitian Creole') },
        { id: 'hu', name: t('Hungarian') },
        { id: 'hup', name: t('Hupa') },
        { id: 'hy', name: t('Armenian') },
        { id: 'hz', name: t('Herero') },
        { id: 'ia', name: t('Interlingua') },
        { id: 'iba', name: t('Iban') },
        { id: 'ibb', name: t('Ibibio') },
        { id: 'id', name: t('Indonesian') },
        { id: 'ie', name: t('Interlingue') },
        { id: 'ig', name: t('Igbo') },
        { id: 'ii', name: t('Sichuan Yi') },
        { id: 'ik', name: t('Inupiaq') },
        { id: 'ilo', name: t('Iloko') },
        { id: 'inh', name: t('Ingush') },
        { id: 'io', name: t('Ido') },
        { id: 'is', name: t('Icelandic') },
        { id: 'it', name: t('Italian') },
        { id: 'iu', name: t('Inuktitut') },
        { id: 'izh', name: t('Ingrian') },
        { id: 'ja', name: t('Japanese') },
        { id: 'jam', name: t('Jamaican Creole English') },
        { id: 'jbo', name: t('Lojban') },
        { id: 'jgo', name: t('Ngomba') },
        { id: 'jmc', name: t('Machame') },
        { id: 'jpr', name: t('Judeo-Persian') },
        { id: 'jrb', name: t('Judeo-Arabic') },
        { id: 'jut', name: t('Jutish') },
        { id: 'jv', name: t('Javanese') },
        { id: 'ka', name: t('Georgian') },
        { id: 'kaa', name: t('Kara-Kalpak') },
        { id: 'kab', name: t('Kabyle') },
        { id: 'kac', name: t('Kachin') },
        { id: 'kaj', name: t('Jju') },
        { id: 'kam', name: t('Kamba') },
        { id: 'kaw', name: t('Kawi') },
        { id: 'kbd', name: t('Kabardian') },
        { id: 'kbl', name: t('Kanembu') },
        { id: 'kcg', name: t('Tyap') },
        { id: 'kde', name: t('Makonde') },
        { id: 'kea', name: t('Kabuverdianu') },
        { id: 'ken', name: t('Kenyang') },
        { id: 'kfo', name: t('Koro') },
        { id: 'kg', name: t('Kongo') },
        { id: 'kgp', name: t('Kaingang') },
        { id: 'kha', name: t('Khasi') },
        { id: 'kho', name: t('Khotanese') },
        { id: 'khq', name: t('Koyra Chiini') },
        { id: 'khw', name: t('Khowar') },
        { id: 'ki', name: t('Kikuyu') },
        { id: 'kiu', name: t('Kirmanjki') },
        { id: 'kj', name: t('Kuanyama') },
        { id: 'kk', name: t('Kazakh') },
        { id: 'kkj', name: t('Kako') },
        { id: 'kl', name: t('Kalaallisut') },
        { id: 'kln', name: t('Kalenjin') },
        { id: 'km', name: t('Khmer') },
        { id: 'kmb', name: t('Kimbundu') },
        { id: 'kn', name: t('Kannada') },
        { id: 'ko', name: t('Korean') },
        { id: 'koi', name: t('Komi-Permyak') },
        { id: 'kok', name: t('Konkani') },
        { id: 'kos', name: t('Kosraean') },
        { id: 'kpe', name: t('Kpelle') },
        { id: 'kr', name: t('Kanuri') },
        { id: 'krc', name: t('Karachay-Balkar') },
        { id: 'kri', name: t('Krio') },
        { id: 'krj', name: t('Kinaray-a') },
        { id: 'krl', name: t('Karelian') },
        { id: 'kru', name: t('Kurukh') },
        { id: 'ks', name: t('Kashmiri') },
        { id: 'ksb', name: t('Shambala') },
        { id: 'ksf', name: t('Bafia') },
        { id: 'ksh', name: t('Colognian') },
        { id: 'ku', name: t('Kurdish') },
        { id: 'kum', name: t('Kumyk') },
        { id: 'kut', name: t('Kutenai') },
        { id: 'kv', name: t('Komi') },
        { id: 'kw', name: t('Cornish') },
        { id: 'ky', name: t('Kirghiz') },
        { id: 'la', name: t('Latin') },
        { id: 'lad', name: t('Ladino') },
        { id: 'lag', name: t('Langi') },
        { id: 'lah', name: t('Lahnda') },
        { id: 'lam', name: t('Lamba') },
        { id: 'lb', name: t('Luxembourgish') },
        { id: 'lez', name: t('Lezghian') },
        { id: 'lfn', name: t('Lingua Franca Nova') },
        { id: 'lg', name: t('Ganda') },
        { id: 'li', name: t('Limburgish') },
        { id: 'lij', name: t('Ligurian') },
        { id: 'liv', name: t('Livonian') },
        { id: 'lkt', name: t('Lakota') },
        { id: 'lmo', name: t('Lombard') },
        { id: 'ln', name: t('Lingala') },
        { id: 'lo', name: t('Lao') },
        { id: 'lol', name: t('Mongo') },
        { id: 'loz', name: t('Lozi') },
        { id: 'lrc', name: t('Northern Luri') },
        { id: 'lt', name: t('Lithuanian') },
        { id: 'ltg', name: t('Latgalian') },
        { id: 'lu', name: t('Luba-Katanga') },
        { id: 'lua', name: t('Luba-Lulua') },
        { id: 'lui', name: t('Luiseno') },
        { id: 'lun', name: t('Lunda') },
        { id: 'luo', name: t('Luo') },
        { id: 'lus', name: t('Mizo') },
        { id: 'luy', name: t('Luyia') },
        { id: 'lv', name: t('Latvian') },
        { id: 'lzh', name: t('Literary Chinese') },
        { id: 'lzz', name: t('Laz') },
        { id: 'mad', name: t('Madurese') },
        { id: 'maf', name: t('Mafa') },
        { id: 'mag', name: t('Magahi') },
        { id: 'mai', name: t('Maithili') },
        { id: 'mak', name: t('Makasar') },
        { id: 'man', name: t('Mandingo') },
        { id: 'mas', name: t('Masai') },
        { id: 'mde', name: t('Maba') },
        { id: 'mdf', name: t('Moksha') },
        { id: 'mdr', name: t('Mandar') },
        { id: 'men', name: t('Mende') },
        { id: 'mer', name: t('Meru') },
        { id: 'mfe', name: t('Morisyen') },
        { id: 'mg', name: t('Malagasy') },
        { id: 'mga', name: t('Middle Irish') },
        { id: 'mgh', name: t('Makhuwa-Meetto') },
        { id: 'mgo', name: t('Metaʼ') },
        { id: 'mh', name: t('Marshallese') },
        { id: 'mi', name: t('Maori') },
        { id: 'mic', name: t('Micmac') },
        { id: 'min', name: t('Minangkabau') },
        { id: 'mk', name: t('Macedonian') },
        { id: 'ml', name: t('Malayalam') },
        { id: 'mn', name: t('Mongolian') },
        { id: 'mnc', name: t('Manchu') },
        { id: 'mni', name: t('Manipuri') },
        { id: 'moh', name: t('Mohawk') },
        { id: 'mos', name: t('Mossi') },
        { id: 'mr', name: t('Marathi') },
        { id: 'mrj', name: t('Western Mari') },
        { id: 'ms', name: t('Malay') },
        { id: 'mt', name: t('Maltese') },
        { id: 'mua', name: t('Mundang') },
        { id: 'mul', name: t('Multiple Languages') },
        { id: 'mus', name: t('Creek') },
        { id: 'mwl', name: t('Mirandese') },
        { id: 'mwr', name: t('Marwari') },
        { id: 'mwv', name: t('Mentawai') },
        { id: 'my', name: t('Myanmar Language') },
        { id: 'mye', name: t('Myene') },
        { id: 'myv', name: t('Erzya') },
        { id: 'mzn', name: t('Mazanderani') },
        { id: 'na', name: t('Nauru') },
        { id: 'nan', name: t('Min Nan Chinese') },
        { id: 'nap', name: t('Neapolitan') },
        { id: 'naq', name: t('Nama') },
        { id: 'nb', name: t('Norwegian Bokmål') },
        { id: 'nd', name: t('North Ndebele') },
        { id: 'nds', name: t('Low German') },
        { id: 'nds-NL', name: t('Low Saxon') },
        { id: 'ne', name: t('Nepali') },
        { id: 'new', name: t('Newari') },
        { id: 'ng', name: t('Ndonga') },
        { id: 'nia', name: t('Nias') },
        { id: 'niu', name: t('Niuean') },
        { id: 'njo', name: t('Ao Naga') },
        { id: 'nl', name: t('Dutch') },
        { id: 'nl-BE', name: t('Flemish') },
        { id: 'nmg', name: t('Kwasio') },
        { id: 'nn', name: t('Norwegian Nynorsk') },
        { id: 'nnh', name: t('Ngiemboon') },
        { id: 'no', name: t('Norwegian') },
        { id: 'nog', name: t('Nogai') },
        { id: 'non', name: t('Old Norse') },
        { id: 'nov', name: t('Novial') },
        { id: 'nqo', name: t('N’Ko') },
        { id: 'nr', name: t('South Ndebele') },
        { id: 'nso', name: t('Northern Sotho') },
        { id: 'nus', name: t('Nuer') },
        { id: 'nv', name: t('Navajo') },
        { id: 'nwc', name: t('Classical Newari') },
        { id: 'ny', name: t('Nyanja') },
        { id: 'nym', name: t('Nyamwezi') },
        { id: 'nyn', name: t('Nyankole') },
        { id: 'nyo', name: t('Nyoro') },
        { id: 'nzi', name: t('Nzima') },
        { id: 'oc', name: t('Occitan') },
        { id: 'oj', name: t('Ojibwa') },
        { id: 'om', name: t('Oromo') },
        { id: 'or', name: t('Oriya') },
        { id: 'os', name: t('Ossetic') },
        { id: 'osa', name: t('Osage') },
        { id: 'ota', name: t('Ottoman Turkish') },
        { id: 'pa', name: t('Punjabi') },
        { id: 'pag', name: t('Pangasinan') },
        { id: 'pal', name: t('Pahlavi') },
        { id: 'pam', name: t('Pampanga') },
        { id: 'pap', name: t('Papiamento') },
        { id: 'pau', name: t('Palauan') },
        { id: 'pcd', name: t('Picard') },
        { id: 'pdc', name: t('Pennsylvania German') },
        { id: 'pdt', name: t('Plautdietsch') },
        { id: 'peo', name: t('Old Persian') },
        { id: 'pfl', name: t('Palatine German') },
        { id: 'phn', name: t('Phoenician') },
        { id: 'pi', name: t('Pali') },
        { id: 'pl', name: t('Polish') },
        { id: 'pms', name: t('Piedmontese') },
        { id: 'pnt', name: t('Pontic') },
        { id: 'pon', name: t('Pohnpeian') },
        { id: 'prg', name: t('Prussian') },
        { id: 'pro', name: t('Old Provençal') },
        { id: 'ps', name: t('Pushto') },
        { id: 'pt', name: t('Portuguese') },
        { id: 'pt-BR', name: t('Brazilian Portuguese') },
        { id: 'pt-PT', name: t('European Portuguese') },
        { id: 'qu', name: t('Quechua') },
        { id: 'quc', name: t('Kʼicheʼ') },
        { id: 'qug', name: t('Chimborazo Highland Quichua') },
        { id: 'raj', name: t('Rajasthani') },
        { id: 'rap', name: t('Rapanui') },
        { id: 'rar', name: t('Rarotongan') },
        { id: 'rgn', name: t('Romagnol') },
        { id: 'rif', name: t('Riffian') },
        { id: 'rm', name: t('Romansh') },
        { id: 'rn', name: t('Rundi') },
        { id: 'ro', name: t('Romanian') },
        { id: 'ro-MD', name: t('Moldavian') },
        { id: 'rof', name: t('Rombo') },
        { id: 'rom', name: t('Romany') },
        { id: 'root', name: t('Root') },
        { id: 'rtm', name: t('Rotuman') },
        { id: 'ru', name: t('Russian') },
        { id: 'rue', name: t('Rusyn') },
        { id: 'rug', name: t('Roviana') },
        { id: 'rup', name: t('Aromanian') },
        { id: 'rw', name: t('Kinyarwanda') },
        { id: 'rwk', name: t('Rwa') },
        { id: 'sa', name: t('Sanskrit') },
        { id: 'sad', name: t('Sandawe') },
        { id: 'sah', name: t('Sakha') },
        { id: 'sam', name: t('Samaritan Aramaic') },
        { id: 'saq', name: t('Samburu') },
        { id: 'sas', name: t('Sasak') },
        { id: 'sat', name: t('Santali') },
        { id: 'saz', name: t('Saurashtra') },
        { id: 'sba', name: t('Ngambay') },
        { id: 'sbp', name: t('Sangu') },
        { id: 'sc', name: t('Sardinian') },
        { id: 'scn', name: t('Sicilian') },
        { id: 'sco', name: t('Scots') },
        { id: 'sd', name: t('Sindhi') },
        { id: 'sdc', name: t('Sassarese Sardinian') },
        { id: 'sdh', name: t('Southern Kurdish') },
        { id: 'se', name: t('Northern Sami') },
        { id: 'see', name: t('Seneca') },
        { id: 'seh', name: t('Sena') },
        { id: 'sei', name: t('Seri') },
        { id: 'sel', name: t('Selkup') },
        { id: 'ses', name: t('Koyraboro Senni') },
        { id: 'sg', name: t('Sango') },
        { id: 'sga', name: t('Old Irish') },
        { id: 'sgs', name: t('Samogitian') },
        { id: 'sh', name: t('Serbo-Croatian') },
        { id: 'shi', name: t('Tachelhit') },
        { id: 'shn', name: t('Shan') },
        { id: 'shu', name: t('Chadian Arabic') },
        { id: 'si', name: t('Sinhala') },
        { id: 'sid', name: t('Sidamo') },
        { id: 'sk', name: t('Slovak') },
        { id: 'sl', name: t('Slovenian') },
        { id: 'sli', name: t('Lower Silesian') },
        { id: 'sly', name: t('Selayar') },
        { id: 'sm', name: t('Samoan') },
        { id: 'sma', name: t('Southern Sami') },
        { id: 'smj', name: t('Lule Sami') },
        { id: 'smn', name: t('Inari Sami') },
        { id: 'sms', name: t('Skolt Sami') },
        { id: 'sn', name: t('Shona') },
        { id: 'snk', name: t('Soninke') },
        { id: 'so', name: t('Somali') },
        { id: 'sog', name: t('Sogdien') },
        { id: 'sq', name: t('Albanian') },
        { id: 'sr', name: t('Serbian') },
        { id: 'srn', name: t('Sranan Tongo') },
        { id: 'srr', name: t('Serer') },
        { id: 'ss', name: t('Swati') },
        { id: 'ssy', name: t('Saho') },
        { id: 'st', name: t('Southern Sotho') },
        { id: 'stq', name: t('Saterland Frisian') },
        { id: 'su', name: t('Sundanese') },
        { id: 'suk', name: t('Sukuma') },
        { id: 'sus', name: t('Susu') },
        { id: 'sux', name: t('Sumerian') },
        { id: 'sv', name: t('Swedish') },
        { id: 'sw', name: t('Swahili') },
        { id: 'sw-CD', name: t('Congo Swahili') },
        { id: 'swb', name: t('Comorian') },
        { id: 'syc', name: t('Classical Syriac') },
        { id: 'syr', name: t('Syriac') },
        { id: 'szl', name: t('Silesian') },
        { id: 'ta', name: t('Tamil') },
        { id: 'tcy', name: t('Tulu') },
        { id: 'te', name: t('Telugu') },
        { id: 'tem', name: t('Timne') },
        { id: 'teo', name: t('Teso') },
        { id: 'ter', name: t('Tereno') },
        { id: 'tet', name: t('Tetum') },
        { id: 'tg', name: t('Tajik') },
        { id: 'th', name: t('Thai') },
        { id: 'ti', name: t('Tigrinya') },
        { id: 'tig', name: t('Tigre') },
        { id: 'tiv', name: t('Tiv') },
        { id: 'tk', name: t('Turkmen') },
        { id: 'tkl', name: t('Tokelau') },
        { id: 'tkr', name: t('Tsakhur') },
        { id: 'tl', name: t('Tagalog') },
        { id: 'tlh', name: t('Klingon') },
        { id: 'tli', name: t('Tlingit') },
        { id: 'tly', name: t('Talysh') },
        { id: 'tmh', name: t('Tamashek') },
        { id: 'tn', name: t('Tswana') },
        { id: 'to', name: t('Tongan') },
        { id: 'tog', name: t('Nyasa Tonga') },
        { id: 'tpi', name: t('Tok Pisin') },
        { id: 'tr', name: t('Turkish') },
        { id: 'tru', name: t('Turoyo') },
        { id: 'trv', name: t('Taroko') },
        { id: 'ts', name: t('Tsonga') },
        { id: 'tsd', name: t('Tsakonian') },
        { id: 'tsi', name: t('Tsimshian') },
        { id: 'tt', name: t('Tatar') },
        { id: 'ttt', name: t('Muslim Tat') },
        { id: 'tum', name: t('Tumbuka') },
        { id: 'tvl', name: t('Tuvalu') },
        { id: 'tw', name: t('Twi') },
        { id: 'twq', name: t('Tasawaq') },
        { id: 'ty', name: t('Tahitian') },
        { id: 'tyv', name: t('Tuvinian') },
        { id: 'tzm', name: t('Central Atlas Tamazight') },
        { id: 'udm', name: t('Udmurt') },
        { id: 'ug', name: t('Uighur') },
        { id: 'uga', name: t('Ugaritic') },
        { id: 'uk', name: t('Ukrainian') },
        { id: 'umb', name: t('Umbundu') },
        { id: 'und', name: t('Unknown Language') },
        { id: 'ur', name: t('Urdu') },
        { id: 'uz', name: t('Uzbek') },
        { id: 'vai', name: t('Vai') },
        { id: 've', name: t('Venda') },
        { id: 'vec', name: t('Venetian') },
        { id: 'vep', name: t('Veps') },
        { id: 'vi', name: t('Vietnamese') },
        { id: 'vls', name: t('West Flemish') },
        { id: 'vmf', name: t('Main-Franconian') },
        { id: 'vo', name: t('Volapük') },
        { id: 'vot', name: t('Votic') },
        { id: 'vro', name: t('Võro') },
        { id: 'vun', name: t('Vunjo') },
        { id: 'wa', name: t('Walloon') },
        { id: 'wae', name: t('Walser') },
        { id: 'wal', name: t('Wolaytta') },
        { id: 'war', name: t('Waray') },
        { id: 'was', name: t('Washo') },
        { id: 'wbp', name: t('Warlpiri') },
        { id: 'wo', name: t('Wolof') },
        { id: 'wuu', name: t('Wu Chinese') },
        { id: 'xal', name: t('Kalmyk') },
        { id: 'xh', name: t('Xhosa') },
        { id: 'xmf', name: t('Mingrelian') },
        { id: 'xog', name: t('Soga') },
        { id: 'yao', name: t('Yao') },
        { id: 'yap', name: t('Yapese') },
        { id: 'yav', name: t('Yangben') },
        { id: 'ybb', name: t('Yemba') },
        { id: 'yi', name: t('Yiddish') },
        { id: 'yo', name: t('Yoruba') },
        { id: 'yrl', name: t('Nheengatu') },
        { id: 'yue', name: t('Cantonese') },
        { id: 'za', name: t('Zhuang') },
        { id: 'zap', name: t('Zapotec') },
        { id: 'zbl', name: t('Blissymbols') },
        { id: 'zea', name: t('Zeelandic') },
        { id: 'zen', name: t('Zenaga') },
        { id: 'zgh', name: t('Standard Moroccan Tamazight') },
        { id: 'zh', name: t('Chinese') },
        { id: 'zh-Hans', name: t('Simplified Chinese') },
        { id: 'zh-Hant', name: t('Traditional Chinese') },
        { id: 'zu', name: t('Zulu') },
        { id: 'zun', name: t('Zuni') },
        { id: 'zxx', name: t('No linguistic content') },
        { id: 'zza', name: t('Zaza') },
    ];

    const currencies = [
        { id: 'AED', name: t('UAE dirham') },
        { id: 'AFN', name: t('Afghan Afghani') },
        { id: 'ALK', name: t('Albanian lek (1946–1965)') },
        { id: 'ALL', name: t('Albanian lek') },
        { id: 'AMD', name: t('Armenian dram') },
        { id: 'ANG', name: t('Netherlands Antillean guilder') },
        { id: 'AOA', name: t('Angolan kwanza') },
        { id: 'AOK', name: t('Angolan kwanza (1977–1991)') },
        { id: 'AON', name: t('Angolan new kwanza (1990–2000)') },
        { id: 'AOR', name: t('Angolan readjusted kwanza (1995–1999)') },
        { id: 'ARA', name: t('Argentine austral') },
        { id: 'ARL', name: t('Argentine peso ley (1970–1983)') },
        { id: 'ARM', name: t('Argentine peso (1881–1970)') },
        { id: 'ARP', name: t('Argentine peso (1983–1985)') },
        { id: 'ARS', name: t('Argentine peso') },
        { id: 'ATS', name: t('Austrian schilling') },
        { id: 'AUD', name: t('Australian dollar') },
        { id: 'AWG', name: t('Aruban florin') },
        { id: 'AZM', name: t('Azerbaijani manat (1993–2006)') },
        { id: 'AZN', name: t('Azerbaijani manat') },
        { id: 'BAD', name: t('Bosnia-Herzegovina dinar (1992–1994)') },
        { id: 'BAM', name: t('Bosnia-Herzegovina convertible mark') },
        { id: 'BAN', name: t('Bosnia-Herzegovina new dinar (1994–1997)') },
        { id: 'BBD', name: t('Barbadian dollar') },
        { id: 'BDT', name: t('Bangladeshi taka') },
        { id: 'BEC', name: t('Belgian franc (convertible)') },
        { id: 'BEF', name: t('Belgian franc') },
        { id: 'BEL', name: t('Belgian franc (financial)') },
        { id: 'BGL', name: t('Bulgarian hard lev') },
        { id: 'BGM', name: t('Bulgarian socialist lev') },
        { id: 'BGN', name: t('Bulgarian lev') },
        { id: 'BGO', name: t('Bulgarian lev (1879–1952)') },
        { id: 'BHD', name: t('Bahraini dinar') },
        { id: 'BIF', name: t('Burundian franc') },
        { id: 'BMD', name: t('Bermudan dollar') },
        { id: 'BND', name: t('Brunei dollar') },
        { id: 'BOB', name: t('Bolivian boliviano') },
        { id: 'BOL', name: t('Bolivian boliviano (1863–1963)') },
        { id: 'BOP', name: t('Bolivian peso') },
        { id: 'BOV', name: t('Bolivian mvdol') },
        { id: 'BRB', name: t('Brazilian new cruzeiro (1967–1986)') },
        { id: 'BRC', name: t('Brazilian cruzado (1986–1989)') },
        { id: 'BRE', name: t('Brazilian cruzeiro (1990–1993)') },
        { id: 'BRL', name: t('Brazilian real') },
        { id: 'BRN', name: t('Brazilian new cruzado (1989–1990)') },
        { id: 'BRR', name: t('Brazilian cruzeiro (1993–1994)') },
        { id: 'BRZ', name: t('Brazilian cruzeiro (1942–1967)') },
        { id: 'BSD', name: t('Bahamian dollar') },
        { id: 'BTN', name: t('Bhutanese ngultrum') },
        { id: 'BUK', name: t('Burmese kyat') },
        { id: 'BWP', name: t('Botswanan pula') },
        { id: 'BYB', name: t('Belarusian new ruble (1994–1999)') },
        { id: 'BYR', name: t('Belarusian ruble') },
        { id: 'BZD', name: t('Belize dollar') },
        { id: 'CAD', name: t('Canadian dollar') },
        { id: 'CDF', name: t('Congolese franc') },
        { id: 'CHE', name: t('WIR euro') },
        { id: 'CHF', name: t('Swiss franc') },
        { id: 'CHW', name: t('WIR franc') },
        { id: 'CLE', name: t('Chilean escudo') },
        { id: 'CLF', name: t('Chilean unit of account (UF)') },
        { id: 'CLP', name: t('Chilean peso') },
        { id: 'CNX', name: t('Chinese People’s Bank dollar') },
        { id: 'CNY', name: t('Chinese yuan') },
        { id: 'COP', name: t('Colombian peso') },
        { id: 'COU', name: t('Colombian real value unit') },
        { id: 'CRC', name: t('Costa Rican colón') },
        { id: 'CSD', name: t('Serbian dinar (2002–2006)') },
        { id: 'CSK', name: t('Czechoslovak hard koruna') },
        { id: 'CUC', name: t('Cuban convertible peso') },
        { id: 'CUP', name: t('Cuban peso') },
        { id: 'CVE', name: t('Cape Verdean escudo') },
        { id: 'CYP', name: t('Cypriot pound') },
        { id: 'CZK', name: t('Czech Republic koruna') },
        { id: 'DDM', name: t('East German mark') },
        { id: 'DEM', name: t('German mark') },
        { id: 'DJF', name: t('Djiboutian franc') },
        { id: 'DKK', name: t('Danish krone') },
        { id: 'DOP', name: t('Dominican peso') },
        { id: 'DZD', name: t('Algerian dinar') },
        { id: 'ECS', name: t('Ecuadorian sucre') },
        { id: 'ECV', name: t('Ecuadorian unit of constant value') },
        { id: 'EEK', name: t('Estonian kroon') },
        { id: 'EGP', name: t('Egyptian pound') },
        { id: 'ERN', name: t('Eritrean nakfa') },
        { id: 'ESA', name: t('Spanish peseta (A account)') },
        { id: 'ESB', name: t('Spanish peseta (convertible account)') },
        { id: 'ESP', name: t('Spanish peseta') },
        { id: 'ETB', name: t('Ethiopian birr') },
        { id: 'EUR', name: t('euro') },
        { id: 'FIM', name: t('Finnish markka') },
        { id: 'FJD', name: t('Fijian dollar') },
        { id: 'FKP', name: t('Falkland Islands pound') },
        { id: 'FRF', name: t('French franc') },
        { id: 'GBP', name: t('British pound') },
        { id: 'GEK', name: t('Georgian kupon larit') },
        { id: 'GEL', name: t('Georgian lari') },
        { id: 'GHC', name: t('Ghanaian cedi (1979–2007)') },
        { id: 'GHS', name: t('Ghanaian cedi') },
        { id: 'GIP', name: t('Gibraltar pound') },
        { id: 'GMD', name: t('Gambian dalasi') },
        { id: 'GNF', name: t('Guinean franc') },
        { id: 'GNS', name: t('Guinean syli') },
        { id: 'GQE', name: t('Equatorial Guinean ekwele') },
        { id: 'GRD', name: t('Greek drachma') },
        { id: 'GTQ', name: t('Guatemalan quetzal') },
        { id: 'GWE', name: t('Portuguese Guinea escudo') },
        { id: 'GWP', name: t('Guinea-Bissau peso') },
        { id: 'GYD', name: t('Guyanaese dollar') },
        { id: 'HKD', name: t('Hong Kong dollar') },
        { id: 'HNL', name: t('Honduran lempira') },
        { id: 'HRD', name: t('Croatian dinar') },
        { id: 'HRK', name: t('Croatian kuna') },
        { id: 'HTG', name: t('Haitian gourde') },
        { id: 'HUF', name: t('Hungarian forint') },
        { id: 'IDR', name: t('Indonesian rupiah') },
        { id: 'IEP', name: t('Irish pound') },
        { id: 'ILP', name: t('Israeli pound') },
        { id: 'ILR', name: t('Israeli sheqel (1980–1985)') },
        { id: 'ILS', name: t('Israeli new sheqel') },
        { id: 'INR', name: t('Indian rupee') },
        { id: 'IQD', name: t('Iraqi dinar') },
        { id: 'IRR', name: t('Iranian rial') },
        { id: 'ISJ', name: t('Icelandic króna (1918–1981)') },
        { id: 'ISK', name: t('Icelandic króna') },
        { id: 'ITL', name: t('Italian lira') },
        { id: 'JMD', name: t('Jamaican dollar') },
        { id: 'JOD', name: t('Jordanian dinar') },
        { id: 'JPY', name: t('Japanese yen') },
        { id: 'KES', name: t('Kenyan shilling') },
        { id: 'KGS', name: t('Kyrgystani som') },
        { id: 'KHR', name: t('Cambodian riel') },
        { id: 'KMF', name: t('Comorian franc') },
        { id: 'KPW', name: t('North Korean won') },
        { id: 'KRH', name: t('South Korean hwan (1953–1962)') },
        { id: 'KRO', name: t('South Korean won (1945–1953)') },
        { id: 'KRW', name: t('South Korean won') },
        { id: 'KWD', name: t('Kuwaiti dinar') },
        { id: 'KYD', name: t('Cayman Islands dollar') },
        { id: 'KZT', name: t('Kazakhstani tenge') },
        { id: 'LAK', name: t('Laotian kip') },
        { id: 'LBP', name: t('Lebanese pound') },
        { id: 'LKR', name: t('Sri Lankan rupee') },
        { id: 'LRD', name: t('Liberian dollar') },
        { id: 'LSL', name: t('Lesotho loti') },
        { id: 'LTL', name: t('Lithuanian litas') },
        { id: 'LTT', name: t('Lithuanian talonas') },
        { id: 'LUC', name: t('Luxembourgian convertible franc') },
        { id: 'LUF', name: t('Luxembourgian franc') },
        { id: 'LUL', name: t('Luxembourg financial franc') },
        { id: 'LVL', name: t('Latvian lats') },
        { id: 'LVR', name: t('Latvian ruble') },
        { id: 'LYD', name: t('Libyan dinar') },
        { id: 'MAD', name: t('Moroccan dirham') },
        { id: 'MAF', name: t('Moroccan franc') },
        { id: 'MCF', name: t('Monegasque franc') },
        { id: 'MDC', name: t('Moldovan cupon') },
        { id: 'MDL', name: t('Moldovan leu') },
        { id: 'MGA', name: t('Malagasy ariary') },
        { id: 'MGF', name: t('Malagasy franc') },
        { id: 'MKD', name: t('Macedonian denar') },
        { id: 'MKN', name: t('Macedonian denar (1992–1993)') },
        { id: 'MLF', name: t('Malian franc') },
        { id: 'MMK', name: t('Myanmar kyat') },
        { id: 'MNT', name: t('Mongolian tugrik') },
        { id: 'MOP', name: t('Macanese pataca') },
        { id: 'MRO', name: t('Mauritanian ouguiya') },
        { id: 'MTL', name: t('Maltese lira') },
        { id: 'MTP', name: t('Maltese pound') },
        { id: 'MUR', name: t('Mauritian rupee') },
        { id: 'MVP', name: t('Maldivian rupee (1947–1981)') },
        { id: 'MVR', name: t('Maldivian rufiyaa') },
        { id: 'MWK', name: t('Malawian kwacha') },
        { id: 'MXN', name: t('Mexican peso') },
        { id: 'MXP', name: t('Mexican silver peso (1861–1992)') },
        { id: 'MXV', name: t('Mexican investment unit') },
        { id: 'MYR', name: t('Malaysian ringgit') },
        { id: 'MZE', name: t('Mozambican escudo') },
        { id: 'MZM', name: t('Mozambican metical (1980–2006)') },
        { id: 'MZN', name: t('Mozambican metical') },
        { id: 'NAD', name: t('Namibian dollar') },
        { id: 'NGN', name: t('Nigerian naira') },
        { id: 'NIC', name: t('Nicaraguan córdoba (1988–1991)') },
        { id: 'NIO', name: t('Nicaraguan córdoba') },
        { id: 'NLG', name: t('Dutch guilder') },
        { id: 'NOK', name: t('Norwegian krone') },
        { id: 'NPR', name: t('Nepalese rupee') },
        { id: 'NZD', name: t('New Zealand dollar') },
        { id: 'OMR', name: t('Omani rial') },
        { id: 'PAB', name: t('Panamanian balboa') },
        { id: 'PEI', name: t('Peruvian inti') },
        { id: 'PEN', name: t('Peruvian nuevo sol') },
        { id: 'PES', name: t('Peruvian sol (1863–1965)') },
        { id: 'PGK', name: t('Papua New Guinean kina') },
        { id: 'PHP', name: t('Philippine peso') },
        { id: 'PKR', name: t('Pakistani rupee') },
        { id: 'PLN', name: t('Polish zloty') },
        { id: 'PLZ', name: t('Polish zloty (PLZ)') },
        { id: 'PTE', name: t('Portuguese escudo') },
        { id: 'PYG', name: t('Paraguayan guarani') },
        { id: 'QAR', name: t('Qatari rial') },
        { id: 'RHD', name: t('Rhodesian dollar') },
        { id: 'ROL', name: t('Romanian leu (1952–2006)') },
        { id: 'RON', name: t('Romanian leu') },
        { id: 'RSD', name: t('Serbian dinar') },
        { id: 'RUB', name: t('Russian ruble') },
        { id: 'RUR', name: t('Russian ruble (1991–1998)') },
        { id: 'RWF', name: t('Rwandan franc') },
        { id: 'SAR', name: t('Saudi riyal') },
        { id: 'SBD', name: t('Solomon Islands dollar') },
        { id: 'SCR', name: t('Seychellois rupee') },
        { id: 'SDD', name: t('Sudanese dinar (1992–2007)') },
        { id: 'SDG', name: t('Sudanese pound') },
        { id: 'SDP', name: t('Sudanese pound (1957–1998)') },
        { id: 'SEK', name: t('Swedish krona') },
        { id: 'SGD', name: t('Singapore dollar') },
        { id: 'SHP', name: t('St. Helena pound') },
        { id: 'SIT', name: t('Slovenian tolar') },
        { id: 'SKK', name: t('Slovak koruna') },
        { id: 'SLL', name: t('Sierra Leonean leone') },
        { id: 'SOS', name: t('Somali shilling') },
        { id: 'SRD', name: t('Surinamese dollar') },
        { id: 'SRG', name: t('Surinamese guilder') },
        { id: 'SSP', name: t('South Sudanese pound') },
        { id: 'STD', name: t('São Tomé \u0026 Príncipe dobra') },
        { id: 'SUR', name: t('Soviet rouble') },
        { id: 'SVC', name: t('Salvadoran colón') },
        { id: 'SYP', name: t('Syrian pound') },
        { id: 'SZL', name: t('Swazi lilangeni') },
        { id: 'THB', name: t('Thai baht') },
        { id: 'TJR', name: t('Tajikistani ruble') },
        { id: 'TJS', name: t('Tajikistani somoni') },
        { id: 'TMM', name: t('Turkmenistani manat (1993–2009)') },
        { id: 'TMT', name: t('Turkmenistani manat') },
        { id: 'TND', name: t('Tunisian dinar') },
        { id: 'TOP', name: t('Tongan paʻanga') },
        { id: 'TPE', name: t('Timorese escudo') },
        { id: 'TRL', name: t('Turkish lira (1922–2005)') },
        { id: 'TRY', name: t('Turkish lira') },
        { id: 'TTD', name: t('Trinidad \u0026 Tobago dollar') },
        { id: 'TWD', name: t('New Taiwan dollar') },
        { id: 'TZS', name: t('Tanzanian shilling') },
        { id: 'UAH', name: t('Ukrainian hryvnia') },
        { id: 'UAK', name: t('Ukrainian karbovanets') },
        { id: 'UGS', name: t('Ugandan shilling (1966–1987)') },
        { id: 'UGX', name: t('Ugandan shilling') },
        { id: 'USD', name: t('US dollar') },
        { id: 'USN', name: t('US dollar (next day)') },
        { id: 'USS', name: t('US dollar (same day)') },
        { id: 'UYI', name: t('Uruguayan peso (indexed units)') },
        { id: 'UYP', name: t('Uruguayan peso (1975–1993)') },
        { id: 'UYU', name: t('Uruguayan peso') },
        { id: 'UZS', name: t('Uzbekistani som') },
        { id: 'VEB', name: t('Venezuelan bolívar (1871–2008)') },
        { id: 'VEF', name: t('Venezuelan bolívar') },
        { id: 'VND', name: t('Vietnamese dong') },
        { id: 'VNN', name: t('Vietnamese dong (1978–1985)') },
        { id: 'VUV', name: t('Vanuatu vatu') },
        { id: 'WST', name: t('Samoan tala') },
        { id: 'XAF', name: t('Central African CFA franc') },
        { id: 'XAG', name: t('troy ounce of silver') },
        { id: 'XAU', name: t('troy ounce of gold') },
        { id: 'XBA', name: t('European composite unit') },
        { id: 'XBB', name: t('European monetary unit') },
        { id: 'XBC', name: t('European unit of account (XBC)') },
        { id: 'XBD', name: t('European unit of account (XBD)') },
        { id: 'XCD', name: t('East Caribbean dollar') },
        { id: 'XDR', name: t('special drawing rights') },
        { id: 'XEU', name: t('European currency unit') },
        { id: 'XFO', name: t('French gold franc') },
        { id: 'XFU', name: t('French UIC-franc') },
        { id: 'XOF', name: t('West African CFA franc') },
        { id: 'XPD', name: t('troy ounce of palladium') },
        { id: 'XPF', name: t('CFP franc') },
        { id: 'XPT', name: t('troy ounce of platinum') },
        { id: 'XRE', name: t('RINET Funds unit') },
        { id: 'XSU', name: t('Sucre') },
        { id: 'XTS', name: t('Testing Currency unit') },
        { id: 'XUA', name: t('ADB unit of account') },
        { id: 'XXX', name: t('(unknown unit of currency)') },
        { id: 'YDD', name: t('Yemeni dinar') },
        { id: 'YER', name: t('Yemeni rial') },
        { id: 'YUD', name: t('Yugoslavian hard dinar (1966–1990)') },
        { id: 'YUM', name: t('Yugoslavian new dinar (1994–2002)') },
        { id: 'YUN', name: t('Yugoslavian convertible dinar (1990–1992)') },
        { id: 'YUR', name: t('Yugoslavian reformed dinar (1992–1993)') },
        { id: 'ZAL', name: t('South African rand (financial)') },
        { id: 'ZAR', name: t('South African rand') },
        { id: 'ZMK', name: t('Zambian kwacha (1968–2012)') },
        { id: 'ZMW', name: t('Zambian kwacha') },
        { id: 'ZRN', name: t('Zairean new zaire (1993–1998)') },
        { id: 'ZRZ', name: t('Zairean zaire (1971–1993)') },
        { id: 'ZWD', name: t('Zimbabwean dollar (1980–2008)') },
        { id: 'ZWL', name: t('Zimbabwean dollar (2009)') },
        { id: 'ZWR', name: t('Zimbabwean dollar (2008)') },
    ];

    const users = useMemo(() => data?.accountListUsers?.nodes?.map(({ user }) => user) || [], [
        data?.accountListUsers?.nodes,
    ]);

    const [createContact] = useMutation<CreateContactMutation>(CREATE_CONTACT_MUTATION);
    const [updateContact] = useMutation<UpdateContactMutation>(UPDATE_CONTACT_MUTATION);
    const onSubmit = async (attributes: ContactCreateInput): Promise<void> => {
        try {
            if (contactId) {
                await updateContact({
                    variables: { accountListId: state.accountListId, attributes: { ...attributes, id: contactId } },
                });
            } else {
                await createContact({
                    variables: { accountListId: state.accountListId, attributes },
                });
            }
            enqueueSnackbar(t('Contact saved successfully'), { variant: 'success' });
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' });
        }
    };

    const initialValues: ContactCreateInput = data
        ? {
              ...pick(
                  [
                      'name',
                      'sendNewsletter',
                      'status',
                      'tagList',
                      'pledgeAmount',
                      'pledgeCurrency',
                      'pledgeFrequency',
                      'pledgeReceived',
                      'pledgeStartDate',
                      'likelyToGive',
                      'envelopeGreeting',
                      'greeting',
                      'noAppeals',
                      'preferredContactMethod',
                      'locale',
                      'timezone',
                      'churchName',
                      'nextAsk',
                      'website',
                  ],
                  data.contact,
              ),
              userId: data.contact.user?.id,
          }
        : null;

    return (
        <>
            <Box mb={2}>
                <ContactItem contact={data?.contact} />
            </Box>
            {!loading && data && (
                <Formik initialValues={initialValues} validationSchema={contactSchema} onSubmit={onSubmit}>
                    {({
                        values: {
                            name,
                            sendNewsletter,
                            status,
                            tagList,
                            pledgeAmount,
                            pledgeCurrency,
                            pledgeFrequency,
                            pledgeReceived,
                            pledgeStartDate,
                            likelyToGive,
                            envelopeGreeting,
                            greeting,
                            noAppeals,
                            preferredContactMethod,
                            locale,
                            timezone,
                            churchName,
                            nextAsk,
                            website,
                            userId,
                        },
                        setFieldValue,
                        handleChange,
                        handleSubmit,
                        errors,
                    }): ReactElement => (
                        <form onSubmit={handleSubmit} noValidate>
                            <Autosave />
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{t('Details')}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container direction="column" spacing={2}>
                                        <Grid item>
                                            <TextField
                                                label={t('Name')}
                                                value={name}
                                                fullWidth
                                                inputProps={{ 'aria-label': 'Name' }}
                                                onChange={handleChange('name')}
                                                required
                                            />
                                        </Grid>
                                        <Grid item>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel id="sendNewsletter">{t('Newsletter')}</InputLabel>
                                                <Select
                                                    labelId="sendNewsletter"
                                                    value={sendNewsletter}
                                                    onChange={handleChange('sendNewsletter')}
                                                >
                                                    <MenuItem value={null}>{t('None')}</MenuItem>
                                                    {Object.keys(SendNewsletterEnum).map((val) => (
                                                        <MenuItem key={val} value={val}>
                                                            {t(val) /* manually added to translation file */}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel id="status">{t('Status')}</InputLabel>
                                                <Select
                                                    labelId="status"
                                                    value={status}
                                                    onChange={handleChange('status')}
                                                >
                                                    <MenuItem value={null}>{t('None')}</MenuItem>
                                                    {Object.keys(StatusEnum).map((val) => (
                                                        <MenuItem key={val} value={val}>
                                                            {t(val) /* manually added to translation file */}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <Autocomplete
                                                multiple
                                                freeSolo
                                                renderTags={(value, getTagProps): ReactElement[] =>
                                                    value.map((option, index) => (
                                                        <Chip
                                                            color="primary"
                                                            size="small"
                                                            key={index}
                                                            label={option}
                                                            {...getTagProps({ index })}
                                                        />
                                                    ))
                                                }
                                                renderInput={(params): ReactElement => (
                                                    <TextField {...params} label={t('Tags')} />
                                                )}
                                                onChange={(_, tagList): void => setFieldValue('tagList', tagList)}
                                                value={tagList}
                                                options={data.accountList.contactTagList}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <Autocomplete
                                                loading={loading}
                                                options={users}
                                                value={userId}
                                                onChange={(_, option): void =>
                                                    setFieldValue(
                                                        'userId',
                                                        typeof option == 'string' ? option : option?.id,
                                                    )
                                                }
                                                getOptionLabel={(option): string => {
                                                    if (typeof option == 'string') {
                                                        const user = find({ id: option }, users);
                                                        return `${user.firstName} ${user.lastName}`;
                                                    } else {
                                                        return `${option.firstName} ${option.lastName}`;
                                                    }
                                                }}
                                                getOptionSelected={(option, value) =>
                                                    option.id === ((value as unknown) as string)
                                                }
                                                renderInput={(params): ReactElement => (
                                                    <TextField
                                                        {...params}
                                                        label={t('Assignee')}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <>
                                                                    {loading && (
                                                                        <CircularProgress color="primary" size={20} />
                                                                    )}
                                                                    {params.InputProps.endAdornment}
                                                                </>
                                                            ),
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{t('Commitment')}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container direction="column" spacing={2}>
                                        <Grid item>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel id="likelyToGive">{t('Likely To Give')}</InputLabel>
                                                <Select
                                                    labelId="likelyToGive"
                                                    value={likelyToGive}
                                                    onChange={handleChange('likelyToGive')}
                                                >
                                                    <MenuItem value={null}>{t('None')}</MenuItem>
                                                    {Object.keys(LikelyToGiveEnum).map((val) => (
                                                        <MenuItem key={val} value={val}>
                                                            {t(val) /* manually added to translation file */}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label={t('Commitment Amount')}
                                                value={pledgeAmount}
                                                type="number"
                                                fullWidth
                                                inputProps={{ 'aria-label': 'Commitment Amount' }}
                                                onChange={handleChange('pledgeAmount')}
                                                required={status == StatusEnum.PARTNER_FINANCIAL}
                                                error={Boolean(errors.pledgeAmount)}
                                                helperText={errors.pledgeAmount && t('Field is required')}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <FormControl
                                                className={classes.formControl}
                                                required={status == StatusEnum.PARTNER_FINANCIAL}
                                                error={Boolean(errors.pledgeFrequency)}
                                            >
                                                <InputLabel id="pledgeFrequency">
                                                    {t('Commitment Frequency')}
                                                </InputLabel>
                                                <Select
                                                    labelId="pledgeFrequency"
                                                    value={pledgeFrequency}
                                                    onChange={handleChange('pledgeFrequency')}
                                                >
                                                    <MenuItem value={null}>{t('None')}</MenuItem>
                                                    {Object.keys(PledgeFrequencyEnum).map((val) => (
                                                        <MenuItem key={val} value={val}>
                                                            {t(val) /* manually added to translation file */}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.pledgeFrequency && (
                                                    <FormHelperText>{t('Field is required')}</FormHelperText>
                                                )}
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <Autocomplete
                                                options={currencies}
                                                value={pledgeCurrency}
                                                onChange={(_, option): void =>
                                                    setFieldValue(
                                                        'pledgeCurrency',
                                                        typeof option == 'string' ? option : option?.id,
                                                    )
                                                }
                                                getOptionLabel={(option) =>
                                                    typeof option == 'string'
                                                        ? find({ id: option }, currencies)?.name
                                                        : option?.name
                                                }
                                                getOptionSelected={(option, value) =>
                                                    option.id === ((value as unknown) as string)
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        fullWidth
                                                        label={t('Commitment Currency')}
                                                        required={status == StatusEnum.PARTNER_FINANCIAL}
                                                        error={Boolean(errors.pledgeCurrency)}
                                                        helperText={errors.pledgeCurrency && t('Field is required')}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <DatePicker
                                                clearable
                                                fullWidth
                                                labelFunc={dateFormat}
                                                autoOk
                                                label={t('Commitment Start Date')}
                                                value={pledgeStartDate}
                                                okLabel={t('OK')}
                                                todayLabel={t('Today')}
                                                cancelLabel={t('Cancel')}
                                                clearLabel={t('Clear')}
                                                onChange={(date): void => setFieldValue('pledgeStartDate', date)}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={pledgeReceived}
                                                        onChange={handleChange('pledgeReceived')}
                                                    />
                                                }
                                                label={t('Commitment Receieved')}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <DatePicker
                                                clearable
                                                fullWidth
                                                labelFunc={dateFormat}
                                                autoOk
                                                label={t('Next Increase Ask')}
                                                value={nextAsk}
                                                okLabel={t('OK')}
                                                todayLabel={t('Today')}
                                                cancelLabel={t('Cancel')}
                                                clearLabel={t('Clear')}
                                                onChange={(date): void => setFieldValue('nextAsk', date)}
                                            />
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography>{t('Communication')}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Grid container direction="column" spacing={2}>
                                        <Grid item>
                                            <TextField
                                                label={t('Envelope Name Line')}
                                                value={envelopeGreeting}
                                                multiline
                                                fullWidth
                                                inputProps={{ 'aria-label': 'Envelope Name Line' }}
                                                onChange={handleChange('envelopeGreeting')}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label={t('Greeting')}
                                                value={greeting}
                                                multiline
                                                fullWidth
                                                inputProps={{ 'aria-label': 'Greeting' }}
                                                onChange={handleChange('greeting')}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <FormControlLabel
                                                control={
                                                    <Switch checked={noAppeals} onChange={handleChange('noAppeals')} />
                                                }
                                                label={t('Send Appeals')}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel id="preferredContactMethod">
                                                    {t('Preferred Contact Method')}
                                                </InputLabel>
                                                <Select
                                                    labelId="preferredContactMethod"
                                                    value={preferredContactMethod}
                                                    onChange={handleChange('preferredContactMethod')}
                                                >
                                                    <MenuItem value={null}>{t('None')}</MenuItem>
                                                    {Object.keys(PreferredContactMethodEnum).map((val) => (
                                                        <MenuItem key={val} value={val}>
                                                            {t(val) /* manually added to translation file */}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <Autocomplete
                                                options={locales}
                                                value={locale}
                                                onChange={(_, option): void =>
                                                    setFieldValue(
                                                        'locale',
                                                        typeof option == 'string' ? option : option?.id,
                                                    )
                                                }
                                                getOptionLabel={(option) =>
                                                    typeof option == 'string'
                                                        ? find({ id: option }, locales)?.name
                                                        : option?.name
                                                }
                                                getOptionSelected={(option, value) =>
                                                    option.id === ((value as unknown) as string)
                                                }
                                                renderInput={(params) => (
                                                    <TextField {...params} fullWidth label={t('Language')} />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <Autocomplete
                                                options={timezones}
                                                value={timezone}
                                                onChange={(_, option): void => {
                                                    setFieldValue(
                                                        'locale',
                                                        typeof option == 'string' ? option : option?.id,
                                                    );
                                                }}
                                                getOptionLabel={(option) =>
                                                    typeof option == 'string'
                                                        ? find({ id: option }, timezones)?.name
                                                        : option?.name
                                                }
                                                getOptionSelected={(option, value) =>
                                                    option.id === ((value as unknown) as string)
                                                }
                                                renderInput={(params) => (
                                                    <TextField {...params} fullWidth label={t('Timezone')} />
                                                )}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label={t('Church Name')}
                                                value={churchName}
                                                multiline
                                                fullWidth
                                                inputProps={{ 'aria-label': 'Church Name' }}
                                                onChange={handleChange('churchName')}
                                            />
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label={t('Website')}
                                                value={website}
                                                multiline
                                                fullWidth
                                                inputProps={{ 'aria-label': 'Website' }}
                                                onChange={handleChange('website')}
                                            />
                                        </Grid>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </form>
                    )}
                </Formik>
            )}
        </>
    );
};

export default ContactDetails;
