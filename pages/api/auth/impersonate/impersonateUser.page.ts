import { NextApiRequest, NextApiResponse } from 'next';
import { impersonate, ImpersonationTypeEnum } from './impersonateHelper';

const impersonateUser = async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  try {
    const impersonateResponse = await impersonate(
      req,
      ImpersonationTypeEnum.USER,
    );
    const status = Number(impersonateResponse.status);
    const success = status === 200;
    const errors = impersonateResponse.errors;

    if (impersonateResponse.invalidRequest) {
      res.status(status).send(impersonateResponse.errors[0].detail);
      return;
    }

    res.setHeader('Set-Cookie', [...new Set(impersonateResponse.cookies)]);
    res.status(status).json({ success, errors });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

export default impersonateUser;
