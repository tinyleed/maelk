import type { ProductLaunchGateType, ProductLaunchRecord } from "./product-launch-os.models";

const companyId = "co_demo_maelk";
const leadUserId = "usr_ops_lead";
const channelUserId = "usr_channel_manager";
const createdAt = "2026-07-03T12:00:00Z";

const gateTypes: readonly ProductLaunchGateType[] = [
  "product",
  "supplier",
  "economics",
  "compliance",
  "channel",
  "inventory",
  "sales",
  "ai_review",
  "approval",
];

const gateLabels: Record<ProductLaunchGateType, string> = {
  product: "Product and SKU",
  supplier: "Supplier terms",
  economics: "Economics review",
  compliance: "Compliance evidence",
  channel: "Channel draft",
  inventory: "Inventory plan",
  sales: "Sales brief",
  ai_review: "AI review summary",
  approval: "Human approval",
};

export const productLaunchFixtures = [
  {
    id: "lnch_oat_barista_q3",
    companyId,
    name: "Oat Barista 1L",
    owner: "Launch lead",
    ownerId: leadUserId,
    targetChannel: "Demo webshop draft",
    targetLaunchDate: "2026-09-01",
    createdBy: leadUserId,
    createdAt,
    gates: [
      readyGate("lnch_oat_barista_q3", "product", "Product and SKU"),
      readyGate("lnch_oat_barista_q3", "supplier", "Supplier terms"),
      reviewGate("lnch_oat_barista_q3", "economics", "Economics review", "Confirm target margin before go-live review."),
      blockedGate(
        "lnch_oat_barista_q3",
        "compliance",
        "Compliance evidence",
        "Collect missing compliance evidence before review.",
        ["final ingredient list", "allergen statement"],
      ),
      readyGate("lnch_oat_barista_q3", "channel", "Channel draft"),
      readyGate("lnch_oat_barista_q3", "inventory", "Inventory plan"),
      readyGate("lnch_oat_barista_q3", "sales", "Sales brief"),
      readyGate("lnch_oat_barista_q3", "ai_review", "AI review summary"),
      reviewGate(
        "lnch_oat_barista_q3",
        "approval",
        "Human approval",
        "Enter a human approval reason after evidence is complete.",
        "appr_oat_barista_q3",
      ),
    ],
    approvals: [
      {
        id: "appr_oat_barista_q3",
        companyId,
        launchId: "lnch_oat_barista_q3",
        gateType: "approval",
        status: "requested",
        action: "approve_launch_readiness",
        riskSummary: "Compliance evidence is incomplete; a human reason is required before approval.",
        reason: "",
        requestedBy: leadUserId,
        createdBy: leadUserId,
        createdAt,
      },
    ],
    aiReviews: [
      {
        id: "air_oat_barista_q3",
        companyId,
        launchId: "lnch_oat_barista_q3",
        summary: "Launch is promising but blocked by compliance evidence and human cost review.",
        flags: ["missing compliance evidence", "approval reason required"],
        preparedActions: ["draft approval checklist", "summarize missing fields"],
        canApprove: false,
        createdBy: leadUserId,
        createdAt,
      },
    ],
    activityEvents: auditEvents("lnch_oat_barista_q3", leadUserId, {
      compliance: 2,
      approval: 1,
    }),
  },
  {
    id: "lnch_cloudberry_yogurt_ready",
    companyId,
    name: "Cloudberry Yogurt 500g",
    owner: "Channel manager",
    ownerId: channelUserId,
    targetChannel: "Demo webshop draft",
    targetLaunchDate: "2026-08-15",
    createdBy: leadUserId,
    createdAt,
    gates: gateTypes.map((type) =>
      readyGate("lnch_cloudberry_yogurt_ready", type, gateLabels[type], type === "approval" ? "appr_cloudberry_yogurt_ready" : undefined),
    ),
    approvals: [
      {
        id: "appr_cloudberry_yogurt_ready",
        companyId,
        launchId: "lnch_cloudberry_yogurt_ready",
        gateType: "approval",
        status: "approved",
        action: "approve_launch_readiness",
        riskSummary: "All fake readiness gates are complete; keep this local until human review accepts the slice.",
        reason: "Demo launch stays local-only and is approved for fixture display after readiness review.",
        requestedBy: leadUserId,
        resolvedBy: channelUserId,
        resolvedAt: "2026-07-03T12:30:00Z",
        createdBy: leadUserId,
        createdAt,
      },
    ],
    aiReviews: [
      {
        id: "air_cloudberry_yogurt_ready",
        companyId,
        launchId: "lnch_cloudberry_yogurt_ready",
        summary: "No blockers detected in fake readiness data; AI can only summarize the trace.",
        flags: [],
        preparedActions: ["prepare reviewer handoff"],
        canApprove: false,
        createdBy: leadUserId,
        createdAt,
      },
    ],
    activityEvents: auditEvents("lnch_cloudberry_yogurt_ready", channelUserId),
  },
  {
    id: "lnch_nordic_granola_reset",
    companyId,
    name: "Nordic Granola 350g",
    owner: "Launch lead",
    ownerId: leadUserId,
    targetChannel: "Demo wholesale draft",
    targetLaunchDate: "2026-10-05",
    createdBy: leadUserId,
    createdAt,
    gates: [
      readyGate("lnch_nordic_granola_reset", "product", "Product and SKU"),
      blockedGate(
        "lnch_nordic_granola_reset",
        "supplier",
        "Supplier terms",
        "Resolve supplier and economics blockers before approval.",
        ["supplier quote expired"],
      ),
      blockedGate(
        "lnch_nordic_granola_reset",
        "economics",
        "Economics review",
        "Resolve supplier and economics blockers before approval.",
        ["target margin needs human review"],
      ),
      readyGate("lnch_nordic_granola_reset", "compliance", "Compliance evidence"),
      readyGate("lnch_nordic_granola_reset", "channel", "Channel draft"),
      reviewGate("lnch_nordic_granola_reset", "inventory", "Inventory plan", "Confirm launch quantity is staged as fake readiness data."),
      readyGate("lnch_nordic_granola_reset", "sales", "Sales brief"),
      readyGate("lnch_nordic_granola_reset", "ai_review", "AI review summary"),
      reviewGate(
        "lnch_nordic_granola_reset",
        "approval",
        "Human approval",
        "Enter a human approval reason after supplier and economics blockers clear.",
        "appr_nordic_granola_reset",
      ),
    ],
    approvals: [
      {
        id: "appr_nordic_granola_reset",
        companyId,
        launchId: "lnch_nordic_granola_reset",
        gateType: "approval",
        status: "requested",
        action: "approve_launch_readiness",
        riskSummary: "Supplier terms and economics need human review before approval.",
        reason: "",
        requestedBy: leadUserId,
        createdBy: leadUserId,
        createdAt,
      },
    ],
    aiReviews: [
      {
        id: "air_nordic_granola_reset",
        companyId,
        launchId: "lnch_nordic_granola_reset",
        summary: "Launch should remain blocked until supplier terms and target margin are reviewed by a human.",
        flags: ["supplier quote expired", "target margin needs review"],
        preparedActions: ["summarize supplier gap", "draft economics review note"],
        canApprove: false,
        createdBy: leadUserId,
        createdAt,
      },
    ],
    activityEvents: auditEvents("lnch_nordic_granola_reset", leadUserId, {
      supplier: 1,
      economics: 1,
      inventory: 0,
      approval: 1,
    }),
  },
] satisfies readonly ProductLaunchRecord[];

function readyGate(
  launchId: ProductLaunchRecord["id"],
  type: ProductLaunchGateType,
  label: string,
  requiredApprovalId?: ProductLaunchRecord["approvals"][number]["id"],
): ProductLaunchRecord["gates"][number] {
  return {
    id: `gate_${launchId.replace("lnch_", "")}_${type}`,
    companyId,
    launchId,
    type,
    label,
    status: "ready",
    blockers: [],
    nextAction: "Keep staged locally until human review accepts the slice.",
    requiredApprovalId,
    createdBy: leadUserId,
    createdAt,
  };
}

function blockedGate(
  launchId: ProductLaunchRecord["id"],
  type: ProductLaunchGateType,
  label: string,
  nextAction: string,
  blockers: readonly string[],
): ProductLaunchRecord["gates"][number] {
  return {
    id: `gate_${launchId.replace("lnch_", "")}_${type}`,
    companyId,
    launchId,
    type,
    label,
    status: "blocked",
    blockers,
    nextAction,
    createdBy: leadUserId,
    createdAt,
  };
}

function reviewGate(
  launchId: ProductLaunchRecord["id"],
  type: ProductLaunchGateType,
  label: string,
  nextAction: string,
  requiredApprovalId?: ProductLaunchRecord["approvals"][number]["id"],
): ProductLaunchRecord["gates"][number] {
  return {
    id: `gate_${launchId.replace("lnch_", "")}_${type}`,
    companyId,
    launchId,
    type,
    label,
    status: "needs_review",
    blockers: [],
    nextAction,
    requiredApprovalId,
    createdBy: leadUserId,
    createdAt,
  };
}

function auditEvents(
  launchId: ProductLaunchRecord["id"],
  actorId: ProductLaunchRecord["ownerId"],
  blockerCounts: Partial<Record<ProductLaunchGateType, number>> = {},
): ProductLaunchRecord["activityEvents"] {
  return gateTypes.map((gateType) => ({
    id: `evt_${launchId.replace("lnch_", "")}_${gateType}`,
    companyId,
    entityType: "launchGate",
    entityId: `gate_${launchId.replace("lnch_", "")}_${gateType}`,
    actorId,
    action: "gate_readiness_recorded",
    metadata: {
      launchId,
      gateType,
      blockerCount: blockerCounts[gateType] ?? 0,
      humanApprovalReasonRequired: gateType === "approval",
    },
    createdBy: actorId,
    createdAt,
  }));
}
