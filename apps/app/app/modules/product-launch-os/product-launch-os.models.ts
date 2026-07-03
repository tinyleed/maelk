export type CompanyId = `co_${string}`;
export type UserId = `usr_${string}`;
export type ProductLaunchId = `lnch_${string}`;
export type ProductLaunchGateId = `gate_${string}`;
export type ProductLaunchApprovalId = `appr_${string}`;
export type ProductLaunchAiReviewId = `air_${string}`;
export type ProductLaunchActivityEventId = `evt_${string}`;

export type ProductLaunchGateType =
  | "product"
  | "supplier"
  | "economics"
  | "compliance"
  | "channel"
  | "inventory"
  | "sales"
  | "ai_review"
  | "approval";

export type ProductLaunchGateStatus = "ready" | "needs_review" | "blocked" | "not_started";
export type ProductLaunchCardStatus = "ready" | "blocked";
export type ProductLaunchApprovalStatus = "requested" | "approved" | "rejected";

export type ProductLaunchAuditFields = {
  companyId: CompanyId;
  createdBy: UserId;
  createdAt: string;
};

export type ProductLaunchGate = ProductLaunchAuditFields & {
  id: ProductLaunchGateId;
  launchId: ProductLaunchId;
  type: ProductLaunchGateType;
  label: string;
  status: ProductLaunchGateStatus;
  blockers: readonly string[];
  nextAction: string;
  requiredApprovalId?: ProductLaunchApprovalId;
};

export type ProductLaunchApproval = ProductLaunchAuditFields & {
  id: ProductLaunchApprovalId;
  launchId: ProductLaunchId;
  gateType: ProductLaunchGateType;
  status: ProductLaunchApprovalStatus;
  action: string;
  riskSummary: string;
  reason: string;
  requestedBy: UserId;
  resolvedBy?: UserId;
  resolvedAt?: string;
};

export type ProductLaunchAiReview = ProductLaunchAuditFields & {
  id: ProductLaunchAiReviewId;
  launchId: ProductLaunchId;
  summary: string;
  flags: readonly string[];
  preparedActions: readonly string[];
  canApprove: false;
};

export type ProductLaunchActivityEvent = ProductLaunchAuditFields & {
  id: ProductLaunchActivityEventId;
  entityType: "launch" | "launchGate" | "approval" | "aiReview";
  entityId: string;
  actorId: UserId;
  action: string;
  metadata: {
    launchId: ProductLaunchId;
    gateType?: ProductLaunchGateType;
    blockerCount?: number;
    humanApprovalReasonRequired?: boolean;
  };
};

export type ProductLaunchRecord = ProductLaunchAuditFields & {
  id: ProductLaunchId;
  name: string;
  owner: string;
  ownerId: UserId;
  targetChannel: string;
  targetLaunchDate: string;
  gates: readonly ProductLaunchGate[];
  approvals: readonly ProductLaunchApproval[];
  aiReviews: readonly ProductLaunchAiReview[];
  activityEvents: readonly ProductLaunchActivityEvent[];
};

export type ProductLaunchReadiness = {
  status: ProductLaunchCardStatus;
  totalGateCount: number;
  readyGateCount: number;
  blockedGateCount: number;
  needsReviewGateCount: number;
  notStartedGateCount: number;
  humanApprovalReasonRequired: boolean;
  humanApprovalReady: boolean;
  allGateTransitionsAudited: boolean;
  auditEventCount: number;
  aiReviewCanApprove: false;
  blockingGateLabels: readonly string[];
  nextAction: string;
};

export type ProductLaunchSummary = ProductLaunchAuditFields & {
  id: ProductLaunchId;
  name: string;
  status: ProductLaunchCardStatus;
  owner: string;
  nextAction: string;
  readiness: ProductLaunchReadiness;
};
