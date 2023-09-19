import fetch from 'node-fetch';
import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { cookieDefaultInfo } from '../../utils/cookies';

const impersonateOrganization = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  try {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Found');
      return;
    }

    const { organizationId, user, reason, userId } = JSON.parse(req.body);

    const jwt = await getToken({
      req,
      secret: process.env.JWT_SECRET,
    });

    const apiToken = (jwt as { apiToken: string } | null)?.apiToken;
    if (!apiToken) {
      res.status(401).send('Unauthorized');
      return;
    }

    if (typeof user !== 'string') {
      res.status(400).send('Missing user');
      return;
    }
    if (typeof reason !== 'string') {
      res.status(400).send('Missing reason');
      return;
    }
    if (typeof organizationId !== 'string') {
      res.status(400).send('Missing organizationId');
      return;
    }

    const fetchTokenforOrganization = await fetch(
      `${process.env.REST_API_URL}organizations/${organizationId}/impersonation`,
      {
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
      },
    );
    type FetchTokenforOrganizationType = {
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

    type Errors = {
      status: string;
      title: string;
      detail: string;
    };

    const fetchRes: FetchTokenforOrganizationType =
      (await fetchTokenforOrganization.json()) as FetchTokenforOrganizationType;

    let success = true;
    let errors: Errors[] = [];
    const impersonate = fetchRes?.data?.attributes?.json_web_token;

    if (fetchTokenforOrganization.status !== 200) {
      success = false;
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
    res.setHeader('Set-Cookie', [...new Set(cookies)]);
    res.status(fetchTokenforOrganization.status).json({ success, errors });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

export default impersonateOrganization;
