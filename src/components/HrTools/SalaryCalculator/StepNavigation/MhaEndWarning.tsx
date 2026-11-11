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

export interface MhaEnd {
  people: MhaEndPerson[];
  /** The request's effective date the server checked (ISO 8601), or null when it sent none */
  effectiveDate: string | null;
}

/**
 * Returns who the request would end MHA for, and from which effective date, when `error` is an
 * MHA_WOULD_END error, or null for any other error. `people` is empty when the error names nobody
 * it can read, which still means MHA would end.
 */
export const mhaEndFromError = (error: unknown): MhaEnd | null => {
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
  const effectiveDate = graphQLError.extensions?.effectiveDate;
  return {
    people: Array.isArray(people)
      ? people.filter(isMhaEndPerson).map(({ personNumber, name, reason }) => ({
          personNumber,
          name,
          reason,
        }))
      : [],
    effectiveDate: typeof effectiveDate === 'string' ? effectiveDate : null,
  };
};

export const MhaEndWarning: React.FC<MhaEnd> = ({ people, effectiveDate }) => {
  const { t } = useTranslation();
  const paycheckDate = useEffectivePaycheckDate(effectiveDate);

  if (!people.length) {
    return null;
  }

  const warningText = (name: string, reason: string): string => {
    if (paycheckDate) {
      const options = { name, date: paycheckDate };
      switch (reason) {
        case MhaEndReasonEnum.ZeroAmount:
          return t(
            "{{name}} won't get MHA starting with the paycheck on {{date}}. This request sets their MHA to $0.",
            options,
          );
        case MhaEndReasonEnum.NoHousingType:
          return t(
            "{{name}} won't get MHA starting with the paycheck on {{date}}. They do not have a current board approval for MHA.",
            options,
          );
        default:
          return t(
            "{{name}} won't get MHA starting with the paycheck on {{date}}.",
            options,
          );
      }
    }

    switch (reason) {
      case MhaEndReasonEnum.ZeroAmount:
        return t(
          "{{name}} won't get MHA once this request takes effect. This request sets their MHA to $0.",
          { name },
        );
      case MhaEndReasonEnum.NoHousingType:
        return t(
          "{{name}} won't get MHA once this request takes effect. They do not have a current board approval for MHA.",
          { name },
        );
      default:
        return t("{{name}} won't get MHA once this request takes effect.", {
          name,
        });
    }
  };

  return (
    <Box component="ul" sx={{ m: 0, mt: 1, pl: 3 }}>
      {people.map(({ personNumber, name, reason }) => (
        <li key={personNumber}>{warningText(name, reason)}</li>
      ))}
    </Box>
  );
};
