import React from 'react';
import { ApolloError } from '@apollo/client';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useEffectivePaycheckDate } from '../Shared/useEffectivePaycheckDate';

/** Sent by the API when a submitted request would end MHA and `confirmMhaEnd` was not set */
export const MHA_WOULD_END_CODE = 'MHA_WOULD_END';

export enum MhaEndReasonEnum {
  /** The request asks for $0 of MHA for this person */
  ZeroAmount = 'ZERO_AMOUNT',
  /** The person has no current board approval that lets MHA continue */
  NoHousingType = 'NO_HOUSING_TYPE',
}

export interface MhaEndPerson {
  personNumber: string;
  name: string;
  /** A person with a reason outside MhaEndReasonEnum is still listed, just without the why */
  reason: string;
}

const isMhaEndPerson = (person: unknown): person is MhaEndPerson => {
  if (typeof person !== 'object' || person === null) {
    return false;
  }
  const { personNumber, name, reason } = person as Record<string, unknown>;
  return (
    typeof personNumber === 'string' &&
    typeof name === 'string' &&
    typeof reason === 'string'
  );
};

/**
 * Returns who the request would end MHA for when `error` is an MHA_WOULD_END error, or null for
 * any other error. The list is empty when the error names nobody it can read, which still means
 * MHA would end.
 */
export const mhaEndPeopleFromError = (
  error: unknown,
): MhaEndPerson[] | null => {
  if (!(error instanceof ApolloError)) {
    return null;
  }
  const graphQLError = error.graphQLErrors.find(
    ({ extensions }) => extensions?.code === MHA_WOULD_END_CODE,
  );
  if (!graphQLError) {
    return null;
  }
  const people = graphQLError.extensions?.people;
  return Array.isArray(people)
    ? people.filter(isMhaEndPerson).map(({ personNumber, name, reason }) => ({
        personNumber,
        name,
        reason,
      }))
    : [];
};

interface MhaEndWarningProps {
  people: MhaEndPerson[];
}

export const MhaEndWarning: React.FC<MhaEndWarningProps> = ({ people }) => {
  const { t } = useTranslation();
  const paycheckDate = useEffectivePaycheckDate();

  if (!people.length) {
    return null;
  }

  const reasonText = (reason: string): string | null => {
    switch (reason) {
      case MhaEndReasonEnum.ZeroAmount:
        return t('This request sets their MHA to $0.');
      case MhaEndReasonEnum.NoHousingType:
        return t('They do not have a current board approval for MHA.');
      default:
        return null;
    }
  };

  return (
    <Box component="ul" sx={{ m: 0, mt: 1, pl: 3 }}>
      {people.map(({ personNumber, name, reason }) => {
        const why = reasonText(reason);
        return (
          <li key={personNumber}>
            {paycheckDate
              ? t(
                  "{{name}} won't get MHA starting with the paycheck on {{date}}.",
                  { name, date: paycheckDate },
                )
              : t("{{name}} won't get MHA once this request takes effect.", {
                  name,
                })}
            {why && ` ${why}`}
          </li>
        );
      })}
    </Box>
  );
};
