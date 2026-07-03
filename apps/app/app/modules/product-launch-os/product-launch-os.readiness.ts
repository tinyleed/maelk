import type {
  ProductLaunchApproval,
  ProductLaunchGate,
  ProductLaunchReadiness,
  ProductLaunchRecord,
  ProductLaunchSummary,
} from "./product-launch-os.models";

const BLOCKING_STATUS_ORDER: readonly ProductLaunchGate["status"][] = ["blocked", "needs_review", "not_started"];

export function createProductLaunchSummaries(
  launches: readonly ProductLaunchRecord[],
): ProductLaunchSummary[] {
  return launches.map(createProductLaunchSummary);
}

export function createProductLaunchSummary(launch: ProductLaunchRecord): ProductLaunchSummary {
  const readiness = deriveProductLaunchReadiness(launch);

  return {
    id: launch.id,
    companyId: launch.companyId,
    name: launch.name,
    owner: launch.owner,
    status: readiness.status,
    nextAction: readiness.nextAction,
    readiness,
    createdBy: launch.createdBy,
    createdAt: launch.createdAt,
  };
}

export function deriveProductLaunchReadiness(launch: ProductLaunchRecord): ProductLaunchReadiness {
  const readyGateCount = countGatesByStatus(launch.gates, "ready");
  const blockedGateCount = countGatesByStatus(launch.gates, "blocked");
  const needsReviewGateCount = countGatesByStatus(launch.gates, "needs_review");
  const notStartedGateCount = countGatesByStatus(launch.gates, "not_started");
  const approval = findLaunchApproval(launch);
  const humanApprovalReasonRequired = approval ? requiresHumanApprovalReason(approval) : true;
  const humanApprovalReady = approval ? isHumanApprovalReady(approval) : false;
  const allGateTransitionsAudited = hasAuditEventForEachGate(launch);
  const aiReviewCanApprove = false as const;
  const allGatesReady = launch.gates.length > 0 && readyGateCount === launch.gates.length;
  const status =
    allGatesReady && humanApprovalReady && allGateTransitionsAudited && !aiReviewCanApprove ? "ready" : "blocked";

  return {
    status,
    totalGateCount: launch.gates.length,
    readyGateCount,
    blockedGateCount,
    needsReviewGateCount,
    notStartedGateCount,
    humanApprovalReasonRequired,
    humanApprovalReady,
    allGateTransitionsAudited,
    auditEventCount: launch.activityEvents.length,
    aiReviewCanApprove,
    blockingGateLabels: launch.gates.filter((gate) => gate.status === "blocked").map((gate) => gate.label),
    nextAction: pickNextAction(launch, humanApprovalReasonRequired),
  };
}

export function requiresHumanApprovalReason(approval: ProductLaunchApproval): boolean {
  return approval.status === "requested" || approval.reason.trim().length === 0;
}

function isHumanApprovalReady(approval: ProductLaunchApproval): boolean {
  return approval.status === "approved" && approval.reason.trim().length > 0;
}

function findLaunchApproval(launch: ProductLaunchRecord): ProductLaunchApproval | undefined {
  return launch.approvals.find((approval) => approval.gateType === "approval");
}

function countGatesByStatus(
  gates: readonly ProductLaunchGate[],
  status: ProductLaunchGate["status"],
): number {
  return gates.filter((gate) => gate.status === status).length;
}

function hasAuditEventForEachGate(launch: ProductLaunchRecord): boolean {
  const auditedGateKeys = new Set(
    launch.activityEvents
      .filter((event) => event.entityType === "launchGate" && event.metadata.gateType)
      .map((event) => `${event.metadata.launchId}:${event.metadata.gateType}`),
  );

  return launch.gates.every((gate) => auditedGateKeys.has(`${launch.id}:${gate.type}`));
}

function pickNextAction(launch: ProductLaunchRecord, humanApprovalReasonRequired: boolean): string {
  for (const status of BLOCKING_STATUS_ORDER) {
    const gate = launch.gates.find((candidate) => candidate.status === status);

    if (gate) {
      return gate.nextAction;
    }
  }

  if (humanApprovalReasonRequired) {
    return "Enter a human approval reason before showing the launch as ready.";
  }

  return "Keep staged locally until human review accepts the slice.";
}
