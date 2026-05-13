import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

function generateWebhookSignature(transaction: any): string {
  const crypto = require('crypto');
  return crypto
    .createHash('sha256')
    .update(transaction.id + transaction.amount + process.env.WEBHOOK_SECRET)
    .digest('hex');
}

export async function releaseHoldingBalance() {
  const lockKey = "cron:release-balance:lock";
  const acquired = await redis.setnx(lockKey, Date.now().toString());
  
  if (!acquired) {
    console.log("[CRON] Job already running, skipping...");
    return;
  }

  try {
    await redis.expire(lockKey, 300);

    console.log("[CRON] Checking for holding transactions to release...");
    const holdingTransactions = await prisma.transaction.findMany({
      where: {
        status: "HOLDING",
        holdingUntil: {
          lte: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    console.log(`[CRON] Found ${holdingTransactions.length} transactions to release`);

    for (const transaction of holdingTransactions) {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: "RELEASED",
              releasedAt: new Date(),
            },
          });

          await tx.settlement.updateMany({
            where: { transactionId: transaction.id },
            data: {
              status: "RELEASED",
              releasedAt: new Date(),
            },
          });
          
          await tx.balance.update({
            where: { userId: transaction.userId },
            data: {
              holdingBalance: { decrement: transaction.amount },
              availableBalance: { increment: transaction.amount },
            },
          });
          
          await tx.notification.create({
            data: {
              userId: transaction.userId,
              title: "💰 Balance succes!",
              message: `Rp ${transaction.amount.toLocaleString()} has been released to your available balance after 24-hour holding period.`,
              type: "BALANCE_RELEASED",
              data: {
                transactionId: transaction.transactionId,
                amount: transaction.amount,
                releasedAt: new Date().toISOString(),
              },
            },
          });

          const webhook = await tx.webhook.findFirst({
            where: {
              userId: transaction.userId,
              isActive: true,
              events: { has: "balance.released" },
            },
          });

          if (webhook) {
            await fetch(webhook.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Webhook-Signature": generateWebhookSignature(transaction),
              },
              body: JSON.stringify({
                event: "balance.released",
                transactionId: transaction.transactionId,
                amount: transaction.amount,
                releasedAt: new Date().toISOString(),
              }),
            }).catch(err => console.error(`[CRON] Webhook failed for ${transaction.transactionId}:`, err));
          }
        });

        console.log(`[CRON] Released balance for transaction: ${transaction.transactionId}`);
      } catch (err) {
        console.error(`[CRON] Failed to release transaction ${transaction.transactionId}:`, err);
      }
    }
  } catch (error) {
    console.error("[CRON] Error releasing balances:", error);
  } finally {
    await redis.del(lockKey);
    console.log("[CRON] Job completed, lock released");
  }
}

if (process.env.NODE_ENV === "development") {
  setInterval(releaseHoldingBalance, 5 * 60 * 1000);
                }
