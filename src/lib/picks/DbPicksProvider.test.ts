import { describe, expect, it } from "vitest";

import {
  DbPicksProvider,
  PicksInsufficientBalanceError,
} from "./DbPicksProvider";

function createFakeTx(initialBalance = BigInt(1000)) {
  const state = {
    user: {
      id: "u1",
      picksBalance: initialBalance,
      reservedBalance: BigInt(0),
    },
    logs: new Map<string, { id: string }>(),
  };

  const tx = {
    user: {
      findUnique: async () => ({ ...state.user }),
      update: async ({ data }: { data: Record<string, { increment?: bigint; decrement?: bigint }> }) => {
        if (data.picksBalance?.increment) {
          state.user.picksBalance += data.picksBalance.increment;
        }
        if (data.picksBalance?.decrement) {
          state.user.picksBalance -= data.picksBalance.decrement;
        }
        if (data.reservedBalance?.increment) {
          state.user.reservedBalance += data.reservedBalance.increment;
        }
        if (data.reservedBalance?.decrement) {
          state.user.reservedBalance -= data.reservedBalance.decrement;
        }
        return { ...state.user };
      },
    },
    transactionLog: {
      findUnique: async ({ where }: { where: { referenceType_referenceId_type_userId: { referenceType: string; referenceId: string; type: string; userId: string } } }) => {
        const key = JSON.stringify(where.referenceType_referenceId_type_userId);
        return state.logs.get(key) ?? null;
      },
      create: async ({ data }: { data: { referenceType: string; referenceId: string; type: string; userId: string } }) => {
        const key = JSON.stringify({
          referenceType: data.referenceType,
          referenceId: data.referenceId,
          type: data.type,
          userId: data.userId,
        });
        state.logs.set(key, { id: crypto.randomUUID() });
        return { id: state.logs.get(key)?.id };
      },
    },
  };

  return { tx: tx as never, state };
}

describe("DbPicksProvider", () => {
  it("credits balance and logs once for duplicate event", async () => {
    const provider = new DbPicksProvider();
    const { tx, state } = createFakeTx(BigInt(0));
    const reference = { referenceType: "admin_adjustment" as const, referenceId: "ev1" };

    await provider.credit("u1", BigInt(100), reference, tx);
    await provider.credit("u1", BigInt(100), reference, tx);

    expect(state.user.picksBalance).toBe(BigInt(100));
    expect(state.logs.size).toBe(1);
  });

  it("blocks debit when available balance is too low", async () => {
    const provider = new DbPicksProvider();
    const { tx } = createFakeTx(BigInt(20));
    const reference = { referenceType: "admin_adjustment" as const, referenceId: "ev2" };

    await expect(provider.debit("u1", BigInt(50), reference, tx)).rejects.toBeInstanceOf(
      PicksInsufficientBalanceError,
    );
  });

  it("reserves and releases balance in integer units", async () => {
    const provider = new DbPicksProvider();
    const { tx, state } = createFakeTx(BigInt(500));

    await provider.reserve(
      "u1",
      BigInt(100),
      { referenceType: "task_creation", referenceId: "task1" },
      tx,
    );
    await provider.releaseReserve(
      "u1",
      BigInt(100),
      { referenceType: "task_deletion", referenceId: "task1" },
      tx,
    );

    expect(state.user.reservedBalance).toBe(BigInt(0));
    expect(state.logs.size).toBe(2);
  });
});
