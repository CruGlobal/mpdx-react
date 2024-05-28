import { invert, merge } from 'lodash';
import { cloneDeep, omitBy } from 'lodash/fp';
import { TFunction } from 'react-i18next';
import { snakeToCamel } from 'src/lib/snakeToCamel';
import reduceObject from '../../../../lib/reduceObject';
import { CsvImportType } from './CsvImportContext';
import { getFile, saveFile } from './uploadCsvFile';

const reduceConstants = (array: any[]): any => {
  return array.reduce((result, constant) => {
    const group = constant.values.reduce((group, value) => {
      if (value) {
        group[value] = constant.id === '' ? null : constant.id;
      }
      return group;
    }, {});
    return merge(result, group);
  }, {});
};

const getConstantValues = (
  constant: string,
  fileConstants: object,
  fileHeadersMappings: object,
): string[] => {
  const key = Object.keys(fileConstants).find(
    (fileConstantKey) => fileHeadersMappings[fileConstantKey] === constant,
  ) as string;
  return fileConstants[key] || [];
};

const mergeFileConstants = (
  result: object,
  key: string,
  fileConstants: object,
  fileHeadersMappings: object,
): object => {
  const values = Object.keys(result[key]);
  const allValues = getConstantValues(key, fileConstants, fileHeadersMappings);
  const difference = allValues.filter((value) => !values.includes(value));
  const unmappedValues = difference.reduce(
    (object: Record<string, string>, csvValue: string) => {
      object[csvValue] = '';
      return object;
    },
    {},
  );
  return merge(unmappedValues, result[key]);
};

export const constantsMappingsToValueMappings = (
  constantsMappings: object,
  fileConstants: object,
  fileHeadersMappings: object,
): object => {
  return reduceObject(
    (result, array, key) => {
      result[key] = reduceConstants(array);

      result[key] =
        fileConstants && fileHeadersMappings
          ? mergeFileConstants(result, key, fileConstants, fileHeadersMappings)
          : result[key];

      return result;
    },
    {},
    constantsMappings,
  );
};

const buildValueMappings = (
  valueMappings: object,
  fileHeadersMappings: object,
  importConstants: object,
): object => {
  valueMappings = valueMappings || {};

  const mappedHeaders = Object.values(fileHeadersMappings) as string[];
  const constants = Object.keys(importConstants);
  return mappedHeaders.reduce((object, mappedHeader) => {
    if (mappedHeader && constants.includes(snakeToCamel(mappedHeader))) {
      object[mappedHeader] = object[mappedHeader] || {};
    }
    return object;
  }, valueMappings);
};

const buildConstantValues = (object: object): any[] => {
  return reduceObject(
    (array, constant, value) => {
      constant = constant === null || constant === 'null' ? '' : constant;
      constant =
        constant === 'true' ? true : constant === 'false' ? false : constant;
      let constantIndex = array.findIndex((element) => element.id === constant);
      constantIndex = constantIndex > -1 ? constantIndex : array.length;
      array[constantIndex] = array[constantIndex] || {
        id: constant,
        values: [],
      };
      array[constantIndex].values = array[constantIndex].values.concat(value);
      return array;
    },
    [],
    object,
  );
};

const buildFileConstantValues = (
  result: object,
  key: string,
  fileConstants: object,
  fileHeadersMappings: object,
): any => {
  const values = result[key].reduce(
    (result, object) => result.concat(object.values),
    [],
  );
  const allValues = getConstantValues(key, fileConstants, fileHeadersMappings);
  return allValues
    .filter((value) => !values.includes(value))
    .reduce((object, csvValue) => {
      let constantIndex = object.findIndex((element) => element.id === '');
      constantIndex = constantIndex > -1 ? constantIndex : object.length;
      object[constantIndex] = object[constantIndex] || { id: '', values: [] };
      object[constantIndex].values =
        object[constantIndex].values.concat(csvValue);
      return object;
    }, result[key]);
};

export const valueMappingsToConstantsMappings = (
  valueMappings: object,
  fileConstants: object,
  fileHeadersMappings: object,
  importConstants: any,
): object => {
  valueMappings = buildValueMappings(
    valueMappings,
    fileHeadersMappings,
    importConstants,
  );

  const endResult = reduceObject(
    (result, object, key) => {
      result[key] = buildConstantValues(object);
      result[key] =
        fileConstants && fileHeadersMappings
          ? buildFileConstantValues(
              result,
              key,
              fileConstants,
              fileHeadersMappings,
            )
          : result[key];
      return result;
    },
    {},
    valueMappings,
  );
  return endResult;
};

const handleSaveSuccess = (
  data: CsvImportType,
  supportedHeaders: object,
  setUploadData: React.Dispatch<React.SetStateAction<CsvImportType | null>>,
  setInitialData: React.Dispatch<React.SetStateAction<CsvImportType | null>>,
): CsvImportType => {
  if (data) {
    const transformedData = {
      ...data,
      fileHeadersMappings: invert(data.fileHeadersMappings),
      tagList: data.tagList ?? [],
      valuesToConstantsMappings: constantsMappingsToValueMappings(
        data.fileConstantsMappings,
        data.fileConstants,
        data.fileHeadersMappings,
      ),
    } as CsvImportType;

    if (Object.keys(transformedData.fileHeadersMappings).length === 0) {
      const fileHeadersMappingsKeys = Object.keys(transformedData.fileHeaders);
      transformedData.fileHeadersMappings = reduceObject(
        (result, value, key) => {
          if (fileHeadersMappingsKeys.includes(key)) {
            result[key] = key;
          }
          return result;
        },
        {},
        supportedHeaders,
      );
    }
    setInitialData(transformedData);
    setUploadData(cloneDeep(transformedData));
    return transformedData;
  }
  return {} as CsvImportType;
};

export interface SaveCsvProps {
  uploadData: CsvImportType;
  initialData: CsvImportType;
  constants: object;
  accountListId: string;
  t: TFunction;
  supportedHeaders: object;
  setUploadData: React.Dispatch<React.SetStateAction<CsvImportType | null>>;
  setInitialData: React.Dispatch<React.SetStateAction<CsvImportType | null>>;
}
export const save = async ({
  uploadData,
  initialData,
  constants,
  accountListId,
  t,
  supportedHeaders,
  setUploadData,
  setInitialData,
}: SaveCsvProps): Promise<CsvImportType> => {
  if (!uploadData || !initialData) {
    throw new Error('Incomplete data');
  }

  uploadData.fileHeadersMappings = omitBy(
    (headerMapping) => headerMapping === -1,
    uploadData.fileHeadersMappings,
  );

  if (
    uploadData.valuesToConstantsMappings &&
    uploadData.valuesToConstantsMappings['send_appeals']
  ) {
    Object.entries(
      uploadData.valuesToConstantsMappings['send_appeals'],
    ).forEach((sendAppeal) => {
      sendAppeal[1] = sendAppeal[1] === 'true';
    });
  }

  uploadData.fileConstantsMappings = valueMappingsToConstantsMappings(
    uploadData.valuesToConstantsMappings,
    uploadData.fileConstants,
    uploadData.fileHeadersMappings,
    constants,
  );

  try {
    const data = await saveFile({ accountListId, initialData, uploadData, t });
    return handleSaveSuccess(
      data,
      supportedHeaders,
      setUploadData,
      setInitialData,
    );
  } catch (err) {
    const newUploadData = {
      ...uploadData,
      fileHeaders: uploadData.fileHeaders,
      fileHeadersMappings: invert(uploadData.fileHeadersMappings),
    } as CsvImportType;
    setUploadData(newUploadData);
    // eslint-disable-next-line no-console
    console.error(err);
    throw err;
  }
};

export const get = async (
  accountListId: string,
  csvFileId: string,
  initialData?: CsvImportType | null,
): Promise<CsvImportType> => {
  if (!csvFileId) {
    return null as unknown as CsvImportType;
  }
  if (initialData && initialData.id === csvFileId) {
    return initialData;
  }

  try {
    const data = await getFile({ accountListId, csvFileId });
    const transformedData = {
      ...data,
      fileHeadersMappings: invert(data.fileHeadersMappings),
      tagList: data.tagList ?? [],
      valuesToConstantsMappings: constantsMappingsToValueMappings(
        data.fileConstantsMappings,
        data.fileConstants,
        data.fileHeadersMappings,
      ),
    };
    return transformedData;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    throw err;
  }
};
