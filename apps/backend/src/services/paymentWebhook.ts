import type { Request, Response } from "express";
import type { Pool } from "pg";
import { reconcileMomoPayment } from "./paymentReconciliation";

export const momoWebhookHandler = (pool: Pool) => {
  return async (req: Request, res: Response) => {
    const { paymentId, amount, momoTransactionId, debitAccount, creditAccount } =
      req.body as {
        paymentId: string;
        amount: number;
        momoTransactionId: string;
        debitAccount: string;
        creditAccount: string;
      };

    const result = await reconcileMomoPayment(pool, {
      paymentId,
      amount,
      momoTransactionId,
      debitAccount,
      creditAccount
    });

    return res.status(200).json(result);
  };
};
