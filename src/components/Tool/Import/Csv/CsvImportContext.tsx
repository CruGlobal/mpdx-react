import React, { useState } from 'react';
import * as Types from '../../../../graphql/types.generated';

export type CsvContact = Pick<
  Types.Contact,
  | 'churchName'
  | 'contactReferralsToMe'
  | 'envelopeGreeting'
  | 'greeting'
  | 'id'
  | 'likelyToGive'
  | 'name'
  | 'noAppeals'
  | 'notes'
  | 'pledgeAmount'
  | 'pledgeFrequency'
  | 'pledgeCurrency'
  | 'primaryPerson'
  | 'relationshipCode'
  | 'sendNewsletter'
  | 'status'
  | 'tagList'
  | 'website'
> & {
  addresses?: Array<Types.Address>;
  spouse?: Types.Maybe<Types.Person>;
};

export enum CsvImportViewStepEnum {
  Upload = 'upload',
  Headers = 'headers',
  Values = 'values',
  Preview = 'preview',
}

export type CsvImportType = {
  fileConstants: object;
  fileConstantsMappings: object;
  fileHeaders: object;
  fileHeadersMappings: object;
  id: string;
  inPreview: boolean;
  sampleContacts: CsvContact[];
  tagList: string[] | string;
  valuesToConstantsMappings: object;
};

export interface CsvImportValue {
  uploadData: CsvImportType | null;
  setUploadData: React.Dispatch<React.SetStateAction<CsvImportType | null>>;
  initialData: CsvImportType | null;
  setInitialData: React.Dispatch<React.SetStateAction<CsvImportType | null>>;
  csvFileId: string | null;
}

export const CsvImportContext = React.createContext<CsvImportValue | null>(
  null,
);

interface CsvImportProviderProps {
  children: React.ReactNode;
  csvFileId: string;
}

export const CsvImportProvider: React.FC<CsvImportProviderProps> = ({
  children,
  csvFileId,
}) => {
  const [uploadData, setUploadData] = useState<CsvImportType | null>(
    {} as CsvImportType,
  );

  const [initialData, setInitialData] = useState<CsvImportType | null>(
    {} as CsvImportType,
  );

  return (
    <CsvImportContext.Provider
      value={{
        uploadData,
        setUploadData,
        initialData,
        setInitialData,
        csvFileId,
      }}
    >
      {children}
    </CsvImportContext.Provider>
  );
};
