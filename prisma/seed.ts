import {
  PrismaClient,
  OnboardingQuestPersona,
  OnboardingQuestTriggerType,
  ReferenceType,
  SocialConnectionStatus,
  SubmissionStatus,
  TaskEventType,
  TaskPlatform,
  TaskStatus,
  TransactionType,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

const restaurantSeeds = [
  { name: "Sunset Bistro", slug: "sunset-bistro", lat: 40.7128, lng: -74.006, budget: 4_600_000n },
  { name: "Ocean Bowl", slug: "ocean-bowl", lat: 34.0522, lng: -118.2437, budget: 4_200_000n },
  { name: "Night Market Grill", slug: "night-market-grill", lat: 51.5072, lng: -0.1276, budget: 5_100_000n },
  { name: "Garden Pasta House", slug: "garden-pasta-house", lat: 45.4642, lng: 9.19, budget: 4_000_000n },
  { name: "Smoky Barrel BBQ", slug: "smoky-barrel-bbq", lat: 41.8781, lng: -87.6298, budget: 4_900_000n },
  { name: "Golden Lantern Pho", slug: "golden-lantern-pho", lat: 10.8231, lng: 106.6297, budget: 4_350_000n },
  { name: "Bluefin Sushi Lab", slug: "bluefin-sushi-lab", lat: 35.6762, lng: 139.6503, budget: 5_500_000n },
  { name: "Olive & Ember", slug: "olive-and-ember", lat: 37.9838, lng: 23.7275, budget: 3_900_000n },
  { name: "Seoul Street Kitchen", slug: "seoul-street-kitchen", lat: 37.5665, lng: 126.978, budget: 4_550_000n },
  { name: "Taco Republic", slug: "taco-republic", lat: 19.4326, lng: -99.1332, budget: 4_300_000n },
  { name: "Firebrick Pizza Co.", slug: "firebrick-pizza-co", lat: 48.8566, lng: 2.3522, budget: 4_750_000n },
  { name: "Harbor Brunch Club", slug: "harbor-brunch-club", lat: 59.3293, lng: 18.0686, budget: 4_150_000n },
];

type MenuTemplate = {
  category: string;
  items: Array<[string, bigint]>;
};

const menuTemplates: MenuTemplate[] = [
  {
    category: "Burgers & Grill",
    items: [
      ["Classic Beef Burger", 890n],
      ["Cheddar Smash Burger", 950n],
      ["Crispy Chicken Burger", 920n],
      ["House Fries", 420n],
    ],
  },
  {
    category: "Cozy Plates",
    items: [
      ["Creamy Truffle Pasta", 1290n],
      ["Roasted Chicken Bowl", 1190n],
      ["Herb Salmon Plate", 1390n],
      ["Veggie Comfort Bowl", 1090n],
    ],
  },
  {
    category: "Drinks & Sweet",
    items: [
      ["Sparkling Lemonade", 390n],
      ["Berry Iced Tea", 420n],
      ["Vanilla Cheesecake", 590n],
      ["Warm Choco Cookie", 520n],
    ],
  },
];

const taskTemplates = [
  {
    title: "Share an Instagram story with your dish from {restaurant}",
    platform: TaskPlatform.instagram,
  },
  {
    title: "Post an Instagram feed photo of your meal at {restaurant}",
    platform: TaskPlatform.instagram,
  },
  {
    title: "Post a TikTok first-bite video at {restaurant}",
    platform: TaskPlatform.tiktok,
  },
  {
    title: "Write a Google review with one dish image for {restaurant}",
    platform: TaskPlatform.google_review,
  },
  {
    title: "Post a duo dish photo from {restaurant} and tag location",
    platform: TaskPlatform.instagram,
  },
  {
    title: "LinkedIn mission: Share your lunch recommendation for {restaurant}",
    platform: TaskPlatform.linkedin,
  },
  {
    title: "Post a before-and-after meal update featuring {restaurant}",
    platform: TaskPlatform.linkedin,
  },
  {
    title: "Film a 10-second ambience clip from {restaurant} for TikTok",
    platform: TaskPlatform.tiktok,
  },
  {
    title: "Upload a YouTube Shorts dish ranking from {restaurant}",
    platform: TaskPlatform.youtube,
  },
  {
    title: "Post a simple visit recap from {restaurant}",
    platform: TaskPlatform.other,
  },
  {
    title: "Upload a 3-slide Instagram carousel of your meal at {restaurant}",
    platform: TaskPlatform.instagram,
  },
  {
    title: "Create a TikTok trend-style dish reaction at {restaurant}",
    platform: TaskPlatform.tiktok,
  },
  {
    title: "Post a YouTube Shorts table-to-dish reveal from {restaurant}",
    platform: TaskPlatform.youtube,
  },
  {
    title: "Share a team lunch story from {restaurant} on LinkedIn",
    platform: TaskPlatform.linkedin,
  },
];

const taskDescriptions = [
  "Keep your post public for 24h and show dish + restaurant name clearly.",
  "Use one clear image or short video. Mention the dish and location.",
  "One task = one proof upload. Clear proof gets approved faster.",
  "Simple tasks work best: one action, one post, one proof.",
  "Natural content performs best: show the meal, venue, and your honest reaction.",
  "Mobile-first missions: one platform, one proof, one reward cycle.",
];

const onboardingQuestSeeds: Array<{
  key: string;
  title: string;
  description: string;
  persona: OnboardingQuestPersona;
  triggerType: OnboardingQuestTriggerType;
  targetCount: number;
  rewardPicks: bigint;
  rewardXp: number;
}> = [
  {
    key: "player_first_submission",
    title: "Drop your first mission proof",
    description: "Submit one mission proof to start your player journey.",
    persona: OnboardingQuestPersona.player,
    triggerType: OnboardingQuestTriggerType.mission_submitted,
    targetCount: 1,
    rewardPicks: 40n,
    rewardXp: 30,
  },
  {
    key: "player_first_approval",
    title: "Get your first approval",
    description: "Receive one approved submission to unlock bonus momentum.",
    persona: OnboardingQuestPersona.player,
    triggerType: OnboardingQuestTriggerType.submission_approved,
    targetCount: 1,
    rewardPicks: 80n,
    rewardXp: 60,
  },
  {
    key: "player_social_verified",
    title: "Verify one social profile",
    description: "Connect and verify one social account for better mission matching.",
    persona: OnboardingQuestPersona.player,
    triggerType: OnboardingQuestTriggerType.social_verified,
    targetCount: 1,
    rewardPicks: 60n,
    rewardXp: 50,
  },
  {
    key: "player_daily_claim",
    title: "Claim your daily boost",
    description: "Use your daily claim once to keep your streak alive.",
    persona: OnboardingQuestPersona.player,
    triggerType: OnboardingQuestTriggerType.daily_claim,
    targetCount: 1,
    rewardPicks: 50n,
    rewardXp: 40,
  },
  {
    key: "player_referral_conversion",
    title: "Bring one friend who converts",
    description: "Get one referral to complete a qualifying action.",
    persona: OnboardingQuestPersona.player,
    triggerType: OnboardingQuestTriggerType.referral_conversion,
    targetCount: 1,
    rewardPicks: 120n,
    rewardXp: 90,
  },
  {
    key: "venue_menu_live",
    title: "Publish your venue",
    description: "Complete onboarding and take your venue live.",
    persona: OnboardingQuestPersona.venue,
    triggerType: OnboardingQuestTriggerType.restaurant_onboarded,
    targetCount: 1,
    rewardPicks: 150n,
    rewardXp: 0,
  },
  {
    key: "venue_first_task",
    title: "Launch your first mission",
    description: "Create your first customer mission campaign.",
    persona: OnboardingQuestPersona.venue,
    triggerType: OnboardingQuestTriggerType.task_created,
    targetCount: 1,
    rewardPicks: 120n,
    rewardXp: 0,
  },
  {
    key: "venue_first_review",
    title: "Review your first submission",
    description: "Approve or reject one incoming mission proof.",
    persona: OnboardingQuestPersona.venue,
    triggerType: OnboardingQuestTriggerType.submission_reviewed,
    targetCount: 1,
    rewardPicks: 140n,
    rewardXp: 0,
  },
];

async function upsertTaskByTitle(data: {
  restaurantId: string;
  title: string;
  description: string;
  platform: TaskPlatform;
  rewardAmount: bigint;
  status: TaskStatus;
}) {
  const existing = await prisma.task.findFirst({
    where: { restaurantId: data.restaurantId, title: data.title },
  });
  if (existing) {
    return prisma.task.update({
      where: { id: existing.id },
      data: {
        description: data.description,
        platform: data.platform,
        rewardAmount: data.rewardAmount,
        status: data.status,
      },
    });
  }
  return prisma.task.create({ data });
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@billion.local" },
    update: { role: UserRole.admin },
    create: { email: "admin@billion.local", role: UserRole.admin },
  });

  const owners = await Promise.all(
    restaurantSeeds.map((seed) =>
      prisma.user.upsert({
        where: { email: `owner+${seed.slug}@billion.local` },
        update: {
          role: UserRole.restaurant,
          picksBalance: seed.budget,
          reservedBalance: 0n,
        },
        create: {
          email: `owner+${seed.slug}@billion.local`,
          role: UserRole.restaurant,
          picksBalance: seed.budget,
          reservedBalance: 0n,
        },
      }),
    ),
  );

  const taskers = await Promise.all(
    Array.from({ length: 24 }).map((_, index) =>
      prisma.user.upsert({
        where: { email: `tasker+${String(index + 1).padStart(2, "0")}@billion.local` },
        update: { role: UserRole.user, reservedBalance: 0n },
        create: {
          email: `tasker+${String(index + 1).padStart(2, "0")}@billion.local`,
          role: UserRole.user,
          picksBalance: 0n,
          reservedBalance: 0n,
        },
      }),
    ),
  );

  const restaurants = await Promise.all(
    restaurantSeeds.map((seed, index) =>
      prisma.restaurant.upsert({
        where: { slug: seed.slug },
        update: {
          ownerId: owners[index].id,
          name: seed.name,
          latitude: seed.lat,
          longitude: seed.lng,
          district:
            index % 3 === 0 ? "District 1" : index % 3 === 1 ? "District 2" : "District 7",
        },
        create: {
          ownerId: owners[index].id,
          name: seed.name,
          slug: seed.slug,
          latitude: seed.lat,
          longitude: seed.lng,
          district:
            index % 3 === 0 ? "District 1" : index % 3 === 1 ? "District 2" : "District 7",
        },
      }),
    ),
  );

  await prisma.gamificationSeed.createMany({
    data: [
      { city: "Vienna", district: "District 1", restaurantsActive: 5, restaurantsTarget: 20 },
      { city: "Vienna", district: "District 2", restaurantsActive: 3, restaurantsTarget: 20 },
      { city: "Vienna", district: "District 7", restaurantsActive: 2, restaurantsTarget: 20 },
    ],
    skipDuplicates: true,
  });

  for (const quest of onboardingQuestSeeds) {
    await prisma.onboardingQuest.upsert({
      where: { key: quest.key },
      update: {
        title: quest.title,
        description: quest.description,
        persona: quest.persona,
        triggerType: quest.triggerType,
        targetCount: quest.targetCount,
        rewardPicks: quest.rewardPicks,
        rewardXp: quest.rewardXp,
        active: true,
      },
      create: {
        key: quest.key,
        title: quest.title,
        description: quest.description,
        persona: quest.persona,
        triggerType: quest.triggerType,
        targetCount: quest.targetCount,
        rewardPicks: quest.rewardPicks,
        rewardXp: quest.rewardXp,
        active: true,
      },
    });
  }

  for (const [restIndex, restaurant] of restaurants.entries()) {
    for (const [menuIndex, template] of menuTemplates.entries()) {
      const category = await prisma.menuCategory.upsert({
        where: {
          restaurantId_name: {
            restaurantId: restaurant.id,
            name: `${template.category} ${menuIndex + 1}`,
          },
        },
        update: {},
        create: {
          restaurantId: restaurant.id,
          name: `${template.category} ${menuIndex + 1}`,
        },
      });

      for (const [itemIndex, [itemName, basePrice]] of template.items.entries()) {
        const adjustedPrice = basePrice + BigInt(restIndex * 20 + itemIndex * 15);
        await prisma.menuItem.upsert({
          where: {
            categoryId_name: {
              categoryId: category.id,
              name: itemName,
            },
          },
          update: { price: adjustedPrice, currency: "EUR" },
          create: {
            categoryId: category.id,
            name: itemName,
            price: adjustedPrice,
            currency: "EUR",
          },
        });
      }
    }
  }

  const tasks = [];
  for (const [restaurantIndex, restaurant] of restaurants.entries()) {
    for (let i = 0; i < taskTemplates.length; i++) {
      const statusSelector = (restaurantIndex + i) % 12;
      const status =
        statusSelector < 7
          ? TaskStatus.active
          : statusSelector < 10
            ? TaskStatus.paused
            : TaskStatus.deleted;
      const rewardAmount = BigInt(90 + ((restaurantIndex * 17 + i * 23) % 240));
      const title = taskTemplates[i].title.replace("{restaurant}", restaurant.name);
      const description =
        taskTemplates[i].platform === TaskPlatform.linkedin
          ? "Write a short LinkedIn post, mention the restaurant name, and upload one clear proof screenshot."
          : taskDescriptions[(restaurantIndex + i) % taskDescriptions.length];
      const task = await upsertTaskByTitle({
        restaurantId: restaurant.id,
        title,
        description,
        platform: taskTemplates[i].platform,
        rewardAmount,
        status,
      });
      tasks.push(task);
    }
  }

  const now = Date.now();
  const submissionsSeed: Array<{
    taskId: string;
    userId: string;
    proofUrl: string;
    status: SubmissionStatus;
    createdAt: Date;
  }> = [];

  for (const [taskIndex, task] of tasks.entries()) {
    const submissionsPerTask = taskIndex < 24 ? 3 : 2;
    for (let slot = 0; slot < submissionsPerTask; slot++) {
      const tasker = taskers[(taskIndex * 7 + slot * 5) % taskers.length];
      const statusSelector = (taskIndex + slot) % 6;
      let status: SubmissionStatus;
      if (task.status === TaskStatus.deleted) {
        status = statusSelector % 2 === 0 ? SubmissionStatus.rejected : SubmissionStatus.pending;
      } else {
        status =
          statusSelector === 0 || statusSelector === 4
            ? SubmissionStatus.pending
            : statusSelector === 3
              ? SubmissionStatus.rejected
              : SubmissionStatus.approved;
      }
      submissionsSeed.push({
        taskId: task.id,
        userId: tasker.id,
        proofUrl: `/uploads/proof/demo-proof-${((taskIndex + slot) % 12) + 1}.jpg`,
        status,
        createdAt: new Date(now - (taskIndex * 40 + slot * 15) * 60 * 1000),
      });
    }
  }

  const submissions = [];
  for (const submission of submissionsSeed) {
    const record = await prisma.taskSubmission.upsert({
      where: {
        taskId_userId: {
          taskId: submission.taskId,
          userId: submission.userId,
        },
      },
      update: {
        proofUrl: submission.proofUrl,
        status: submission.status,
      },
      create: submission,
    });
    submissions.push(record);
  }

  const ownerState = new Map<string, { picksBalance: bigint; reservedBalance: bigint }>();
  const taskerPicks = new Map<string, bigint>();
  const taskerApprovedCount = new Map<string, number>();
  const taskerRejectedCount = new Map<string, number>();

  for (const [index, owner] of owners.entries()) {
    ownerState.set(owner.id, {
      picksBalance: restaurantSeeds[index].budget,
      reservedBalance: 0n,
    });
  }
  for (const tasker of taskers) {
    taskerPicks.set(tasker.id, 0n);
    taskerApprovedCount.set(tasker.id, 0);
    taskerRejectedCount.set(tasker.id, 0);
  }

  for (const owner of owners) {
    await prisma.transactionLog.upsert({
      where: {
        referenceType_referenceId_type_userId: {
          referenceType: ReferenceType.admin_adjustment,
          referenceId: `seed-adjustment-${owner.id}`,
          type: TransactionType.adjustment,
          userId: owner.id,
        },
      },
      update: {
        amount: ownerState.get(owner.id)?.picksBalance ?? 0n,
      },
      create: {
        userId: owner.id,
        type: TransactionType.adjustment,
        amount: ownerState.get(owner.id)?.picksBalance ?? 0n,
        referenceType: ReferenceType.admin_adjustment,
        referenceId: `seed-adjustment-${owner.id}`,
        metadata: { seed: true, adminId: admin.id },
      },
    });
  }

  const taskById = new Map(tasks.map((task) => [task.id, task]));
  const restaurantById = new Map(restaurants.map((restaurant) => [restaurant.id, restaurant]));
  const ownerByRestaurantId = new Map(restaurants.map((r) => [r.id, r.ownerId]));

  for (const task of tasks) {
    const ownerId = ownerByRestaurantId.get(task.restaurantId);
    if (!ownerId) continue;
    const owner = ownerState.get(ownerId);
    if (!owner) continue;
    owner.reservedBalance += task.rewardAmount;

    await prisma.transactionLog.upsert({
      where: {
        referenceType_referenceId_type_userId: {
          referenceType: ReferenceType.task_creation,
          referenceId: task.id,
          type: TransactionType.reserve,
          userId: ownerId,
        },
      },
      update: { amount: task.rewardAmount },
      create: {
        userId: ownerId,
        type: TransactionType.reserve,
        amount: task.rewardAmount,
        referenceType: ReferenceType.task_creation,
        referenceId: task.id,
        metadata: {
          seed: true,
          restaurantSlug: restaurantById.get(task.restaurantId)?.slug ?? null,
        },
      },
    });

    if (task.status === TaskStatus.deleted) {
      owner.reservedBalance -= task.rewardAmount;
      await prisma.transactionLog.upsert({
        where: {
          referenceType_referenceId_type_userId: {
            referenceType: ReferenceType.task_deletion,
            referenceId: task.id,
            type: TransactionType.release,
            userId: ownerId,
          },
        },
        update: { amount: task.rewardAmount },
        create: {
          userId: ownerId,
          type: TransactionType.release,
          amount: task.rewardAmount,
          referenceType: ReferenceType.task_deletion,
          referenceId: task.id,
          metadata: { seed: true, reason: "task_deleted" },
        },
      });
    }
  }

  for (const submission of submissions) {
    if (submission.status === SubmissionStatus.pending) continue;
    const task = taskById.get(submission.taskId);
    if (!task) continue;
    const ownerId = ownerByRestaurantId.get(task.restaurantId);
    if (!ownerId) continue;

    if (submission.status === SubmissionStatus.approved) {
      const owner = ownerState.get(ownerId);
      if (!owner) continue;
      owner.reservedBalance -= task.rewardAmount;
      owner.picksBalance -= task.rewardAmount;
      taskerPicks.set(
        submission.userId,
        (taskerPicks.get(submission.userId) ?? 0n) + task.rewardAmount,
      );
      taskerApprovedCount.set(
        submission.userId,
        (taskerApprovedCount.get(submission.userId) ?? 0) + 1,
      );

      const approvalRef = `seed-approval-${submission.taskId}-${submission.userId}`;
      await prisma.transactionLog.upsert({
        where: {
          referenceType_referenceId_type_userId: {
            referenceType: ReferenceType.submission_approval,
            referenceId: approvalRef,
            type: TransactionType.release,
            userId: ownerId,
          },
        },
        update: { amount: task.rewardAmount, counterpartyUserId: submission.userId },
        create: {
          userId: ownerId,
          type: TransactionType.release,
          amount: task.rewardAmount,
          referenceType: ReferenceType.submission_approval,
          referenceId: approvalRef,
          counterpartyUserId: submission.userId,
          metadata: { seed: true, taskId: submission.taskId },
        },
      });

      await prisma.transactionLog.upsert({
        where: {
          referenceType_referenceId_type_userId: {
            referenceType: ReferenceType.submission_approval,
            referenceId: approvalRef,
            type: TransactionType.spend,
            userId: ownerId,
          },
        },
        update: { amount: task.rewardAmount, counterpartyUserId: submission.userId },
        create: {
          userId: ownerId,
          type: TransactionType.spend,
          amount: task.rewardAmount,
          referenceType: ReferenceType.submission_approval,
          referenceId: approvalRef,
          counterpartyUserId: submission.userId,
          metadata: { seed: true, taskId: submission.taskId },
        },
      });

      await prisma.transactionLog.upsert({
        where: {
          referenceType_referenceId_type_userId: {
            referenceType: ReferenceType.submission_approval,
            referenceId: approvalRef,
            type: TransactionType.earn,
            userId: submission.userId,
          },
        },
        update: { amount: task.rewardAmount, counterpartyUserId: ownerId },
        create: {
          userId: submission.userId,
          type: TransactionType.earn,
          amount: task.rewardAmount,
          referenceType: ReferenceType.submission_approval,
          referenceId: approvalRef,
          counterpartyUserId: ownerId,
          metadata: { seed: true, taskId: submission.taskId },
        },
      });
    } else if (submission.status === SubmissionStatus.rejected) {
      taskerRejectedCount.set(
        submission.userId,
        (taskerRejectedCount.get(submission.userId) ?? 0) + 1,
      );
    }
  }

  for (const [index, tasker] of taskers.entries()) {
    if (index >= 12) break;
    const adView = await prisma.adPlaceholderView.upsert({
      where: { id: `seed-adview-${tasker.id}` },
      update: {
        placementKey: "daily-claim-card",
        metadata: { seed: true, cohort: "demo" },
      },
      create: {
        id: `seed-adview-${tasker.id}`,
        userId: tasker.id,
        placementKey: "daily-claim-card",
        sessionId: `seed-session-${index}`,
        metadata: { seed: true, cohort: "demo" },
      },
    });

    const amount = 50n + BigInt((index % 3) * 10);
    const claimedAt = new Date(now - (index + 26) * 60 * 60 * 1000);
    const cooldownEndsAt = new Date(claimedAt.getTime() + 24 * 60 * 60 * 1000);

    await prisma.dailyClaim.upsert({
      where: { adPlaceholderViewId: adView.id },
      update: { amount, cooldownEndsAt, claimedAt },
      create: {
        userId: tasker.id,
        adPlaceholderViewId: adView.id,
        amount,
        claimedAt,
        cooldownEndsAt,
      },
    });

    taskerPicks.set(tasker.id, (taskerPicks.get(tasker.id) ?? 0n) + amount);

    await prisma.transactionLog.upsert({
      where: {
        referenceType_referenceId_type_userId: {
          referenceType: ReferenceType.daily_claim,
          referenceId: `seed-daily-claim-${tasker.id}`,
          type: TransactionType.earn,
          userId: tasker.id,
        },
      },
      update: { amount },
      create: {
        userId: tasker.id,
        type: TransactionType.earn,
        amount,
        referenceType: ReferenceType.daily_claim,
        referenceId: `seed-daily-claim-${tasker.id}`,
        metadata: { seed: true },
      },
    });

    await prisma.taskEvent.upsert({
      where: {
        userId_type_referenceId: {
          userId: tasker.id,
          type: TaskEventType.daily_claim,
          referenceId: `seed-daily-claim-${tasker.id}`,
        },
      },
      update: {
        picksAmount: amount,
        xpGranted: 40,
        metadata: { seed: true },
      },
      create: {
        userId: tasker.id,
        type: TaskEventType.daily_claim,
        referenceId: `seed-daily-claim-${tasker.id}`,
        picksAmount: amount,
        xpGranted: 40,
        metadata: { seed: true },
      },
    });
  }

  for (const [index, tasker] of taskers.entries()) {
    if (index >= 8) break;
    const code = `BITE-${tasker.id.slice(-6).toUpperCase()}`;
    await prisma.referralCode.upsert({
      where: { code },
      update: { active: true, userId: tasker.id },
      create: {
        userId: tasker.id,
        code,
        active: true,
      },
    });
  }

  for (const tasker of taskers) {
    await prisma.user.update({
      where: { id: tasker.id },
      data: {
        picksBalance: taskerPicks.get(tasker.id) ?? 0n,
        reservedBalance: 0n,
      },
    });
  }

  for (const owner of owners) {
    const state = ownerState.get(owner.id);
    if (!state) continue;
    await prisma.user.update({
      where: { id: owner.id },
      data: {
        picksBalance: state.picksBalance,
        reservedBalance: state.reservedBalance,
      },
    });
  }

  const submissionByPair = new Map(
    submissions.map((s) => [`${s.taskId}-${s.userId}`, s.id] as const),
  );

  for (const submission of submissions) {
    const task = taskById.get(submission.taskId);
    if (!task) continue;
    const referenceId = submissionByPair.get(`${submission.taskId}-${submission.userId}`);
    if (!referenceId) continue;

    if (submission.status === SubmissionStatus.approved) {
      await prisma.taskEvent.upsert({
        where: {
          userId_type_referenceId: {
            userId: submission.userId,
            type: TaskEventType.completed,
            referenceId,
          },
        },
        update: {
          picksAmount: task.rewardAmount,
          xpGranted: 120,
          metadata: { seed: true },
        },
        create: {
          userId: submission.userId,
          type: TaskEventType.completed,
          referenceId,
          picksAmount: task.rewardAmount,
          xpGranted: 120,
          metadata: { seed: true },
        },
      });
    }

    if (submission.status === SubmissionStatus.rejected) {
      await prisma.taskEvent.upsert({
        where: {
          userId_type_referenceId: {
            userId: submission.userId,
            type: TaskEventType.rejected,
            referenceId,
          },
        },
        update: {
          picksAmount: 0n,
          xpGranted: 12,
          metadata: { seed: true },
        },
        create: {
          userId: submission.userId,
          type: TaskEventType.rejected,
          referenceId,
          picksAmount: 0n,
          xpGranted: 12,
          metadata: { seed: true },
        },
      });
    }
  }

  for (const [index, tasker] of taskers.entries()) {
    const approved = taskerApprovedCount.get(tasker.id) ?? 0;
    const rejected = taskerRejectedCount.get(tasker.id) ?? 0;
    const xp = approved * 120 + rejected * 12 + (index < 12 ? 40 : 0) + (index % 4) * 20;
    const level = Math.max(1, Math.floor(xp / 300) + 1);
    const currentStreak = index < 12 ? 1 + (index % 6) : index % 3;
    const highestStreak = currentStreak + 2 + (index % 5);
    const totalEarned = taskerPicks.get(tasker.id) ?? 0n;
    const socialState =
      index % 4 === 0
        ? SocialConnectionStatus.connected_verified
        : index % 4 === 1
          ? SocialConnectionStatus.connected_unverified
          : SocialConnectionStatus.disconnected;

    await prisma.taskerProfile.upsert({
      where: { userId: tasker.id },
      update: {
        xp,
        level,
        currentStreak,
        highestStreak,
        totalMissions: approved + rejected,
        totalEarned,
        instagramHandle: index % 3 === 0 ? `foodtasker_${index + 1}` : null,
        instagramStatus:
          index % 3 === 0 ? socialState : SocialConnectionStatus.disconnected,
        tiktokHandle: index % 3 === 1 ? `bitemineclips${index + 1}` : null,
        tiktokStatus:
          index % 3 === 1 ? socialState : SocialConnectionStatus.disconnected,
        linkedinHandle: index % 3 === 2 ? `food-creator-${index + 1}` : null,
        linkedinStatus:
          index % 3 === 2 ? socialState : SocialConnectionStatus.disconnected,
        lastActiveAt: new Date(now - index * 60 * 60 * 1000),
      },
      create: {
        userId: tasker.id,
        xp,
        level,
        currentStreak,
        highestStreak,
        totalMissions: approved + rejected,
        totalEarned,
        instagramHandle: index % 3 === 0 ? `foodtasker_${index + 1}` : null,
        instagramStatus:
          index % 3 === 0 ? socialState : SocialConnectionStatus.disconnected,
        tiktokHandle: index % 3 === 1 ? `bitemineclips${index + 1}` : null,
        tiktokStatus:
          index % 3 === 1 ? socialState : SocialConnectionStatus.disconnected,
        linkedinHandle: index % 3 === 2 ? `food-creator-${index + 1}` : null,
        linkedinStatus:
          index % 3 === 2 ? socialState : SocialConnectionStatus.disconnected,
        lastActiveAt: new Date(now - index * 60 * 60 * 1000),
      },
    });

    if (approved >= 5) {
      await prisma.taskEvent.upsert({
        where: {
          userId_type_referenceId: {
            userId: tasker.id,
            type: TaskEventType.streak_bonus,
            referenceId: `seed-streak-${tasker.id}`,
          },
        },
        update: {
          picksAmount: 0n,
          xpGranted: 20,
          metadata: { seed: true },
        },
        create: {
          userId: tasker.id,
          type: TaskEventType.streak_bonus,
          referenceId: `seed-streak-${tasker.id}`,
          picksAmount: 0n,
          xpGranted: 20,
          metadata: { seed: true },
        },
      });
    }
  }

  console.log({
    adminId: admin.id,
    restaurantCount: restaurants.length,
    restaurantSlugs: restaurants.slice(0, 6).map((restaurant) => restaurant.slug),
    demoOwnerUserId: owners[0]?.id,
    demoOwnerEmail: owners[0]?.email,
    taskCount: tasks.length,
    submissionCount: submissions.length,
    taskerCount: taskers.length,
    demoTaskerUserId: taskers[0].id,
    demoRoute: `/r/${restaurants[0]?.slug ?? "sunset-bistro"}?userId=${taskers[0]?.id ?? ""}`,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
