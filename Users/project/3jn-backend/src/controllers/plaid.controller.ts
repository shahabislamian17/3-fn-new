import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/middleware/auth.middleware';
import { plaidClient } from '@/core/plaid';

export const createLinkToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const resp = await plaidClient.linkTokenCreate({
      user: { client_user_id: user.id },
      client_name: "3JN Fund",
      products: ["auth"],
      country_codes: ["US"],
      language: "en",
    });
    res.json({ link_token: resp.data.link_token });
  } catch (err) {
    next(err);
  }
};

export const exchangePublicToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { public_token } = req.body;
    const exchange = await plaidClient.itemPublicTokenExchange({ public_token });
    res.json({
      access_token: exchange.data.access_token,
      item_id: exchange.data.item_id,
    });
  } catch (err) {
    next(err);
  }
};

export const createProcessorToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { access_token, account_id } = req.body;
    const response = await plaidClient.processorStripeBankAccountTokenCreate({
      access_token,
      account_id,
    });
    res.json({
      stripe_bank_account_token: response.data.stripe_bank_account_token,
    });
  } catch (err) {
    next(err);
  }
};
