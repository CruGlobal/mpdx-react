import { ApolloLink, Observable } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import i18n from 'src/lib/i18n';
import snackNotifications from '../../components/Snackbar/Snackbar';

export const isOffline = (): boolean =>
  typeof navigator !== 'undefined' && !navigator.onLine;

// Blocks mutations while offline so users get one clear message instead of a
// confusing network failure. Queries pass through: cache-and-network renders
// cached data and the network miss is suppressed in the onError link.
export const offlineLink = new ApolloLink((operation, forward) => {
  const definition = getMainDefinition(operation.query);
  const isMutation =
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'mutation';

  if (isMutation && isOffline()) {
    snackNotifications.warning(
      i18n.t('You are offline. Changes cannot be saved until you reconnect.'),
      { preventDuplicate: true },
    );
    return new Observable((observer) => {
      observer.error(new Error(i18n.t('Cannot save changes while offline.')));
    });
  }

  return forward(operation);
});
