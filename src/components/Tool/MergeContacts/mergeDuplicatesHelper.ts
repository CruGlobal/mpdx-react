import { TFunction } from 'i18next';
import { ProviderContext } from 'notistack';
import { MassActionsMergeMutationHookResult } from 'src/components/Contacts/MassActions/Merge/MassActionsMerge.generated';
import { TypeEnum } from 'src/graphql/types.generated';
import {
  MergePeopleBulkMutationHookResult,
  UpdateDuplicateMutationHookResult,
} from '../MergePeople/GetPersonDuplicates.generated';
import { ActionType } from './MergeContacts';

type MergeMutation =
  | MergePeopleBulkMutationHookResult[0]
  | MassActionsMergeMutationHookResult[0];

export const bulkUpdateDuplicates = async (
  type: TypeEnum,
  actions: Record<string, ActionType>,
  mergeMutation: MergeMutation,
  updateDuplicate: UpdateDuplicateMutationHookResult[0],
  enqueueSnackbar: ProviderContext['enqueueSnackbar'],
  t: TFunction,
) => {
  const ignoreDuplicate = async (duplicateId: string) => {
    let status = true;
    await updateDuplicate({
      variables: {
        input: {
          attributes: {
            ignore: true,
          },
          type: type,
          id: duplicateId,
        },
      },
      update: (cache) => {
        // Delete the duplicate
        type === TypeEnum.Contact
          ? cache.evict({ id: `ContactDuplicate:${duplicateId}` })
          : cache.evict({ id: `PersonDuplicate:${duplicateId}` });
        cache.gc();
      },
      onCompleted: () => {
        status = true;
      },
      onError: () => {
        status = false;
      },
    });
    return { success: status };
  };

  const mergeDuplicates = async (
    winnersAndLosers,
    mergeMutation: MergeMutation,
  ) => {
    let status = true;
    let successResponse = 0;
    await mergeMutation({
      variables: {
        input: {
          winnersAndLosers,
        },
      },
      update: (cache) => {
        // Delete the contacts and remove dangling references to them
        winnersAndLosers.forEach((contact) => {
          type === TypeEnum.Contact
            ? cache.evict({ id: `Contact:${contact.loserId}` })
            : cache.evict({ id: `Person:${contact.loserId}` });
        });
        cache.gc();
      },
      onCompleted: (response) => {
        status = true;
        successResponse =
          type === TypeEnum.Contact
            ? response.mergeContacts.length
            : response.mergePeopleBulk.length;
      },
      onError: () => {
        status = false;
      },
    });
    return { success: status, successfulMerges: successResponse };
  };

  try {
    const callsByDuplicate: (() => Promise<{
      success: boolean;
      successfulMerges?: number;
    }>)[] = [];

    const mergeActions = Object.entries(actions).filter(
      (action) => action[1].action === 'merge',
    );
    if (mergeActions.length) {
      const winnersAndLosers: { winnerId: string; loserId: string }[] =
        mergeActions.map((action) => {
          return { winnerId: action[0], loserId: action[1].mergeId || '' };
        });
      const callMergeDuplicatesMutation = () =>
        mergeDuplicates(winnersAndLosers, mergeMutation);
      callsByDuplicate.push(callMergeDuplicatesMutation);
    }
    const duplicatesToIgnore = Object.entries(actions)
      .filter((action) => action[1].action === 'ignore')
      .map((action) => action[0]);

    if (duplicatesToIgnore.length) {
      duplicatesToIgnore.forEach((duplicateId) => {
        const callIgnoreDuplicateMutation = () => ignoreDuplicate(duplicateId);
        callsByDuplicate.push(callIgnoreDuplicateMutation);
      });
    }
    if (callsByDuplicate.length) {
      const results = await Promise.all(callsByDuplicate.map((call) => call()));
      let totalSuccessful = 0;
      results.forEach((result) => {
        //if the result has successfulMerges then add that number, otherwise just add 1 (for the individual ignoreDuplicate mutations)
        totalSuccessful +=
          result.success && result?.successfulMerges
            ? result.successfulMerges
            : result.success
              ? 1
              : 0;
      });
      const totalDuplicatesAttempted =
        mergeActions.length + duplicatesToIgnore.length;

      if (totalSuccessful) {
        const message = t(`Updated ${totalSuccessful} duplicate(s)`);
        enqueueSnackbar(`${message}`, {
          variant: 'success',
        });
      }
      if (totalDuplicatesAttempted !== totalSuccessful) {
        const message = t(
          `Failed to update ${
            totalDuplicatesAttempted - totalSuccessful
          } duplicate(s)`,
        );
        enqueueSnackbar(message, {
          variant: 'error',
        });
      }
    } else {
      enqueueSnackbar(`${t('No duplicates were updated')}`, {
        variant: 'warning',
      });
    }
  } catch (error) {
    const message = t(`Error updating duplicates: ${error}`);
    enqueueSnackbar(message, {
      variant: 'error',
    });
  }
};
