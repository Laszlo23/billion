import type { ReferenceType, TransactionType } from "@prisma/client";

import type { DbTxClient } from "@/src/lib/db/tx";

export type PicksAmount = bigint;

export type PicksReference = {
  referenceType: ReferenceType;
  referenceId: string;
  metadata?: Record<string, unknown>;
  counterpartyUserId?: string;
};

export type BalanceSnapshot = {
  userId: string;
  picksBalance: PicksAmount;
  reservedBalance: PicksAmount;
  availableBalance: PicksAmount;
};

export type PicksProvider = {
  getBalance(userId: string, tx?: DbTxClient): Promise<BalanceSnapshot>;
  credit(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
    tx?: DbTxClient,
  ): Promise<BalanceSnapshot>;
  debit(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
    tx?: DbTxClient,
  ): Promise<BalanceSnapshot>;
  reserve(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
    tx?: DbTxClient,
  ): Promise<BalanceSnapshot>;
  releaseReserve(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
    tx?: DbTxClient,
  ): Promise<BalanceSnapshot>;
};

export type LedgerLogInput = {
  userId: string;
  type: TransactionType;
  amount: PicksAmount;
  reference: PicksReference;
};
