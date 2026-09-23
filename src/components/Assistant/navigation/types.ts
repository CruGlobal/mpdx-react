import { DateTime } from 'luxon';
import { Params } from './params';

export interface BuildContext {
  basePath: string;
  now: DateTime;
}

export type NavigationBuilder = (
  params: Params,
  context: BuildContext,
) => string | null;
