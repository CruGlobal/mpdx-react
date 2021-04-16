import { NextApiRequest, NextApiResponse } from 'next';
import Axios from 'axios';
import client from '../../../src/lib/client';
import {
  UserKeySignInDocument,
  UserKeySignInMutation,
  UserKeySignInMutationVariables,
} from './UserKeySignIn.generated';

export interface Profile {
  id?: string;
  name?: string;
  token: string;
}

const profile = async (
  req: NextApiRequest,
  res: NextApiResponse<Profile>,
): Promise<void> => {
  const {
    data: { ticket: ticket },
  } = await Axios.get('https://thekey.me/cas/api/oauth/ticket', {
    headers: {
      Authorization: req.headers.authorization,
      Accept: 'application/json',
    },
    params: {
      service: process.env.API_URL,
    },
  });

  const response = await client.mutate<
    UserKeySignInMutation,
    UserKeySignInMutationVariables
  >({
    mutation: UserKeySignInDocument,
    variables: {
      ticket,
    },
  });
  const payload = response.data?.userKeySignIn;
  if (payload?.token) {
    res.status(200).json({
      id: payload.user?.id,
      name: payload.user?.name ?? undefined,
      token: payload.token,
    });
  } else {
    throw new Error('userKeySignIn ticket exchange failed');
  }
};

export default profile;
