import { invert, merge } from 'lodash';
import { cloneDeep, omitBy } from 'lodash/fp';
import { TFunction } from 'react-i18next';
import { snakeToCamel } from 'src/lib/snakeToCamel';
import reduceObject from '../../../../lib/reduceObject';
import { CsvImportType } from './CsvImportContext';
import { getFile, saveFile } from './uploadCsvFile';

/**
 * Returns a flattened map of file values to constant values. For example:
 *  {
 *    abc: 'Physical',
 *    def: 'Physical',
 *    ghi: 'Both',
 *    jkl: 'Both'
 *  }
 *
 * @param array an array maps of (API) constant values to file values. For example:
 *   [{ id: 'Physical', values: ['abc', 'def'] }, { id: 'Both', values: ['ghi', 'jkl'] }]
 */
const reduceConstants = (array: any[]): any => {
  return array.reduce((result, constant) => {
    const group = constant.values.reduce((group, value) => {
      if (value) {
        group[value] = constant.id ?? null;
      }
      return group;
    }, {});
    return merge(result, group);
  }, {});
};

/**
 * Returns an array of values in the file associated with a file header
 * (which is mapped to an API constant via fileHeadersMappings).
 *
 * @param constant the key of the constant to look up
 * @param fileConstants the header/value map from the file
 * @param fileHeadersMappings a map of file headers to constants ids
 */
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

/**
 * Returns a flattened a map of a single constant key to the values mapped to that constant.
 *
 * @param result a map of a single constant id to the values in the file
 * @param key the constant key
 * @param fileConstants a map of file headers to file values
 * @param fileHeadersMappings a map of file headers to constants ids
 */
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

/**
 * Returns a flattened map of file values to constants values.
 *
 * @param constantsMappings a map of constants ids to file values
 * @param fileConstants a map of file headers to file values
 * @param fileHeadersMappings a map of file headers to constants ids
 */
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

/**
 * Returns a map of constants values to file values.
 *
 * @param valueMappings the values to constants mappings
 * @param fileHeadersMappings the mapping of supported headers to headers in the file
 * @param importConstants the constants from the API
 */
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

/**
 * Returns a map of constants ids to file values. For example:
 *  send_appeals: [{ id: true, values: ['bar'] }, { id: false, values: ['baz'] }]
 *
 * @param object The mapping of file values to constants ids
 */
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

/**
 * Returns a mapping of values in the file to constants values.
 *
 * @param result the map of all constant values to file values. For example:
 *  send_appeals: [{ id: true, values: ['bar'] }, { id: false, values: ['baz'] }]
 *  This is a list of maps built from buildConstantValues() for each constant mapped
 * @param key the key of the (API) constant being mapped
 * @param fileConstants the header/values map that exist in the file that need mapping
 * @param fileHeadersMappings the mapping of supported headers to headers in the file
 */
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

/**
 * Transforms data mapping the CSV file values with pre-defined constant values
 * for those fields. See LoadConstants for the constants in question.
 *
 * @param valueMappings the values to constants mappings
 * @param fileConstants the header/values map that exist in the file that need mapping
 * @param fileHeadersMappings the mapping of supported headers to headers in the file
 * @param importConstants the constants from the API
 * @returns the transformed map, mapping each supported constant to a list of values in the file
 */
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

/**
 * Saves (updates) a CSV file that has already been uploaded.
 *
 * @param props data required to save the CSV file
 *  - uploadData: the actual data to save
 *  - initialData: the original file data
 *  - constants: see LoadConstants
 *  - accountListId: the ID of the current account list
 *  - t: translation function
 *  - supportedHeaders: pre-existing headers defined for CSV imports by the API
 *  - setUploadData: useState hook to set upload data value post-save
 *  - setInitialData: useState hook to set new initial data value post-save
 * @returns the new state of the data
 */
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

/**
 * Returns a CSV file for the given ID, or the preloaded version if it is populated.
 *
 * @param accountListId the ID of the current account list
 * @param csvFileId the ID of the desired CSV file
 * @param initialData the existing CSV file data, if any
 */
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
