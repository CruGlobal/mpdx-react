import { NextApiRequest } from 'next';
import { getToken } from 'next-auth/jwt';
import fetch from 'node-fetch';
import { getErrorMessage } from 'src/lib/getErrorFromCatch';
import { cookieDefaultInfo } from '../../utils/cookies';

export enum ImpersonationTypeEnum {
  USER = 'user',
  ORGANIZATION = 'organization',
}
type Errors = {
  status: string;
  title: string;
  detail: string;
};

type impersonateResponse = {
  status: number;
  errors: Errors[];
  invalidRequest: boolean;
  cookies: string[];
};

type FetchTokenForOrganizationType = {
  data: {
    type: string;
    attributes: {
      created_at: string;
      json_web_token: string;
      updated_at: string;
      updated_in_db_at: string;
    };
  };
  errors: Errors[];
};

export const impersonate = async (
  req: NextApiRequest,
  impersonationType: ImpersonationTypeEnum,
): Promise<impersonateResponse> => {
  let status = 400;
  let errors: Errors[] = [];
  const isUserImpersonate =
    impersonationType === ImpersonationTypeEnum.USER ? true : false;
  try {
    if (req.method !== 'POST') {
      status = 405;
      throw new Error('Method Not Found');
    }

    const { organizationId = '', user, reason, userId } = JSON.parse(req.body);

    const jwt = await getToken({
      req,
      secret: process.env.JWT_SECRET,
    });

    const apiToken = (jwt as { apiToken: string } | null)?.apiToken;
    if (!apiToken) {
      status = 401;
      throw new Error('Unauthorized');
    }

    if (typeof user !== 'string') {
      status = 400;
      throw new Error('Missing user');
    }
    if (typeof reason !== 'string') {
      status = 400;
      throw new Error('Missing reason');
    }
    if (typeof organizationId !== 'string' && !isUserImpersonate) {
      status = 400;
      throw new Error('Missing organizationId');
    }

    let fetchTokenUrl = `${process.env.REST_API_URL}`;
    fetchTokenUrl += isUserImpersonate
      ? 'admin/impersonation'
      : `organizations/${organizationId}/impersonation`;

    const fetchToken = await fetch(fetchTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            user,
            reason,
          },
          type: 'impersonation',
        },
      }),
    });

    const fetchRes: FetchTokenForOrganizationType = await fetchToken.json();

    const impersonate = fetchRes?.data?.attributes?.json_web_token;

    if (fetchToken.status !== 200) {
      errors = fetchRes.errors;
    } else {
      if (!impersonate) {
        errors.push({
          status: '400',
          title: 'Not Found',
          detail: 'Unable to impersonate provided user',
        });
      }
    }

    const cookies = [
      `mpdx-handoff.accountConflictUserId=${userId}; ${cookieDefaultInfo}`,
      `mpdx-handoff.impersonate=${impersonate}; ${cookieDefaultInfo}`,
      `mpdx-handoff.redirect-url=/; ${cookieDefaultInfo}`,
      `mpdx-handoff.token=${apiToken}; ${cookieDefaultInfo}`,
    ];
    return {
      status: fetchToken.status,
      errors,
      invalidRequest: false,
      cookies,
    };
  } catch (e) {
    const message = getErrorMessage(e);
    errors.push({
      status: status.toString(),
      title: 'Error occurred while setting up impersonation',
      detail: message,
    });

    return {
      status,
      errors,
      invalidRequest: true,
      cookies: [],
    };
  }
};
