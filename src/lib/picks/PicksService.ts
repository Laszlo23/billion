import { Prisma } from "@prisma/client";

import { withDbTransaction } from "@/src/lib/db/tx";
import { DbPicksProvider } from "@/src/lib/picks/DbPicksProvider";
import type { BalanceSnapshot, PicksAmount, PicksReference } from "@/src/lib/picks/types";

const provider = new DbPicksProvider();

export class PicksService {
  static async getBalance(userId: string): Promise<BalanceSnapshot> {
    return provider.getBalance(userId);
  }

  static async credit(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
  ): Promise<BalanceSnapshot> {
    return withDbTransaction(
      (tx) => provider.credit(userId, amount, reference, tx),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  static async debit(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
  ): Promise<BalanceSnapshot> {
    return withDbTransaction(
      (tx) => provider.debit(userId, amount, reference, tx),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  static async reserve(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
  ): Promise<BalanceSnapshot> {
    return withDbTransaction(
      (tx) => provider.reserve(userId, amount, reference, tx),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  static async releaseReserve(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
  ): Promise<BalanceSnapshot> {
    return withDbTransaction(
      (tx) => provider.releaseReserve(userId, amount, reference, tx),
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }
}
