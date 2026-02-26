import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/src/lib/prisma";

export type DbTxClient = Prisma.TransactionClient;

type TxOptions = {
  isolationLevel?: Prisma.TransactionIsolationLevel;
};

export async function withDbTransaction<T>(
  fn: (tx: DbTxClient) => Promise<T>,
  options?: TxOptions,
): Promise<T> {
  return prisma.$transaction(
    async (tx) => fn(tx),
    options?.isolationLevel
      ? { isolationLevel: options.isolationLevel }
      : undefined,
  );
}

export function asDbClient(client?: DbTxClient): PrismaClient | DbTxClient {
  return client ?? prisma;
}
