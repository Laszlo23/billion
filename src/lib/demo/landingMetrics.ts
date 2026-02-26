export const landingPilotMetrics = {
  activeVenues: 12,
  missionsCompleted: 247,
  reviewsGenerated: 89,
  avgRatingImpact: 0.3,
} as const;

export const seasonProgress = {
  foundingVenues: 12,
  targetVenues: 30,
  daysLeft: 72,
} as const;

export const liveCampaignPreview = {
  venueName: "Sunset Bistro",
  district: "District 7",
  reviewsGainedThisWeek: 14,
  activeMissions: 6,
  contributorRank: "#3 this week",
} as const;

export const topContributorsThisWeek = [
  { name: "Contributor #014", points: 1280, badge: "Silver", xpPct: 78 },
  { name: "Contributor #022", points: 1110, badge: "Silver", xpPct: 64 },
  { name: "Contributor #031", points: 980, badge: "Bronze", xpPct: 49 },
] as const;

export const liveActivityFeedSeed = [
  { message: "+1 Google review approved — District 7", timeAgo: "2m ago" },
  { message: "Contributor #014 reached Silver", timeAgo: "7m ago" },
  { message: "Sunset Bistro launched ‘IG Story’ mission", timeAgo: "12m ago" },
  { message: "District 2 crossed 5 venues", timeAgo: "18m ago" },
] as const;

export const districtRaceSeed = [
  { district: "District 1", active: 5, target: 20 },
  { district: "District 7", active: 4, target: 20 },
  { district: "District 2", active: 3, target: 20 },
] as const;
