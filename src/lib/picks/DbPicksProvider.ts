import { Prisma, type Prisma as PrismaTypes } from "@prisma/client";

import { asDbClient } from "@/src/lib/db/tx";
import type { DbTxClient } from "@/src/lib/db/tx";
import type {
  BalanceSnapshot,
  LedgerLogInput,
  PicksAmount,
  PicksProvider,
  PicksReference,
} from "@/src/lib/picks/types";

export class PicksError extends Error {}

export class PicksValidationError extends PicksError {}

export class PicksNotFoundError extends PicksError {}

export class PicksInsufficientBalanceError extends PicksError {}

function assertPositiveAmount(amount: PicksAmount) {
  if (amount <= BigInt(0)) {
    throw new PicksValidationError("Amount must be greater than zero.");
  }
}

function toSnapshot(user: {
  id: string;
  picksBalance: bigint;
  reservedBalance: bigint;
}): BalanceSnapshot {
  return {
    userId: user.id,
    picksBalance: user.picksBalance,
    reservedBalance: user.reservedBalance,
    availableBalance: user.picksBalance - user.reservedBalance,
  };
}

export class DbPicksProvider implements PicksProvider {
  async getBalance(userId: string, tx?: DbTxClient): Promise<BalanceSnapshot> {
    const db = asDbClient(tx);
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, picksBalance: true, reservedBalance: true },
    });

    if (!user) {
      throw new PicksNotFoundError("User not found.");
    }

    return toSnapshot(user);
  }

  async credit(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
    tx?: DbTxClient,
  ): Promise<BalanceSnapshot> {
    assertPositiveAmount(amount);
    const db = asDbClient(tx);
    const duplicate = await this.hasExistingLog(
      {
        userId,
        amount,
        type: "earn",
        reference,
      },
      tx,
    );
    if (duplicate) return this.getBalance(userId, tx);

    const user = await db.user.update({
      where: { id: userId },
      data: { picksBalance: { increment: amount } },
      select: { id: true, picksBalance: true, reservedBalance: true },
    });

    await this.createLog(
      {
        userId,
        amount,
        type: "earn",
        reference,
      },
      tx,
    );

    return toSnapshot(user);
  }

  async debit(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
    tx?: DbTxClient,
  ): Promise<BalanceSnapshot> {
    assertPositiveAmount(amount);
    const db = asDbClient(tx);
    const duplicate = await this.hasExistingLog(
      {
        userId,
        amount,
        type: "spend",
        reference,
      },
      tx,
    );
    if (duplicate) return this.getBalance(userId, tx);

    const current = await this.getBalance(userId, tx);
    if (current.availableBalance < amount) {
      throw new PicksInsufficientBalanceError("Insufficient available balance.");
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { picksBalance: { decrement: amount } },
      select: { id: true, picksBalance: true, reservedBalance: true },
    });

    await this.createLog(
      {
        userId,
        amount,
        type: "spend",
        reference,
      },
      tx,
    );

    return toSnapshot(user);
  }

  async reserve(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
    tx?: DbTxClient,
  ): Promise<BalanceSnapshot> {
    assertPositiveAmount(amount);
    const db = asDbClient(tx);
    const duplicate = await this.hasExistingLog(
      {
        userId,
        amount,
        type: "reserve",
        reference,
      },
      tx,
    );
    if (duplicate) return this.getBalance(userId, tx);

    const current = await this.getBalance(userId, tx);
    if (current.availableBalance < amount) {
      throw new PicksInsufficientBalanceError("Insufficient available balance.");
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { reservedBalance: { increment: amount } },
      select: { id: true, picksBalance: true, reservedBalance: true },
    });

    await this.createLog(
      {
        userId,
        amount,
        type: "reserve",
        reference,
      },
      tx,
    );

    return toSnapshot(user);
  }

  async releaseReserve(
    userId: string,
    amount: PicksAmount,
    reference: PicksReference,
    tx?: DbTxClient,
  ): Promise<BalanceSnapshot> {
    assertPositiveAmount(amount);
    const db = asDbClient(tx);
    const duplicate = await this.hasExistingLog(
      {
        userId,
        amount,
        type: "release",
        reference,
      },
      tx,
    );
    if (duplicate) return this.getBalance(userId, tx);

    const current = await this.getBalance(userId, tx);
    if (current.reservedBalance < amount) {
      throw new PicksInsufficientBalanceError(
        "Cannot release more than reserved balance.",
      );
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { reservedBalance: { decrement: amount } },
      select: { id: true, picksBalance: true, reservedBalance: true },
    });

    await this.createLog(
      {
        userId,
        amount,
        type: "release",
        reference,
      },
      tx,
    );

    return toSnapshot(user);
  }

  private async createLog(input: LedgerLogInput, tx?: DbTxClient) {
    const db = asDbClient(tx);
    try {
      await db.transactionLog.create({
        data: {
          userId: input.userId,
          type: input.type,
          amount: input.amount,
          referenceType: input.reference.referenceType,
          referenceId: input.reference.referenceId,
          counterpartyUserId: input.reference.counterpartyUserId,
          metadata: input.reference.metadata as PrismaTypes.InputJsonValue | undefined,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // Idempotent duplicate event handling.
        return;
      }
      throw error;
    }
  }

  private async hasExistingLog(input: LedgerLogInput, tx?: DbTxClient) {
    const db = asDbClient(tx);
    const existing = await db.transactionLog.findUnique({
      where: {
        referenceType_referenceId_type_userId: {
          referenceType: input.reference.referenceType,
          referenceId: input.reference.referenceId,
          type: input.type,
          userId: input.userId,
        },
      },
      select: { id: true },
    });
    return Boolean(existing);
  }
}
