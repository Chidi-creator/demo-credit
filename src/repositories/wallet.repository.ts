import { IWallet } from "@models/wallet";
import db from "@db/mysql";

import { BaseRepository } from "./base.repository";
import { DatabaseError } from "@managers/error.manager";
import logger from "@services/logger.service";

class WalletRepository extends BaseRepository<IWallet> {
  protected table = "wallets";

  //handle race and concurrency issues by locking rows involved in transaction
  async handleInternalWalletTransfer(
    senderWalletId: number,
    receiverWalletId: number,
    amount: number
  ): Promise<void> {
    try {
      await db.transaction(async (trx) => {
        //lock sender wallet
        const senderWallet = await trx<IWallet>("wallets")
          .where({ id: senderWalletId })
          .forUpdate()
          .first();

        if (!senderWallet) {
          throw new DatabaseError(`Sender wallet not found: ${senderWalletId}`);
        }

        if (
          senderWallet.balance === undefined ||
          senderWallet.balance < amount
        ) {
          throw new DatabaseError(`Insufficient balance in sender's wallet`);
        }

        //lock receiver wallet
        const receiverWallet = await trx<IWallet>("wallets")
          .where({ id: receiverWalletId })
          .forUpdate()
          .first();

        if (!receiverWallet) {
          throw new DatabaseError(
            `Receiver wallet not found: ${receiverWalletId}`
          );
        }

        //perform balance updates
        await trx<IWallet>("wallets")
          .where({ id: senderWalletId })
          .update({
            balance: senderWallet.balance - amount,
          });

        await trx<IWallet>(this.table)
          .where({ id: receiverWalletId })
          .update({ balance: receiverWallet.balance! + amount });
      });
    } catch (error) {
      throw new DatabaseError(
        `Error handling internal wallet transfer: ${error}`
      );
    }
  }
}

export default WalletRepository;
