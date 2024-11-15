import { DateTime } from 'luxon';
import { TFunction } from 'react-i18next';
import * as yup from 'yup';
import {
  PersonCreateInput,
  PersonUpdateInput,
  UserUpdateInput,
} from 'src/graphql/types.generated';
import { NewSocial, Person } from './PersonModal';

interface GetPersonSchemaReturnedValues {
  personSchema: yup.ObjectSchema<
    Omit<PersonUpdateInput, 'familyRelationships' | 'id'>
  >;
  initialPerson: (PersonCreateInput | PersonUpdateInput) & NewSocial;
}

export const getPersonSchema = (
  t: TFunction,
  contactId: string,
  person?: Person,
): GetPersonSchemaReturnedValues => {
  const personSchema = yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().nullable(),
    title: yup.string().nullable(),
    suffix: yup.string().nullable(),
    phoneNumbers: yup.array().of(
      yup
        .object({
          id: yup.string().nullable(),
          number: yup.string().when('destroy', {
            is: true,
            then: yup.string().nullable(),
            otherwise: yup
              .string()
              .required(t('This field is required'))
              .nullable()
              .test(
                'is-phone-number',
                t('This field is not a valid phone number'),
                (val) => typeof val === 'string' && /\d/.test(val),
              ),
          }),
          destroy: yup.boolean().default(false),
          primary: yup.boolean().default(false),
          historic: yup.boolean().default(false),
        })
        .required(),
    ),
    emailAddresses: yup.array().of(
      yup.object({
        id: yup.string().nullable(),
        email: yup
          .string()
          .email(t('Invalid email address'))
          .required(t('This field is required')),
        destroy: yup.boolean().default(false),
        primary: yup.boolean().default(false),
        historic: yup.boolean().default(false),
      }),
    ),
    facebookAccounts: yup.array().of(
      yup
        .object({
          id: yup.string().nullable(),
          destroy: yup.boolean().default(false),
          username: yup.string().required(),
        })
        .required(),
    ),
    linkedinAccounts: yup.array().of(
      yup
        .object({
          id: yup.string().nullable(),
          destroy: yup.boolean().default(false),
          publicUrl: yup.string().required(),
        })
        .required(),
    ),
    twitterAccounts: yup.array().of(
      yup
        .object({
          id: yup.string().nullable(),
          destroy: yup.boolean().default(false),
          screenName: yup.string().required(),
        })
        .required(),
    ),
    websites: yup.array().of(
      yup
        .object({
          id: yup.string().nullable(),
          destroy: yup.boolean().default(false),
          url: yup.string().required(),
        })
        .required(),
    ),
    newSocials: yup.array().of(
      yup
        .object({
          value: yup.string().required(),
          type: yup.string().required(),
        })
        .required(),
    ),
    optoutEnewsletter: yup.boolean().default(false),
    birthdayDay: yup.number().nullable(),
    birthdayMonth: yup.number().nullable(),
    birthdayYear: yup.number().nullable(),
    maritalStatus: yup.string().nullable(),
    gender: yup.string().nullable(),
    anniversaryDay: yup.number().nullable(),
    anniversaryMonth: yup.number().nullable(),
    anniversaryYear: yup.number().nullable(),
    almaMater: yup.string().nullable(),
    employer: yup.string().nullable(),
    occupation: yup.string().nullable(),
    legalFirstName: yup.string().nullable(),
    deceased: yup.boolean().default(false),
    defaultAccountList: yup.string().nullable(),
  });

  const personPhoneNumbers = person?.phoneNumbers.nodes.map((phoneNumber) => {
    return {
      id: phoneNumber.id,
      primary: phoneNumber.primary,
      number: phoneNumber.number,
      historic: phoneNumber.historic,
      location: phoneNumber.location,
      destroy: false,
    };
  });

  const personEmails = person?.emailAddresses.nodes.map((emailAddress) => {
    return {
      id: emailAddress.id,
      primary: emailAddress.primary,
      email: emailAddress.email,
      historic: emailAddress.historic,
      location: emailAddress.location,
      destroy: false,
    };
  });

  const personFacebookAccounts = person?.facebookAccounts.nodes.map(
    (account) => ({
      id: account.id,
      username: account.username,
      destroy: false,
    }),
  );

  const personTwitterAccounts = person?.twitterAccounts.nodes.map(
    (account) => ({
      id: account.id,
      screenName: account.screenName,
      destroy: false,
    }),
  );

  const personLinkedinAccounts = person?.linkedinAccounts.nodes.map(
    (account) => ({
      id: account.id,
      publicUrl: account.publicUrl,
      destroy: false,
    }),
  );

  const personWebsites = person?.websites.nodes.map((account) => ({
    id: account.id,
    url: account.url,
    destroy: false,
  }));

  const initialPerson: (PersonCreateInput | PersonUpdateInput) & NewSocial =
    person
      ? {
          id: person.id,
          firstName: person.firstName,
          lastName: person.lastName,
          title: person.title,
          suffix: person.suffix,
          phoneNumbers: personPhoneNumbers,
          emailAddresses: personEmails,
          optoutEnewsletter: person.optoutEnewsletter,
          birthdayDay: person.birthdayDay,
          birthdayMonth: person.birthdayMonth,
          birthdayYear: person.birthdayYear,
          maritalStatus: person.maritalStatus,
          gender: person.gender,
          anniversaryDay: person.anniversaryDay,
          anniversaryMonth: person.anniversaryMonth,
          anniversaryYear: person.anniversaryYear,
          almaMater: person.almaMater,
          employer: person.employer,
          occupation: person.occupation,
          facebookAccounts: personFacebookAccounts,
          twitterAccounts: personTwitterAccounts,
          linkedinAccounts: personLinkedinAccounts,
          websites: personWebsites,
          legalFirstName: person.legalFirstName,
          deceased: person.deceased,
          newSocials: [],
        }
      : {
          contactId,
          id: null,
          firstName: '',
          lastName: null,
          title: null,
          suffix: null,
          phoneNumbers: [],
          emailAddresses: [],
          optoutEnewsletter: false,
          birthdayDay: null,
          birthdayMonth: null,
          birthdayYear: null,
          maritalStatus: null,
          gender: 'Male',
          anniversaryDay: null,
          anniversaryMonth: null,
          anniversaryYear: null,
          almaMater: null,
          employer: null,
          occupation: null,
          facebookAccounts: [],
          twitterAccounts: [],
          linkedinAccounts: [],
          websites: [],
          legalFirstName: null,
          deceased: false,
          newSocials: [],
        };

  return {
    personSchema,
    initialPerson,
  };
};

export const formatSubmittedFields = (
  fields: (PersonCreateInput | PersonUpdateInput | UserUpdateInput) & NewSocial,
): PersonCreateInput | PersonUpdateInput | UserUpdateInput => {
  const { newSocials, ...existingFields } = fields;

  return {
    ...existingFields,
    facebookAccounts: fields.facebookAccounts?.concat(
      newSocials
        .filter((social) => social.type === 'facebook' && !social.destroy)
        .map((social) => ({
          username: social.value,
        })),
    ),
    twitterAccounts: fields.twitterAccounts?.concat(
      newSocials
        .filter((social) => social.type === 'twitter' && !social.destroy)
        .map((social) => ({
          screenName: social.value,
        })),
    ),
    linkedinAccounts: fields.linkedinAccounts?.concat(
      newSocials
        .filter((social) => social.type === 'linkedin' && !social.destroy)
        .map((social) => ({
          publicUrl: social.value,
        })),
    ),
    websites: fields.websites?.concat(
      newSocials
        .filter((social) => social.type === 'website' && !social.destroy)
        .map((social) => ({
          url: social.value,
        })),
    ),
  };
};

export const buildDate = (month, day, year) => {
  return month && day ? DateTime.local(year ?? 1900, month, day) : null;
};
