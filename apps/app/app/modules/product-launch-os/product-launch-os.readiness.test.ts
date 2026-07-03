import assert from "node:assert/strict";
import test from "node:test";

import { productLaunchFixtures } from "./product-launch-os.fixtures";
import type { ProductLaunchApproval, ProductLaunchRecord } from "./product-launch-os.models";
import { deriveProductLaunchReadiness, requiresHumanApprovalReason } from "./product-launch-os.readiness";

const readyLaunch = getLaunch("lnch_cloudberry_yogurt_ready");

test("blocks readiness when required gates are missing or transitions are unaudited", () => {
  const missingApprovalGate = cloneLaunch(readyLaunch, {
    gates: readyLaunch.gates.filter((gate) => gate.type !== "approval"),
  });
  const missingGateReadiness = deriveProductLaunchReadiness(missingApprovalGate);

  assert.equal(missingGateReadiness.status, "blocked");
  assert.deepEqual(missingGateReadiness.missingGateTypes, ["approval"]);
  assert.match(missingGateReadiness.nextAction, /approval/);

  const unauditedApprovalGate = cloneLaunch(readyLaunch, {
    activityEvents: readyLaunch.activityEvents.filter((event) => event.metadata.gateType !== "approval"),
  });
  const unauditedReadiness = deriveProductLaunchReadiness(unauditedApprovalGate);

  assert.equal(unauditedReadiness.status, "blocked");
  assert.equal(unauditedReadiness.allGateTransitionsAudited, false);
  assert.match(unauditedReadiness.nextAction, /Record audit events/);
});

test("requested approval or blank approval reason keeps readiness blocked", () => {
  const approvedFixtureApproval = requireApproval(readyLaunch);
  const requestedApproval = cloneLaunch(readyLaunch, {
    approvals: [
      {
        ...approvedFixtureApproval,
        status: "requested",
        reason: "Human note is drafted but the approval is still only requested.",
      },
    ],
  });
  const requestedReadiness = deriveProductLaunchReadiness(requestedApproval);

  assert.equal(requestedReadiness.status, "blocked");
  assert.equal(requestedReadiness.humanApprovalReasonRequired, true);
  assert.equal(requestedReadiness.humanApprovalReady, false);
  assert.equal(requiresHumanApprovalReason(requestedApproval.approvals[0]), true);

  const blankReasonApproval = cloneLaunch(readyLaunch, {
    approvals: [
      {
        ...approvedFixtureApproval,
        status: "approved",
        reason: "   ",
      },
    ],
  });
  const blankReasonReadiness = deriveProductLaunchReadiness(blankReasonApproval);

  assert.equal(blankReasonReadiness.status, "blocked");
  assert.equal(blankReasonReadiness.humanApprovalReasonRequired, true);
  assert.equal(blankReasonReadiness.humanApprovalReady, false);
  assert.equal(requiresHumanApprovalReason(blankReasonApproval.approvals[0]), true);
});

test("AI review never approves launch readiness", () => {
  const readiness = deriveProductLaunchReadiness(readyLaunch);

  assert.equal(readiness.aiReviewCanApprove, false);
  for (const review of readyLaunch.aiReviews) {
    assert.equal(review.canApprove, false);
  }
});

test("fully audited human-approved fixture can be ready", () => {
  const readiness = deriveProductLaunchReadiness(readyLaunch);

  assert.equal(readiness.status, "ready");
  assert.equal(readiness.readyGateCount, readiness.totalGateCount);
  assert.deepEqual(readiness.missingGateTypes, []);
  assert.equal(readiness.humanApprovalReady, true);
  assert.equal(readiness.allGateTransitionsAudited, true);
  assert.equal(readiness.aiReviewCanApprove, false);
});

test("next action prioritizes blocking gate status before approval fallback", () => {
  const approvedFixtureApproval = requireApproval(readyLaunch);
  const launchWithBlockedGateAndRequestedApproval = cloneLaunch(readyLaunch, {
    gates: readyLaunch.gates.map((gate) =>
      gate.type === "compliance"
        ? {
            ...gate,
            status: "blocked",
            blockers: ["label evidence missing"],
            nextAction: "Resolve the compliance blocker before approval fallback.",
          }
        : gate,
    ),
    approvals: [
      {
        ...approvedFixtureApproval,
        status: "requested",
        reason: "",
      },
    ],
  });
  const readiness = deriveProductLaunchReadiness(launchWithBlockedGateAndRequestedApproval);

  assert.equal(readiness.status, "blocked");
  assert.equal(readiness.humanApprovalReasonRequired, true);
  assert.equal(readiness.nextAction, "Resolve the compliance blocker before approval fallback.");
});

function getLaunch(id: ProductLaunchRecord["id"]): ProductLaunchRecord {
  const launch = productLaunchFixtures.find((candidate) => candidate.id === id);
  assert.ok(launch, `fixture not found: ${id}`);

  return launch as ProductLaunchRecord;
}

function requireApproval(launch: ProductLaunchRecord): ProductLaunchApproval {
  const approval = launch.approvals.find((candidate) => candidate.gateType === "approval");
  assert.ok(approval, `approval not found for fixture: ${launch.id}`);

  return approval;
}

function cloneLaunch(
  launch: ProductLaunchRecord,
  overrides: Partial<Pick<ProductLaunchRecord, "gates" | "approvals" | "aiReviews" | "activityEvents">> = {},
): ProductLaunchRecord {
  return {
    ...launch,
    gates: launch.gates.map((gate) => ({
      ...gate,
      blockers: [...gate.blockers],
    })),
    approvals: launch.approvals.map((approval) => ({ ...approval })),
    aiReviews: launch.aiReviews.map((review) => ({
      ...review,
      flags: [...review.flags],
      preparedActions: [...review.preparedActions],
    })),
    activityEvents: launch.activityEvents.map((event) => ({
      ...event,
      metadata: { ...event.metadata },
    })),
    ...overrides,
  };
}
