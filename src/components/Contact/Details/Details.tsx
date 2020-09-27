import React, { ReactElement, useEffect } from 'react';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Chip,
    FormControl,
    FormControlLabel,
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
import { pick } from 'lodash/fp';
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
    pledgeAmount: yup.number().nullable(),
    pledgeCurrency: yup.string().nullable(),
    pledgeFrequency: yup.mixed<PledgeFrequencyEnum>().nullable(),
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
        { key: 'American Samoa', val: t('(GMT-11:00) American Samoa') },
        { key: 'International Date Line West', val: t('(GMT-11:00) International Date Line West') },
        { key: 'Midway Island', val: t('(GMT-11:00) Midway Island') },
        { key: 'Samoa', val: t('(GMT-11:00) Samoa') },
        { key: 'Hawaii', val: t('(GMT-10:00) Hawaii') },
        { key: 'Alaska', val: t('(GMT-09:00) Alaska') },
        { key: 'Pacific Time (US & Canada)', val: t('(GMT-08:00) Pacific Time (US & Canada)') },
        { key: 'Tijuana', val: t('(GMT-08:00) Tijuana') },
        { key: 'Arizona', val: t('(GMT-07:00) Arizona') },
        { key: 'Chihuahua', val: t('(GMT-07:00) Chihuahua') },
        { key: 'Mazatlan', val: t('(GMT-07:00) Mazatlan') },
        { key: 'Mountain Time (US & Canada)', val: t('(GMT-07:00) Mountain Time (US & Canada)') },
        { key: 'Central America', val: t('(GMT-06:00) Central America') },
        { key: 'Central Time (US & Canada)', val: t('(GMT-06:00) Central Time (US & Canada)') },
        { key: 'Guadalajara', val: t('(GMT-06:00) Guadalajara') },
        { key: 'Mexico City', val: t('(GMT-06:00) Mexico City') },
        { key: 'Monterrey', val: t('(GMT-06:00) Monterrey') },
        { key: 'Saskatchewan', val: t('(GMT-06:00) Saskatchewan') },
        { key: 'Bogota', val: t('(GMT-05:00) Bogota') },
        { key: 'Eastern Time (US & Canada)', val: t('(GMT-05:00) Eastern Time (US & Canada)') },
        { key: 'Indiana (East)', val: t('(GMT-05:00) Indiana (East)') },
        { key: 'Lima', val: t('(GMT-05:00) Lima') },
        { key: 'Quito', val: t('(GMT-05:00) Quito') },
        { key: 'Atlantic Time (Canada)', val: t('(GMT-04:00) Atlantic Time (Canada)') },
        { key: 'Caracas', val: t('(GMT-04:00) Caracas') },
        { key: 'Georgetown', val: t('(GMT-04:00) Georgetown') },
        { key: 'La Paz', val: t('(GMT-04:00) La Paz') },
        { key: 'Santiago', val: t('(GMT-04:00) Santiago') },
        { key: 'Newfoundland', val: t('(GMT-03:30) Newfoundland') },
        { key: 'Brasilia', val: t('(GMT-03:00) Brasilia') },
        { key: 'Buenos Aires', val: t('(GMT-03:00) Buenos Aires') },
        { key: 'Greenland', val: t('(GMT-03:00) Greenland') },
        { key: 'Montevideo', val: t('(GMT-03:00) Montevideo') },
        { key: 'Mid-Atlantic', val: t('(GMT-02:00) Mid-Atlantic') },
        { key: 'Azores', val: t('(GMT-01:00) Azores') },
        { key: 'Cape Verde Is.', val: t('(GMT-01:00) Cape Verde Is.') },
        { key: 'Casablanca', val: t('(GMT+00:00) Casablanca') },
        { key: 'Dublin', val: t('(GMT+00:00) Dublin') },
        { key: 'Edinburgh', val: t('(GMT+00:00) Edinburgh') },
        { key: 'Lisbon', val: t('(GMT+00:00) Lisbon') },
        { key: 'London', val: t('(GMT+00:00) London') },
        { key: 'Monrovia', val: t('(GMT+00:00) Monrovia') },
        { key: 'UTC', val: t('(GMT+00:00) UTC') },
        { key: 'Amsterdam', val: t('(GMT+01:00) Amsterdam') },
        { key: 'Belgrade', val: t('(GMT+01:00) Belgrade') },
        { key: 'Berlin', val: t('(GMT+01:00) Berlin') },
        { key: 'Bern', val: t('(GMT+01:00) Bern') },
        { key: 'Bratislava', val: t('(GMT+01:00) Bratislava') },
        { key: 'Brussels', val: t('(GMT+01:00) Brussels') },
        { key: 'Budapest', val: t('(GMT+01:00) Budapest') },
        { key: 'Copenhagen', val: t('(GMT+01:00) Copenhagen') },
        { key: 'Ljubljana', val: t('(GMT+01:00) Ljubljana') },
        { key: 'Madrid', val: t('(GMT+01:00) Madrid') },
        { key: 'Paris', val: t('(GMT+01:00) Paris') },
        { key: 'Prague', val: t('(GMT+01:00) Prague') },
        { key: 'Rome', val: t('(GMT+01:00) Rome') },
        { key: 'Sarajevo', val: t('(GMT+01:00) Sarajevo') },
        { key: 'Skopje', val: t('(GMT+01:00) Skopje') },
        { key: 'Stockholm', val: t('(GMT+01:00) Stockholm') },
        { key: 'Vienna', val: t('(GMT+01:00) Vienna') },
        { key: 'Warsaw', val: t('(GMT+01:00) Warsaw') },
        { key: 'West Central Africa', val: t('(GMT+01:00) West Central Africa') },
        { key: 'Zagreb', val: t('(GMT+01:00) Zagreb') },
        { key: 'Athens', val: t('(GMT+02:00) Athens') },
        { key: 'Bucharest', val: t('(GMT+02:00) Bucharest') },
        { key: 'Cairo', val: t('(GMT+02:00) Cairo') },
        { key: 'Harare', val: t('(GMT+02:00) Harare') },
        { key: 'Helsinki', val: t('(GMT+02:00) Helsinki') },
        { key: 'Istanbul', val: t('(GMT+02:00) Istanbul') },
        { key: 'Jerusalem', val: t('(GMT+02:00) Jerusalem') },
        { key: 'Kaliningrad', val: t('(GMT+02:00) Kaliningrad') },
        { key: 'Kyiv', val: t('(GMT+02:00) Kyiv') },
        { key: 'Pretoria', val: t('(GMT+02:00) Pretoria') },
        { key: 'Riga', val: t('(GMT+02:00) Riga') },
        { key: 'Sofia', val: t('(GMT+02:00) Sofia') },
        { key: 'Tallinn', val: t('(GMT+02:00) Tallinn') },
        { key: 'Vilnius', val: t('(GMT+02:00) Vilnius') },
        { key: 'Baghdad', val: t('(GMT+03:00) Baghdad') },
        { key: 'Kuwait', val: t('(GMT+03:00) Kuwait') },
        { key: 'Minsk', val: t('(GMT+03:00) Minsk') },
        { key: 'Moscow', val: t('(GMT+03:00) Moscow') },
        { key: 'Nairobi', val: t('(GMT+03:00) Nairobi') },
        { key: 'Riyadh', val: t('(GMT+03:00) Riyadh') },
        { key: 'St. Petersburg', val: t('(GMT+03:00) St. Petersburg') },
        { key: 'Volgograd', val: t('(GMT+03:00) Volgograd') },
        { key: 'Tehran', val: t('(GMT+03:30) Tehran') },
        { key: 'Abu Dhabi', val: t('(GMT+04:00) Abu Dhabi') },
        { key: 'Baku', val: t('(GMT+04:00) Baku') },
        { key: 'Muscat', val: t('(GMT+04:00) Muscat') },
        { key: 'Samara', val: t('(GMT+04:00) Samara') },
        { key: 'Tbilisi', val: t('(GMT+04:00) Tbilisi') },
        { key: 'Yerevan', val: t('(GMT+04:00) Yerevan') },
        { key: 'Kabul', val: t('(GMT+04:30) Kabul') },
        { key: 'Ekaterinburg', val: t('(GMT+05:00) Ekaterinburg') },
        { key: 'Islamabad', val: t('(GMT+05:00) Islamabad') },
        { key: 'Karachi', val: t('(GMT+05:00) Karachi') },
        { key: 'Tashkent', val: t('(GMT+05:00) Tashkent') },
        { key: 'Chennai', val: t('(GMT+05:30) Chennai') },
        { key: 'Kolkata', val: t('(GMT+05:30) Kolkata') },
        { key: 'Mumbai', val: t('(GMT+05:30) Mumbai') },
        { key: 'New Delhi', val: t('(GMT+05:30) New Delhi') },
        { key: 'Sri Jayawardenepura', val: t('(GMT+05:30) Sri Jayawardenepura') },
        { key: 'Kathmandu', val: t('(GMT+05:45) Kathmandu') },
        { key: 'Almaty', val: t('(GMT+06:00) Almaty') },
        { key: 'Astana', val: t('(GMT+06:00) Astana') },
        { key: 'Dhaka', val: t('(GMT+06:00) Dhaka') },
        { key: 'Urumqi', val: t('(GMT+06:00) Urumqi') },
        { key: 'Rangoon', val: t('(GMT+06:30) Rangoon') },
        { key: 'Bangkok', val: t('(GMT+07:00) Bangkok') },
        { key: 'Hanoi', val: t('(GMT+07:00) Hanoi') },
        { key: 'Jakarta', val: t('(GMT+07:00) Jakarta') },
        { key: 'Krasnoyarsk', val: t('(GMT+07:00) Krasnoyarsk') },
        { key: 'Novosibirsk', val: t('(GMT+07:00) Novosibirsk') },
        { key: 'Beijing', val: t('(GMT+08:00) Beijing') },
        { key: 'Chongqing', val: t('(GMT+08:00) Chongqing') },
        { key: 'Hong Kong', val: t('(GMT+08:00) Hong Kong') },
        { key: 'Irkutsk', val: t('(GMT+08:00) Irkutsk') },
        { key: 'Kuala Lumpur', val: t('(GMT+08:00) Kuala Lumpur') },
        { key: 'Perth', val: t('(GMT+08:00) Perth') },
        { key: 'Singapore', val: t('(GMT+08:00) Singapore') },
        { key: 'Taipei', val: t('(GMT+08:00) Taipei') },
        { key: 'Ulaanbaatar', val: t('(GMT+08:00) Ulaanbaatar') },
        { key: 'Osaka', val: t('(GMT+09:00) Osaka') },
        { key: 'Sapporo', val: t('(GMT+09:00) Sapporo') },
        { key: 'Seoul', val: t('(GMT+09:00) Seoul') },
        { key: 'Tokyo', val: t('(GMT+09:00) Tokyo') },
        { key: 'Yakutsk', val: t('(GMT+09:00) Yakutsk') },
        { key: 'Adelaide', val: t('(GMT+09:30) Adelaide') },
        { key: 'Darwin', val: t('(GMT+09:30) Darwin') },
        { key: 'Brisbane', val: t('(GMT+10:00) Brisbane') },
        { key: 'Canberra', val: t('(GMT+10:00) Canberra') },
        { key: 'Guam', val: t('(GMT+10:00) Guam') },
        { key: 'Hobart', val: t('(GMT+10:00) Hobart') },
        { key: 'Melbourne', val: t('(GMT+10:00) Melbourne') },
        { key: 'Port Moresby', val: t('(GMT+10:00) Port Moresby') },
        { key: 'Sydney', val: t('(GMT+10:00) Sydney') },
        { key: 'Vladivostok', val: t('(GMT+10:00) Vladivostok') },
        { key: 'Magadan', val: t('(GMT+11:00) Magadan') },
        { key: 'New Caledonia', val: t('(GMT+11:00) New Caledonia') },
        { key: 'Solomon Is.', val: t('(GMT+11:00) Solomon Is.') },
        { key: 'Srednekolymsk', val: t('(GMT+11:00) Srednekolymsk') },
        { key: 'Auckland', val: t('(GMT+12:00) Auckland') },
        { key: 'Fiji', val: t('(GMT+12:00) Fiji') },
        { key: 'Kamchatka', val: t('(GMT+12:00) Kamchatka') },
        { key: 'Marshall Is.', val: t('(GMT+12:00) Marshall Is.') },
        { key: 'Wellington', val: t('(GMT+12:00) Wellington') },
        { key: 'Chatham Is.', val: t('(GMT+12:45) Chatham Is.') },
        { key: "Nuku'alofa", val: t("(GMT+13:00) Nuku'alofa") },
        { key: 'Tokelau Is.', val: t('(GMT+13:00) Tokelau Is.') },
    ];

    const locales = [
        { key: 'aa', val: t('Afar') },
        { key: 'ab', val: t('Abkhazian') },
        { key: 'ace', val: t('Achinese') },
        { key: 'ach', val: t('Acoli') },
        { key: 'ada', val: t('Adangme') },
        { key: 'ady', val: t('Adyghe') },
        { key: 'ae', val: t('Avestan') },
        { key: 'aeb', val: t('Tunisian Arabic') },
        { key: 'af', val: t('Afrikaans') },
        { key: 'afh', val: t('Afrihili') },
        { key: 'agq', val: t('Aghem') },
        { key: 'ain', val: t('Ainu') },
        { key: 'ak', val: t('Akan') },
        { key: 'akk', val: t('Akkadian') },
        { key: 'akz', val: t('Alabama') },
        { key: 'ale', val: t('Aleut') },
        { key: 'aln', val: t('Gheg Albanian') },
        { key: 'alt', val: t('Southern Altai') },
        { key: 'am', val: t('Amharic') },
        { key: 'an', val: t('Aragonese') },
        { key: 'ang', val: t('Old English') },
        { key: 'anp', val: t('Angika') },
        { key: 'ar', val: t('Arabic') },
        { key: 'ar-001', val: t('Modern Standard Arabic') },
        { key: 'arc', val: t('Aramaic') },
        { key: 'arn', val: t('Mapuche') },
        { key: 'aro', val: t('Araona') },
        { key: 'arp', val: t('Arapaho') },
        { key: 'arq', val: t('Algerian Arabic') },
        { key: 'arw', val: t('Arawak') },
        { key: 'ary', val: t('Moroccan Arabic') },
        { key: 'arz', val: t('Egyptian Arabic') },
        { key: 'as', val: t('Assamese') },
        { key: 'asa', val: t('Asu') },
        { key: 'ase', val: t('American Sign Language') },
        { key: 'ast', val: t('Asturian') },
        { key: 'av', val: t('Avaric') },
        { key: 'avk', val: t('Kotava') },
        { key: 'awa', val: t('Awadhi') },
        { key: 'ay', val: t('Aymara') },
        { key: 'az', val: t('Azeri') },
        { key: 'ba', val: t('Bashkir') },
        { key: 'bal', val: t('Baluchi') },
        { key: 'ban', val: t('Balinese') },
        { key: 'bar', val: t('Bavarian') },
        { key: 'bas', val: t('Basaa') },
        { key: 'bax', val: t('Bamun') },
        { key: 'bbc', val: t('Batak Toba') },
        { key: 'bbj', val: t('Ghomala') },
        { key: 'be', val: t('Belarusian') },
        { key: 'bej', val: t('Beja') },
        { key: 'bem', val: t('Bemba') },
        { key: 'bew', val: t('Betawi') },
        { key: 'bez', val: t('Bena') },
        { key: 'bfd', val: t('Bafut') },
        { key: 'bfq', val: t('Badaga') },
        { key: 'bg', val: t('Bulgarian') },
        { key: 'bgn', val: t('Western Balochi') },
        { key: 'bho', val: t('Bhojpuri') },
        { key: 'bi', val: t('Bislama') },
        { key: 'bik', val: t('Bikol') },
        { key: 'bin', val: t('Bini') },
        { key: 'bjn', val: t('Banjar') },
        { key: 'bkm', val: t('Kom') },
        { key: 'bla', val: t('Siksika') },
        { key: 'bm', val: t('Bambara') },
        { key: 'bn', val: t('Bengali') },
        { key: 'bo', val: t('Tibetan') },
        { key: 'bpy', val: t('Bishnupriya') },
        { key: 'bqi', val: t('Bakhtiari') },
        { key: 'br', val: t('Breton') },
        { key: 'bra', val: t('Braj') },
        { key: 'brh', val: t('Brahui') },
        { key: 'brx', val: t('Bodo') },
        { key: 'bs', val: t('Bosnian') },
        { key: 'bss', val: t('Akoose') },
        { key: 'bua', val: t('Buriat') },
        { key: 'bug', val: t('Buginese') },
        { key: 'bum', val: t('Bulu') },
        { key: 'byn', val: t('Blin') },
        { key: 'byv', val: t('Medumba') },
        { key: 'ca', val: t('Catalan') },
        { key: 'cad', val: t('Caddo') },
        { key: 'car', val: t('Carib') },
        { key: 'cay', val: t('Cayuga') },
        { key: 'cch', val: t('Atsam') },
        { key: 'ce', val: t('Chechen') },
        { key: 'ceb', val: t('Cebuano') },
        { key: 'cgg', val: t('Chiga') },
        { key: 'ch', val: t('Chamorro') },
        { key: 'chb', val: t('Chibcha') },
        { key: 'chg', val: t('Chagatai') },
        { key: 'chk', val: t('Chuukese') },
        { key: 'chm', val: t('Mari') },
        { key: 'chn', val: t('Chinook Jargon') },
        { key: 'cho', val: t('Choctaw') },
        { key: 'chp', val: t('Chipewyan') },
        { key: 'chr', val: t('Cherokee') },
        { key: 'chy', val: t('Cheyenne') },
        { key: 'ckb', val: t('Central Kurdish') },
        { key: 'co', val: t('Corsican') },
        { key: 'cop', val: t('Coptic') },
        { key: 'cps', val: t('Capiznon') },
        { key: 'cr', val: t('Cree') },
        { key: 'crh', val: t('Crimean Turkish') },
        { key: 'cs', val: t('Czech') },
        { key: 'csb', val: t('Kashubian') },
        { key: 'cu', val: t('Church Slavic') },
        { key: 'cv', val: t('Chuvash') },
        { key: 'cy', val: t('Welsh') },
        { key: 'da', val: t('Danish') },
        { key: 'dak', val: t('Dakota') },
        { key: 'dar', val: t('Dargwa') },
        { key: 'dav', val: t('Taita') },
        { key: 'de', val: t('German') },
        { key: 'de-AT', val: t('Austrian German') },
        { key: 'de-CH', val: t('Swiss High German') },
        { key: 'del', val: t('Delaware') },
        { key: 'den', val: t('Slave') },
        { key: 'dgr', val: t('Dogrib') },
        { key: 'din', val: t('Dinka') },
        { key: 'dje', val: t('Zarma') },
        { key: 'doi', val: t('Dogri') },
        { key: 'dsb', val: t('Lower Sorbian') },
        { key: 'dtp', val: t('Central Dusun') },
        { key: 'dua', val: t('Duala') },
        { key: 'dum', val: t('Middle Dutch') },
        { key: 'dv', val: t('Divehi') },
        { key: 'dyo', val: t('Jola-Fonyi') },
        { key: 'dyu', val: t('Dyula') },
        { key: 'dz', val: t('Dzongkha') },
        { key: 'dzg', val: t('Dazaga') },
        { key: 'ebu', val: t('Embu') },
        { key: 'ee', val: t('Ewe') },
        { key: 'efi', val: t('Efik') },
        { key: 'egl', val: t('Emilian') },
        { key: 'egy', val: t('Ancient Egyptian') },
        { key: 'eka', val: t('Ekajuk') },
        { key: 'el', val: t('Greek') },
        { key: 'elx', val: t('Elamite') },
        { key: 'en', val: t('English') },
        { key: 'en-AU', val: t('Australian English') },
        { key: 'en-CA', val: t('Canadian English') },
        { key: 'en-GB', val: t('UK English') },
        { key: 'en-US', val: t('US English') },
        { key: 'enm', val: t('Middle English') },
        { key: 'eo', val: t('Esperanto') },
        { key: 'es', val: t('Spanish') },
        { key: 'es-419', val: t('Latin American Spanish') },
        { key: 'es-ES', val: t('European Spanish') },
        { key: 'es-MX', val: t('Mexican Spanish') },
        { key: 'esu', val: t('Central Yupik') },
        { key: 'et', val: t('Estonian') },
        { key: 'eu', val: t('Basque') },
        { key: 'ewo', val: t('Ewondo') },
        { key: 'ext', val: t('Extremaduran') },
        { key: 'fa', val: t('Persian') },
        { key: 'fa-AF', val: t('Dari') },
        { key: 'fan', val: t('Fang') },
        { key: 'fat', val: t('Fanti') },
        { key: 'ff', val: t('Fulah') },
        { key: 'fi', val: t('Finnish') },
        { key: 'fil', val: t('Filipino') },
        { key: 'fit', val: t('Tornedalen Finnish') },
        { key: 'fj', val: t('Fijian') },
        { key: 'fo', val: t('Faroese') },
        { key: 'fon', val: t('Fon') },
        { key: 'fr', val: t('French') },
        { key: 'fr-CA', val: t('Canadian French') },
        { key: 'fr-CH', val: t('Swiss French') },
        { key: 'frc', val: t('Cajun French') },
        { key: 'frm', val: t('Middle French') },
        { key: 'fro', val: t('Old French') },
        { key: 'frp', val: t('Arpitan') },
        { key: 'frr', val: t('Northern Frisian') },
        { key: 'frs', val: t('Eastern Frisian') },
        { key: 'fur', val: t('Friulian') },
        { key: 'fy', val: t('Western Frisian') },
        { key: 'ga', val: t('Irish') },
        { key: 'gaa', val: t('Ga') },
        { key: 'gag', val: t('Gagauz') },
        { key: 'gan', val: t('Gan Chinese') },
        { key: 'gay', val: t('Gayo') },
        { key: 'gba', val: t('Gbaya') },
        { key: 'gbz', val: t('Zoroastrian Dari') },
        { key: 'gd', val: t('Scottish Gaelic') },
        { key: 'gez', val: t('Geez') },
        { key: 'gil', val: t('Gilbertese') },
        { key: 'gl', val: t('Galician') },
        { key: 'glk', val: t('Gilaki') },
        { key: 'gmh', val: t('Middle High German') },
        { key: 'gn', val: t('Guarani') },
        { key: 'goh', val: t('Old High German') },
        { key: 'gom', val: t('Goan Konkani') },
        { key: 'gon', val: t('Gondi') },
        { key: 'gor', val: t('Gorontalo') },
        { key: 'got', val: t('Gothic') },
        { key: 'grb', val: t('Grebo') },
        { key: 'grc', val: t('Ancient Greek') },
        { key: 'gsw', val: t('Swiss German') },
        { key: 'gu', val: t('Gujarati') },
        { key: 'guc', val: t('Wayuu') },
        { key: 'gur', val: t('Frafra') },
        { key: 'guz', val: t('Gusii') },
        { key: 'gv', val: t('Manx') },
        { key: 'gwi', val: t('Gwichʼin') },
        { key: 'ha', val: t('Hausa') },
        { key: 'hai', val: t('Haida') },
        { key: 'hak', val: t('Hakka Chinese') },
        { key: 'haw', val: t('Hawaiian') },
        { key: 'he', val: t('Hebrew') },
        { key: 'hi', val: t('Hindi') },
        { key: 'hif', val: t('Fiji Hindi') },
        { key: 'hil', val: t('Hiligaynon') },
        { key: 'hit', val: t('Hittite') },
        { key: 'hmn', val: t('Hmong') },
        { key: 'ho', val: t('Hiri Motu') },
        { key: 'hr', val: t('Croatian') },
        { key: 'hsb', val: t('Upper Sorbian') },
        { key: 'hsn', val: t('Xiang Chinese') },
        { key: 'ht', val: t('Haitian Creole') },
        { key: 'hu', val: t('Hungarian') },
        { key: 'hup', val: t('Hupa') },
        { key: 'hy', val: t('Armenian') },
        { key: 'hz', val: t('Herero') },
        { key: 'ia', val: t('Interlingua') },
        { key: 'iba', val: t('Iban') },
        { key: 'ibb', val: t('Ibibio') },
        { key: 'id', val: t('Indonesian') },
        { key: 'ie', val: t('Interlingue') },
        { key: 'ig', val: t('Igbo') },
        { key: 'ii', val: t('Sichuan Yi') },
        { key: 'ik', val: t('Inupiaq') },
        { key: 'ilo', val: t('Iloko') },
        { key: 'inh', val: t('Ingush') },
        { key: 'io', val: t('Ido') },
        { key: 'is', val: t('Icelandic') },
        { key: 'it', val: t('Italian') },
        { key: 'iu', val: t('Inuktitut') },
        { key: 'izh', val: t('Ingrian') },
        { key: 'ja', val: t('Japanese') },
        { key: 'jam', val: t('Jamaican Creole English') },
        { key: 'jbo', val: t('Lojban') },
        { key: 'jgo', val: t('Ngomba') },
        { key: 'jmc', val: t('Machame') },
        { key: 'jpr', val: t('Judeo-Persian') },
        { key: 'jrb', val: t('Judeo-Arabic') },
        { key: 'jut', val: t('Jutish') },
        { key: 'jv', val: t('Javanese') },
        { key: 'ka', val: t('Georgian') },
        { key: 'kaa', val: t('Kara-Kalpak') },
        { key: 'kab', val: t('Kabyle') },
        { key: 'kac', val: t('Kachin') },
        { key: 'kaj', val: t('Jju') },
        { key: 'kam', val: t('Kamba') },
        { key: 'kaw', val: t('Kawi') },
        { key: 'kbd', val: t('Kabardian') },
        { key: 'kbl', val: t('Kanembu') },
        { key: 'kcg', val: t('Tyap') },
        { key: 'kde', val: t('Makonde') },
        { key: 'kea', val: t('Kabuverdianu') },
        { key: 'ken', val: t('Kenyang') },
        { key: 'kfo', val: t('Koro') },
        { key: 'kg', val: t('Kongo') },
        { key: 'kgp', val: t('Kaingang') },
        { key: 'kha', val: t('Khasi') },
        { key: 'kho', val: t('Khotanese') },
        { key: 'khq', val: t('Koyra Chiini') },
        { key: 'khw', val: t('Khowar') },
        { key: 'ki', val: t('Kikuyu') },
        { key: 'kiu', val: t('Kirmanjki') },
        { key: 'kj', val: t('Kuanyama') },
        { key: 'kk', val: t('Kazakh') },
        { key: 'kkj', val: t('Kako') },
        { key: 'kl', val: t('Kalaallisut') },
        { key: 'kln', val: t('Kalenjin') },
        { key: 'km', val: t('Khmer') },
        { key: 'kmb', val: t('Kimbundu') },
        { key: 'kn', val: t('Kannada') },
        { key: 'ko', val: t('Korean') },
        { key: 'koi', val: t('Komi-Permyak') },
        { key: 'kok', val: t('Konkani') },
        { key: 'kos', val: t('Kosraean') },
        { key: 'kpe', val: t('Kpelle') },
        { key: 'kr', val: t('Kanuri') },
        { key: 'krc', val: t('Karachay-Balkar') },
        { key: 'kri', val: t('Krio') },
        { key: 'krj', val: t('Kinaray-a') },
        { key: 'krl', val: t('Karelian') },
        { key: 'kru', val: t('Kurukh') },
        { key: 'ks', val: t('Kashmiri') },
        { key: 'ksb', val: t('Shambala') },
        { key: 'ksf', val: t('Bafia') },
        { key: 'ksh', val: t('Colognian') },
        { key: 'ku', val: t('Kurdish') },
        { key: 'kum', val: t('Kumyk') },
        { key: 'kut', val: t('Kutenai') },
        { key: 'kv', val: t('Komi') },
        { key: 'kw', val: t('Cornish') },
        { key: 'ky', val: t('Kirghiz') },
        { key: 'la', val: t('Latin') },
        { key: 'lad', val: t('Ladino') },
        { key: 'lag', val: t('Langi') },
        { key: 'lah', val: t('Lahnda') },
        { key: 'lam', val: t('Lamba') },
        { key: 'lb', val: t('Luxembourgish') },
        { key: 'lez', val: t('Lezghian') },
        { key: 'lfn', val: t('Lingua Franca Nova') },
        { key: 'lg', val: t('Ganda') },
        { key: 'li', val: t('Limburgish') },
        { key: 'lij', val: t('Ligurian') },
        { key: 'liv', val: t('Livonian') },
        { key: 'lkt', val: t('Lakota') },
        { key: 'lmo', val: t('Lombard') },
        { key: 'ln', val: t('Lingala') },
        { key: 'lo', val: t('Lao') },
        { key: 'lol', val: t('Mongo') },
        { key: 'loz', val: t('Lozi') },
        { key: 'lrc', val: t('Northern Luri') },
        { key: 'lt', val: t('Lithuanian') },
        { key: 'ltg', val: t('Latgalian') },
        { key: 'lu', val: t('Luba-Katanga') },
        { key: 'lua', val: t('Luba-Lulua') },
        { key: 'lui', val: t('Luiseno') },
        { key: 'lun', val: t('Lunda') },
        { key: 'luo', val: t('Luo') },
        { key: 'lus', val: t('Mizo') },
        { key: 'luy', val: t('Luyia') },
        { key: 'lv', val: t('Latvian') },
        { key: 'lzh', val: t('Literary Chinese') },
        { key: 'lzz', val: t('Laz') },
        { key: 'mad', val: t('Madurese') },
        { key: 'maf', val: t('Mafa') },
        { key: 'mag', val: t('Magahi') },
        { key: 'mai', val: t('Maithili') },
        { key: 'mak', val: t('Makasar') },
        { key: 'man', val: t('Mandingo') },
        { key: 'mas', val: t('Masai') },
        { key: 'mde', val: t('Maba') },
        { key: 'mdf', val: t('Moksha') },
        { key: 'mdr', val: t('Mandar') },
        { key: 'men', val: t('Mende') },
        { key: 'mer', val: t('Meru') },
        { key: 'mfe', val: t('Morisyen') },
        { key: 'mg', val: t('Malagasy') },
        { key: 'mga', val: t('Middle Irish') },
        { key: 'mgh', val: t('Makhuwa-Meetto') },
        { key: 'mgo', val: t('Metaʼ') },
        { key: 'mh', val: t('Marshallese') },
        { key: 'mi', val: t('Maori') },
        { key: 'mic', val: t('Micmac') },
        { key: 'min', val: t('Minangkabau') },
        { key: 'mk', val: t('Macedonian') },
        { key: 'ml', val: t('Malayalam') },
        { key: 'mn', val: t('Mongolian') },
        { key: 'mnc', val: t('Manchu') },
        { key: 'mni', val: t('Manipuri') },
        { key: 'moh', val: t('Mohawk') },
        { key: 'mos', val: t('Mossi') },
        { key: 'mr', val: t('Marathi') },
        { key: 'mrj', val: t('Western Mari') },
        { key: 'ms', val: t('Malay') },
        { key: 'mt', val: t('Maltese') },
        { key: 'mua', val: t('Mundang') },
        { key: 'mul', val: t('Multiple Languages') },
        { key: 'mus', val: t('Creek') },
        { key: 'mwl', val: t('Mirandese') },
        { key: 'mwr', val: t('Marwari') },
        { key: 'mwv', val: t('Mentawai') },
        { key: 'my', val: t('Myanmar Language') },
        { key: 'mye', val: t('Myene') },
        { key: 'myv', val: t('Erzya') },
        { key: 'mzn', val: t('Mazanderani') },
        { key: 'na', val: t('Nauru') },
        { key: 'nan', val: t('Min Nan Chinese') },
        { key: 'nap', val: t('Neapolitan') },
        { key: 'naq', val: t('Nama') },
        { key: 'nb', val: t('Norwegian Bokmål') },
        { key: 'nd', val: t('North Ndebele') },
        { key: 'nds', val: t('Low German') },
        { key: 'nds-NL', val: t('Low Saxon') },
        { key: 'ne', val: t('Nepali') },
        { key: 'new', val: t('Newari') },
        { key: 'ng', val: t('Ndonga') },
        { key: 'nia', val: t('Nias') },
        { key: 'niu', val: t('Niuean') },
        { key: 'njo', val: t('Ao Naga') },
        { key: 'nl', val: t('Dutch') },
        { key: 'nl-BE', val: t('Flemish') },
        { key: 'nmg', val: t('Kwasio') },
        { key: 'nn', val: t('Norwegian Nynorsk') },
        { key: 'nnh', val: t('Ngiemboon') },
        { key: 'no', val: t('Norwegian') },
        { key: 'nog', val: t('Nogai') },
        { key: 'non', val: t('Old Norse') },
        { key: 'nov', val: t('Novial') },
        { key: 'nqo', val: t('N’Ko') },
        { key: 'nr', val: t('South Ndebele') },
        { key: 'nso', val: t('Northern Sotho') },
        { key: 'nus', val: t('Nuer') },
        { key: 'nv', val: t('Navajo') },
        { key: 'nwc', val: t('Classical Newari') },
        { key: 'ny', val: t('Nyanja') },
        { key: 'nym', val: t('Nyamwezi') },
        { key: 'nyn', val: t('Nyankole') },
        { key: 'nyo', val: t('Nyoro') },
        { key: 'nzi', val: t('Nzima') },
        { key: 'oc', val: t('Occitan') },
        { key: 'oj', val: t('Ojibwa') },
        { key: 'om', val: t('Oromo') },
        { key: 'or', val: t('Oriya') },
        { key: 'os', val: t('Ossetic') },
        { key: 'osa', val: t('Osage') },
        { key: 'ota', val: t('Ottoman Turkish') },
        { key: 'pa', val: t('Punjabi') },
        { key: 'pag', val: t('Pangasinan') },
        { key: 'pal', val: t('Pahlavi') },
        { key: 'pam', val: t('Pampanga') },
        { key: 'pap', val: t('Papiamento') },
        { key: 'pau', val: t('Palauan') },
        { key: 'pcd', val: t('Picard') },
        { key: 'pdc', val: t('Pennsylvania German') },
        { key: 'pdt', val: t('Plautdietsch') },
        { key: 'peo', val: t('Old Persian') },
        { key: 'pfl', val: t('Palatine German') },
        { key: 'phn', val: t('Phoenician') },
        { key: 'pi', val: t('Pali') },
        { key: 'pl', val: t('Polish') },
        { key: 'pms', val: t('Piedmontese') },
        { key: 'pnt', val: t('Pontic') },
        { key: 'pon', val: t('Pohnpeian') },
        { key: 'prg', val: t('Prussian') },
        { key: 'pro', val: t('Old Provençal') },
        { key: 'ps', val: t('Pushto') },
        { key: 'pt', val: t('Portuguese') },
        { key: 'pt-BR', val: t('Brazilian Portuguese') },
        { key: 'pt-PT', val: t('European Portuguese') },
        { key: 'qu', val: t('Quechua') },
        { key: 'quc', val: t('Kʼicheʼ') },
        { key: 'qug', val: t('Chimborazo Highland Quichua') },
        { key: 'raj', val: t('Rajasthani') },
        { key: 'rap', val: t('Rapanui') },
        { key: 'rar', val: t('Rarotongan') },
        { key: 'rgn', val: t('Romagnol') },
        { key: 'rif', val: t('Riffian') },
        { key: 'rm', val: t('Romansh') },
        { key: 'rn', val: t('Rundi') },
        { key: 'ro', val: t('Romanian') },
        { key: 'ro-MD', val: t('Moldavian') },
        { key: 'rof', val: t('Rombo') },
        { key: 'rom', val: t('Romany') },
        { key: 'root', val: t('Root') },
        { key: 'rtm', val: t('Rotuman') },
        { key: 'ru', val: t('Russian') },
        { key: 'rue', val: t('Rusyn') },
        { key: 'rug', val: t('Roviana') },
        { key: 'rup', val: t('Aromanian') },
        { key: 'rw', val: t('Kinyarwanda') },
        { key: 'rwk', val: t('Rwa') },
        { key: 'sa', val: t('Sanskrit') },
        { key: 'sad', val: t('Sandawe') },
        { key: 'sah', val: t('Sakha') },
        { key: 'sam', val: t('Samaritan Aramaic') },
        { key: 'saq', val: t('Samburu') },
        { key: 'sas', val: t('Sasak') },
        { key: 'sat', val: t('Santali') },
        { key: 'saz', val: t('Saurashtra') },
        { key: 'sba', val: t('Ngambay') },
        { key: 'sbp', val: t('Sangu') },
        { key: 'sc', val: t('Sardinian') },
        { key: 'scn', val: t('Sicilian') },
        { key: 'sco', val: t('Scots') },
        { key: 'sd', val: t('Sindhi') },
        { key: 'sdc', val: t('Sassarese Sardinian') },
        { key: 'sdh', val: t('Southern Kurdish') },
        { key: 'se', val: t('Northern Sami') },
        { key: 'see', val: t('Seneca') },
        { key: 'seh', val: t('Sena') },
        { key: 'sei', val: t('Seri') },
        { key: 'sel', val: t('Selkup') },
        { key: 'ses', val: t('Koyraboro Senni') },
        { key: 'sg', val: t('Sango') },
        { key: 'sga', val: t('Old Irish') },
        { key: 'sgs', val: t('Samogitian') },
        { key: 'sh', val: t('Serbo-Croatian') },
        { key: 'shi', val: t('Tachelhit') },
        { key: 'shn', val: t('Shan') },
        { key: 'shu', val: t('Chadian Arabic') },
        { key: 'si', val: t('Sinhala') },
        { key: 'sid', val: t('Sidamo') },
        { key: 'sk', val: t('Slovak') },
        { key: 'sl', val: t('Slovenian') },
        { key: 'sli', val: t('Lower Silesian') },
        { key: 'sly', val: t('Selayar') },
        { key: 'sm', val: t('Samoan') },
        { key: 'sma', val: t('Southern Sami') },
        { key: 'smj', val: t('Lule Sami') },
        { key: 'smn', val: t('Inari Sami') },
        { key: 'sms', val: t('Skolt Sami') },
        { key: 'sn', val: t('Shona') },
        { key: 'snk', val: t('Soninke') },
        { key: 'so', val: t('Somali') },
        { key: 'sog', val: t('Sogdien') },
        { key: 'sq', val: t('Albanian') },
        { key: 'sr', val: t('Serbian') },
        { key: 'srn', val: t('Sranan Tongo') },
        { key: 'srr', val: t('Serer') },
        { key: 'ss', val: t('Swati') },
        { key: 'ssy', val: t('Saho') },
        { key: 'st', val: t('Southern Sotho') },
        { key: 'stq', val: t('Saterland Frisian') },
        { key: 'su', val: t('Sundanese') },
        { key: 'suk', val: t('Sukuma') },
        { key: 'sus', val: t('Susu') },
        { key: 'sux', val: t('Sumerian') },
        { key: 'sv', val: t('Swedish') },
        { key: 'sw', val: t('Swahili') },
        { key: 'sw-CD', val: t('Congo Swahili') },
        { key: 'swb', val: t('Comorian') },
        { key: 'syc', val: t('Classical Syriac') },
        { key: 'syr', val: t('Syriac') },
        { key: 'szl', val: t('Silesian') },
        { key: 'ta', val: t('Tamil') },
        { key: 'tcy', val: t('Tulu') },
        { key: 'te', val: t('Telugu') },
        { key: 'tem', val: t('Timne') },
        { key: 'teo', val: t('Teso') },
        { key: 'ter', val: t('Tereno') },
        { key: 'tet', val: t('Tetum') },
        { key: 'tg', val: t('Tajik') },
        { key: 'th', val: t('Thai') },
        { key: 'ti', val: t('Tigrinya') },
        { key: 'tig', val: t('Tigre') },
        { key: 'tiv', val: t('Tiv') },
        { key: 'tk', val: t('Turkmen') },
        { key: 'tkl', val: t('Tokelau') },
        { key: 'tkr', val: t('Tsakhur') },
        { key: 'tl', val: t('Tagalog') },
        { key: 'tlh', val: t('Klingon') },
        { key: 'tli', val: t('Tlingit') },
        { key: 'tly', val: t('Talysh') },
        { key: 'tmh', val: t('Tamashek') },
        { key: 'tn', val: t('Tswana') },
        { key: 'to', val: t('Tongan') },
        { key: 'tog', val: t('Nyasa Tonga') },
        { key: 'tpi', val: t('Tok Pisin') },
        { key: 'tr', val: t('Turkish') },
        { key: 'tru', val: t('Turoyo') },
        { key: 'trv', val: t('Taroko') },
        { key: 'ts', val: t('Tsonga') },
        { key: 'tsd', val: t('Tsakonian') },
        { key: 'tsi', val: t('Tsimshian') },
        { key: 'tt', val: t('Tatar') },
        { key: 'ttt', val: t('Muslim Tat') },
        { key: 'tum', val: t('Tumbuka') },
        { key: 'tvl', val: t('Tuvalu') },
        { key: 'tw', val: t('Twi') },
        { key: 'twq', val: t('Tasawaq') },
        { key: 'ty', val: t('Tahitian') },
        { key: 'tyv', val: t('Tuvinian') },
        { key: 'tzm', val: t('Central Atlas Tamazight') },
        { key: 'udm', val: t('Udmurt') },
        { key: 'ug', val: t('Uighur') },
        { key: 'uga', val: t('Ugaritic') },
        { key: 'uk', val: t('Ukrainian') },
        { key: 'umb', val: t('Umbundu') },
        { key: 'und', val: t('Unknown Language') },
        { key: 'ur', val: t('Urdu') },
        { key: 'uz', val: t('Uzbek') },
        { key: 'vai', val: t('Vai') },
        { key: 've', val: t('Venda') },
        { key: 'vec', val: t('Venetian') },
        { key: 'vep', val: t('Veps') },
        { key: 'vi', val: t('Vietnamese') },
        { key: 'vls', val: t('West Flemish') },
        { key: 'vmf', val: t('Main-Franconian') },
        { key: 'vo', val: t('Volapük') },
        { key: 'vot', val: t('Votic') },
        { key: 'vro', val: t('Võro') },
        { key: 'vun', val: t('Vunjo') },
        { key: 'wa', val: t('Walloon') },
        { key: 'wae', val: t('Walser') },
        { key: 'wal', val: t('Wolaytta') },
        { key: 'war', val: t('Waray') },
        { key: 'was', val: t('Washo') },
        { key: 'wbp', val: t('Warlpiri') },
        { key: 'wo', val: t('Wolof') },
        { key: 'wuu', val: t('Wu Chinese') },
        { key: 'xal', val: t('Kalmyk') },
        { key: 'xh', val: t('Xhosa') },
        { key: 'xmf', val: t('Mingrelian') },
        { key: 'xog', val: t('Soga') },
        { key: 'yao', val: t('Yao') },
        { key: 'yap', val: t('Yapese') },
        { key: 'yav', val: t('Yangben') },
        { key: 'ybb', val: t('Yemba') },
        { key: 'yi', val: t('Yiddish') },
        { key: 'yo', val: t('Yoruba') },
        { key: 'yrl', val: t('Nheengatu') },
        { key: 'yue', val: t('Cantonese') },
        { key: 'za', val: t('Zhuang') },
        { key: 'zap', val: t('Zapotec') },
        { key: 'zbl', val: t('Blissymbols') },
        { key: 'zea', val: t('Zeelandic') },
        { key: 'zen', val: t('Zenaga') },
        { key: 'zgh', val: t('Standard Moroccan Tamazight') },
        { key: 'zh', val: t('Chinese') },
        { key: 'zh-Hans', val: t('Simplified Chinese') },
        { key: 'zh-Hant', val: t('Traditional Chinese') },
        { key: 'zu', val: t('Zulu') },
        { key: 'zun', val: t('Zuni') },
        { key: 'zxx', val: t('No linguistic content') },
        { key: 'zza', val: t('Zaza') },
    ];

    const currencies = [
        { key: 'AED', val: t('UAE dirham') },
        { key: 'AFN', val: t('Afghan Afghani') },
        { key: 'ALK', val: t('Albanian lek (1946–1965)') },
        { key: 'ALL', val: t('Albanian lek') },
        { key: 'AMD', val: t('Armenian dram') },
        { key: 'ANG', val: t('Netherlands Antillean guilder') },
        { key: 'AOA', val: t('Angolan kwanza') },
        { key: 'AOK', val: t('Angolan kwanza (1977–1991)') },
        { key: 'AON', val: t('Angolan new kwanza (1990–2000)') },
        { key: 'AOR', val: t('Angolan readjusted kwanza (1995–1999)') },
        { key: 'ARA', val: t('Argentine austral') },
        { key: 'ARL', val: t('Argentine peso ley (1970–1983)') },
        { key: 'ARM', val: t('Argentine peso (1881–1970)') },
        { key: 'ARP', val: t('Argentine peso (1983–1985)') },
        { key: 'ARS', val: t('Argentine peso') },
        { key: 'ATS', val: t('Austrian schilling') },
        { key: 'AUD', val: t('Australian dollar') },
        { key: 'AWG', val: t('Aruban florin') },
        { key: 'AZM', val: t('Azerbaijani manat (1993–2006)') },
        { key: 'AZN', val: t('Azerbaijani manat') },
        { key: 'BAD', val: t('Bosnia-Herzegovina dinar (1992–1994)') },
        { key: 'BAM', val: t('Bosnia-Herzegovina convertible mark') },
        { key: 'BAN', val: t('Bosnia-Herzegovina new dinar (1994–1997)') },
        { key: 'BBD', val: t('Barbadian dollar') },
        { key: 'BDT', val: t('Bangladeshi taka') },
        { key: 'BEC', val: t('Belgian franc (convertible)') },
        { key: 'BEF', val: t('Belgian franc') },
        { key: 'BEL', val: t('Belgian franc (financial)') },
        { key: 'BGL', val: t('Bulgarian hard lev') },
        { key: 'BGM', val: t('Bulgarian socialist lev') },
        { key: 'BGN', val: t('Bulgarian lev') },
        { key: 'BGO', val: t('Bulgarian lev (1879–1952)') },
        { key: 'BHD', val: t('Bahraini dinar') },
        { key: 'BIF', val: t('Burundian franc') },
        { key: 'BMD', val: t('Bermudan dollar') },
        { key: 'BND', val: t('Brunei dollar') },
        { key: 'BOB', val: t('Bolivian boliviano') },
        { key: 'BOL', val: t('Bolivian boliviano (1863–1963)') },
        { key: 'BOP', val: t('Bolivian peso') },
        { key: 'BOV', val: t('Bolivian mvdol') },
        { key: 'BRB', val: t('Brazilian new cruzeiro (1967–1986)') },
        { key: 'BRC', val: t('Brazilian cruzado (1986–1989)') },
        { key: 'BRE', val: t('Brazilian cruzeiro (1990–1993)') },
        { key: 'BRL', val: t('Brazilian real') },
        { key: 'BRN', val: t('Brazilian new cruzado (1989–1990)') },
        { key: 'BRR', val: t('Brazilian cruzeiro (1993–1994)') },
        { key: 'BRZ', val: t('Brazilian cruzeiro (1942–1967)') },
        { key: 'BSD', val: t('Bahamian dollar') },
        { key: 'BTN', val: t('Bhutanese ngultrum') },
        { key: 'BUK', val: t('Burmese kyat') },
        { key: 'BWP', val: t('Botswanan pula') },
        { key: 'BYB', val: t('Belarusian new ruble (1994–1999)') },
        { key: 'BYR', val: t('Belarusian ruble') },
        { key: 'BZD', val: t('Belize dollar') },
        { key: 'CAD', val: t('Canadian dollar') },
        { key: 'CDF', val: t('Congolese franc') },
        { key: 'CHE', val: t('WIR euro') },
        { key: 'CHF', val: t('Swiss franc') },
        { key: 'CHW', val: t('WIR franc') },
        { key: 'CLE', val: t('Chilean escudo') },
        { key: 'CLF', val: t('Chilean unit of account (UF)') },
        { key: 'CLP', val: t('Chilean peso') },
        { key: 'CNX', val: t('Chinese People’s Bank dollar') },
        { key: 'CNY', val: t('Chinese yuan') },
        { key: 'COP', val: t('Colombian peso') },
        { key: 'COU', val: t('Colombian real value unit') },
        { key: 'CRC', val: t('Costa Rican colón') },
        { key: 'CSD', val: t('Serbian dinar (2002–2006)') },
        { key: 'CSK', val: t('Czechoslovak hard koruna') },
        { key: 'CUC', val: t('Cuban convertible peso') },
        { key: 'CUP', val: t('Cuban peso') },
        { key: 'CVE', val: t('Cape Verdean escudo') },
        { key: 'CYP', val: t('Cypriot pound') },
        { key: 'CZK', val: t('Czech Republic koruna') },
        { key: 'DDM', val: t('East German mark') },
        { key: 'DEM', val: t('German mark') },
        { key: 'DJF', val: t('Djiboutian franc') },
        { key: 'DKK', val: t('Danish krone') },
        { key: 'DOP', val: t('Dominican peso') },
        { key: 'DZD', val: t('Algerian dinar') },
        { key: 'ECS', val: t('Ecuadorian sucre') },
        { key: 'ECV', val: t('Ecuadorian unit of constant value') },
        { key: 'EEK', val: t('Estonian kroon') },
        { key: 'EGP', val: t('Egyptian pound') },
        { key: 'ERN', val: t('Eritrean nakfa') },
        { key: 'ESA', val: t('Spanish peseta (A account)') },
        { key: 'ESB', val: t('Spanish peseta (convertible account)') },
        { key: 'ESP', val: t('Spanish peseta') },
        { key: 'ETB', val: t('Ethiopian birr') },
        { key: 'EUR', val: t('euro') },
        { key: 'FIM', val: t('Finnish markka') },
        { key: 'FJD', val: t('Fijian dollar') },
        { key: 'FKP', val: t('Falkland Islands pound') },
        { key: 'FRF', val: t('French franc') },
        { key: 'GBP', val: t('British pound') },
        { key: 'GEK', val: t('Georgian kupon larit') },
        { key: 'GEL', val: t('Georgian lari') },
        { key: 'GHC', val: t('Ghanaian cedi (1979–2007)') },
        { key: 'GHS', val: t('Ghanaian cedi') },
        { key: 'GIP', val: t('Gibraltar pound') },
        { key: 'GMD', val: t('Gambian dalasi') },
        { key: 'GNF', val: t('Guinean franc') },
        { key: 'GNS', val: t('Guinean syli') },
        { key: 'GQE', val: t('Equatorial Guinean ekwele') },
        { key: 'GRD', val: t('Greek drachma') },
        { key: 'GTQ', val: t('Guatemalan quetzal') },
        { key: 'GWE', val: t('Portuguese Guinea escudo') },
        { key: 'GWP', val: t('Guinea-Bissau peso') },
        { key: 'GYD', val: t('Guyanaese dollar') },
        { key: 'HKD', val: t('Hong Kong dollar') },
        { key: 'HNL', val: t('Honduran lempira') },
        { key: 'HRD', val: t('Croatian dinar') },
        { key: 'HRK', val: t('Croatian kuna') },
        { key: 'HTG', val: t('Haitian gourde') },
        { key: 'HUF', val: t('Hungarian forint') },
        { key: 'IDR', val: t('Indonesian rupiah') },
        { key: 'IEP', val: t('Irish pound') },
        { key: 'ILP', val: t('Israeli pound') },
        { key: 'ILR', val: t('Israeli sheqel (1980–1985)') },
        { key: 'ILS', val: t('Israeli new sheqel') },
        { key: 'INR', val: t('Indian rupee') },
        { key: 'IQD', val: t('Iraqi dinar') },
        { key: 'IRR', val: t('Iranian rial') },
        { key: 'ISJ', val: t('Icelandic króna (1918–1981)') },
        { key: 'ISK', val: t('Icelandic króna') },
        { key: 'ITL', val: t('Italian lira') },
        { key: 'JMD', val: t('Jamaican dollar') },
        { key: 'JOD', val: t('Jordanian dinar') },
        { key: 'JPY', val: t('Japanese yen') },
        { key: 'KES', val: t('Kenyan shilling') },
        { key: 'KGS', val: t('Kyrgystani som') },
        { key: 'KHR', val: t('Cambodian riel') },
        { key: 'KMF', val: t('Comorian franc') },
        { key: 'KPW', val: t('North Korean won') },
        { key: 'KRH', val: t('South Korean hwan (1953–1962)') },
        { key: 'KRO', val: t('South Korean won (1945–1953)') },
        { key: 'KRW', val: t('South Korean won') },
        { key: 'KWD', val: t('Kuwaiti dinar') },
        { key: 'KYD', val: t('Cayman Islands dollar') },
        { key: 'KZT', val: t('Kazakhstani tenge') },
        { key: 'LAK', val: t('Laotian kip') },
        { key: 'LBP', val: t('Lebanese pound') },
        { key: 'LKR', val: t('Sri Lankan rupee') },
        { key: 'LRD', val: t('Liberian dollar') },
        { key: 'LSL', val: t('Lesotho loti') },
        { key: 'LTL', val: t('Lithuanian litas') },
        { key: 'LTT', val: t('Lithuanian talonas') },
        { key: 'LUC', val: t('Luxembourgian convertible franc') },
        { key: 'LUF', val: t('Luxembourgian franc') },
        { key: 'LUL', val: t('Luxembourg financial franc') },
        { key: 'LVL', val: t('Latvian lats') },
        { key: 'LVR', val: t('Latvian ruble') },
        { key: 'LYD', val: t('Libyan dinar') },
        { key: 'MAD', val: t('Moroccan dirham') },
        { key: 'MAF', val: t('Moroccan franc') },
        { key: 'MCF', val: t('Monegasque franc') },
        { key: 'MDC', val: t('Moldovan cupon') },
        { key: 'MDL', val: t('Moldovan leu') },
        { key: 'MGA', val: t('Malagasy ariary') },
        { key: 'MGF', val: t('Malagasy franc') },
        { key: 'MKD', val: t('Macedonian denar') },
        { key: 'MKN', val: t('Macedonian denar (1992–1993)') },
        { key: 'MLF', val: t('Malian franc') },
        { key: 'MMK', val: t('Myanmar kyat') },
        { key: 'MNT', val: t('Mongolian tugrik') },
        { key: 'MOP', val: t('Macanese pataca') },
        { key: 'MRO', val: t('Mauritanian ouguiya') },
        { key: 'MTL', val: t('Maltese lira') },
        { key: 'MTP', val: t('Maltese pound') },
        { key: 'MUR', val: t('Mauritian rupee') },
        { key: 'MVP', val: t('Maldivian rupee (1947–1981)') },
        { key: 'MVR', val: t('Maldivian rufiyaa') },
        { key: 'MWK', val: t('Malawian kwacha') },
        { key: 'MXN', val: t('Mexican peso') },
        { key: 'MXP', val: t('Mexican silver peso (1861–1992)') },
        { key: 'MXV', val: t('Mexican investment unit') },
        { key: 'MYR', val: t('Malaysian ringgit') },
        { key: 'MZE', val: t('Mozambican escudo') },
        { key: 'MZM', val: t('Mozambican metical (1980–2006)') },
        { key: 'MZN', val: t('Mozambican metical') },
        { key: 'NAD', val: t('Namibian dollar') },
        { key: 'NGN', val: t('Nigerian naira') },
        { key: 'NIC', val: t('Nicaraguan córdoba (1988–1991)') },
        { key: 'NIO', val: t('Nicaraguan córdoba') },
        { key: 'NLG', val: t('Dutch guilder') },
        { key: 'NOK', val: t('Norwegian krone') },
        { key: 'NPR', val: t('Nepalese rupee') },
        { key: 'NZD', val: t('New Zealand dollar') },
        { key: 'OMR', val: t('Omani rial') },
        { key: 'PAB', val: t('Panamanian balboa') },
        { key: 'PEI', val: t('Peruvian inti') },
        { key: 'PEN', val: t('Peruvian nuevo sol') },
        { key: 'PES', val: t('Peruvian sol (1863–1965)') },
        { key: 'PGK', val: t('Papua New Guinean kina') },
        { key: 'PHP', val: t('Philippine peso') },
        { key: 'PKR', val: t('Pakistani rupee') },
        { key: 'PLN', val: t('Polish zloty') },
        { key: 'PLZ', val: t('Polish zloty (PLZ)') },
        { key: 'PTE', val: t('Portuguese escudo') },
        { key: 'PYG', val: t('Paraguayan guarani') },
        { key: 'QAR', val: t('Qatari rial') },
        { key: 'RHD', val: t('Rhodesian dollar') },
        { key: 'ROL', val: t('Romanian leu (1952–2006)') },
        { key: 'RON', val: t('Romanian leu') },
        { key: 'RSD', val: t('Serbian dinar') },
        { key: 'RUB', val: t('Russian ruble') },
        { key: 'RUR', val: t('Russian ruble (1991–1998)') },
        { key: 'RWF', val: t('Rwandan franc') },
        { key: 'SAR', val: t('Saudi riyal') },
        { key: 'SBD', val: t('Solomon Islands dollar') },
        { key: 'SCR', val: t('Seychellois rupee') },
        { key: 'SDD', val: t('Sudanese dinar (1992–2007)') },
        { key: 'SDG', val: t('Sudanese pound') },
        { key: 'SDP', val: t('Sudanese pound (1957–1998)') },
        { key: 'SEK', val: t('Swedish krona') },
        { key: 'SGD', val: t('Singapore dollar') },
        { key: 'SHP', val: t('St. Helena pound') },
        { key: 'SIT', val: t('Slovenian tolar') },
        { key: 'SKK', val: t('Slovak koruna') },
        { key: 'SLL', val: t('Sierra Leonean leone') },
        { key: 'SOS', val: t('Somali shilling') },
        { key: 'SRD', val: t('Surinamese dollar') },
        { key: 'SRG', val: t('Surinamese guilder') },
        { key: 'SSP', val: t('South Sudanese pound') },
        { key: 'STD', val: t('São Tomé \u0026 Príncipe dobra') },
        { key: 'SUR', val: t('Soviet rouble') },
        { key: 'SVC', val: t('Salvadoran colón') },
        { key: 'SYP', val: t('Syrian pound') },
        { key: 'SZL', val: t('Swazi lilangeni') },
        { key: 'THB', val: t('Thai baht') },
        { key: 'TJR', val: t('Tajikistani ruble') },
        { key: 'TJS', val: t('Tajikistani somoni') },
        { key: 'TMM', val: t('Turkmenistani manat (1993–2009)') },
        { key: 'TMT', val: t('Turkmenistani manat') },
        { key: 'TND', val: t('Tunisian dinar') },
        { key: 'TOP', val: t('Tongan paʻanga') },
        { key: 'TPE', val: t('Timorese escudo') },
        { key: 'TRL', val: t('Turkish lira (1922–2005)') },
        { key: 'TRY', val: t('Turkish lira') },
        { key: 'TTD', val: t('Trinidad \u0026 Tobago dollar') },
        { key: 'TWD', val: t('New Taiwan dollar') },
        { key: 'TZS', val: t('Tanzanian shilling') },
        { key: 'UAH', val: t('Ukrainian hryvnia') },
        { key: 'UAK', val: t('Ukrainian karbovanets') },
        { key: 'UGS', val: t('Ugandan shilling (1966–1987)') },
        { key: 'UGX', val: t('Ugandan shilling') },
        { key: 'USD', val: t('US dollar') },
        { key: 'USN', val: t('US dollar (next day)') },
        { key: 'USS', val: t('US dollar (same day)') },
        { key: 'UYI', val: t('Uruguayan peso (indexed units)') },
        { key: 'UYP', val: t('Uruguayan peso (1975–1993)') },
        { key: 'UYU', val: t('Uruguayan peso') },
        { key: 'UZS', val: t('Uzbekistani som') },
        { key: 'VEB', val: t('Venezuelan bolívar (1871–2008)') },
        { key: 'VEF', val: t('Venezuelan bolívar') },
        { key: 'VND', val: t('Vietnamese dong') },
        { key: 'VNN', val: t('Vietnamese dong (1978–1985)') },
        { key: 'VUV', val: t('Vanuatu vatu') },
        { key: 'WST', val: t('Samoan tala') },
        { key: 'XAF', val: t('Central African CFA franc') },
        { key: 'XAG', val: t('troy ounce of silver') },
        { key: 'XAU', val: t('troy ounce of gold') },
        { key: 'XBA', val: t('European composite unit') },
        { key: 'XBB', val: t('European monetary unit') },
        { key: 'XBC', val: t('European unit of account (XBC)') },
        { key: 'XBD', val: t('European unit of account (XBD)') },
        { key: 'XCD', val: t('East Caribbean dollar') },
        { key: 'XDR', val: t('special drawing rights') },
        { key: 'XEU', val: t('European currency unit') },
        { key: 'XFO', val: t('French gold franc') },
        { key: 'XFU', val: t('French UIC-franc') },
        { key: 'XOF', val: t('West African CFA franc') },
        { key: 'XPD', val: t('troy ounce of palladium') },
        { key: 'XPF', val: t('CFP franc') },
        { key: 'XPT', val: t('troy ounce of platinum') },
        { key: 'XRE', val: t('RINET Funds unit') },
        { key: 'XSU', val: t('Sucre') },
        { key: 'XTS', val: t('Testing Currency unit') },
        { key: 'XUA', val: t('ADB unit of account') },
        { key: 'XXX', val: t('(unknown unit of currency)') },
        { key: 'YDD', val: t('Yemeni dinar') },
        { key: 'YER', val: t('Yemeni rial') },
        { key: 'YUD', val: t('Yugoslavian hard dinar (1966–1990)') },
        { key: 'YUM', val: t('Yugoslavian new dinar (1994–2002)') },
        { key: 'YUN', val: t('Yugoslavian convertible dinar (1990–1992)') },
        { key: 'YUR', val: t('Yugoslavian reformed dinar (1992–1993)') },
        { key: 'ZAL', val: t('South African rand (financial)') },
        { key: 'ZAR', val: t('South African rand') },
        { key: 'ZMK', val: t('Zambian kwacha (1968–2012)') },
        { key: 'ZMW', val: t('Zambian kwacha') },
        { key: 'ZRN', val: t('Zairean new zaire (1993–1998)') },
        { key: 'ZRZ', val: t('Zairean zaire (1971–1993)') },
        { key: 'ZWD', val: t('Zimbabwean dollar (1980–2008)') },
        { key: 'ZWL', val: t('Zimbabwean dollar (2009)') },
        { key: 'ZWR', val: t('Zimbabwean dollar (2008)') },
    ];

    const [createContact, { loading: creating }] = useMutation<CreateContactMutation>(CREATE_CONTACT_MUTATION);
    const [updateContact, { loading: saving }] = useMutation<UpdateContactMutation>(UPDATE_CONTACT_MUTATION);
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
                        },
                        setFieldValue,
                        handleChange,
                        handleSubmit,
                    }): ReactElement => (
                        <form onSubmit={handleSubmit} noValidate>
                            <Autosave />
                            <Accordion defaultExpanded={true}>
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
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                            <Accordion defaultExpanded={true}>
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
                                            />
                                        </Grid>
                                        <Grid item>
                                            <FormControl className={classes.formControl}>
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
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel id="pledgeCurrency">{t('Commitment Currency')}</InputLabel>
                                                <Select
                                                    labelId="pledgeCurrency"
                                                    value={pledgeCurrency}
                                                    onChange={handleChange('pledgeCurrency')}
                                                >
                                                    <MenuItem value={null}>{t('None')}</MenuItem>
                                                    {currencies.map(({ key, val }) => (
                                                        <MenuItem key={key} value={key}>
                                                            {val}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
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
                            <Accordion defaultExpanded={true}>
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
                                            <FormControl className={classes.formControl}>
                                                <InputLabel id="locale">{t('Language')}</InputLabel>
                                                <Select
                                                    labelId="locale"
                                                    value={locale}
                                                    onChange={handleChange('locale')}
                                                >
                                                    <MenuItem value={null}>{t('None')}</MenuItem>
                                                    {locales.map(({ key, val }) => (
                                                        <MenuItem key={key} value={key}>
                                                            {val}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <FormControl className={classes.formControl}>
                                                <InputLabel id="timezone">{t('Timezone')}</InputLabel>
                                                <Select
                                                    labelId="timezone"
                                                    value={timezone}
                                                    onChange={handleChange('timezone')}
                                                >
                                                    <MenuItem value={null}>{t('None')}</MenuItem>
                                                    {timezones.map(({ key, val }) => (
                                                        <MenuItem key={key} value={key}>
                                                            {val}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        <Grid item>
                                            <TextField
                                                label={t('Church Name')}
                                                value={churchName}
                                                multiline
                                                fullWidth
                                                inputProps={{ 'aria-label': 'Church Name' }}
                                                onChange={handleChange('greeting')}
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
