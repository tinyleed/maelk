(() => {
  const DATA_URL = './product-launch-os.fake-data.json';
  const gateOrder = [
    'product',
    'supplier',
    'economics',
    'compliance',
    'channel',
    'inventory',
    'sales',
    'ai_review',
    'approval',
  ];
  const gateLabels = {
    product: 'Product',
    supplier: 'Supplier',
    economics: 'Economics',
    compliance: 'Compliance',
    channel: 'Channel',
    inventory: 'Inventory',
    sales: 'Sales',
    ai_review: 'AI review',
    approval: 'Human approval',
  };
  const statusLabels = {
    ready: 'Ready',
    needs_review: 'Needs review',
    blocked: 'Blocked',
    not_started: 'Not started',
  };
  const statusPriority = {
    ready: 0,
    not_started: 1,
    needs_review: 2,
    blocked: 3,
  };

  const state = {
    data: null,
    selectedLaunchId: null,
    localApprovalNotes: {},
    fakeReasonEntered: new Set(),
    approvalReasonWarnings: {},
  };

  document.addEventListener('DOMContentLoaded', boot);
  document.addEventListener('click', handleClick);
  document.addEventListener('input', handleInput);

  async function boot() {
    const root = getRoot();

    try {
      const response = await fetch(DATA_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Fake data request failed with HTTP ${response.status}`);
      }

      state.data = await response.json();
      state.selectedLaunchId = state.data.launches?.[0]?.id ?? null;
      render();
    } catch (error) {
      root.innerHTML = `
        <section class="error-card">
          <p class="eyebrow">Static data error</p>
          <h2>The fake launch records could not be loaded.</h2>
          <p>${escapeHtml(error.message)}</p>
          <p>Run a local static server from the repository root and open this page through that server.</p>
        </section>
      `;
    }
  }

  function getRoot() {
    return document.querySelector('#cockpit-root');
  }

  function handleClick(event) {
    const launchButton = event.target.closest('[data-launch-id]');
    if (launchButton) {
      state.selectedLaunchId = launchButton.dataset.launchId;
      render();
      return;
    }

    const actionButton = event.target.closest('[data-action]');
    if (!actionButton || !state.selectedLaunchId) {
      return;
    }

    if (actionButton.dataset.action === 'draft-approval-note') {
      const context = getSelectedContext();
      state.localApprovalNotes[state.selectedLaunchId] = buildApprovalDraft(context);
      render();
    }

    if (actionButton.dataset.action === 'mark-fake-reason') {
      const note = (state.localApprovalNotes[state.selectedLaunchId] ?? getSelectedContext().approval?.reason ?? '').trim();
      if (!note) {
        state.approvalReasonWarnings[state.selectedLaunchId] = 'Write a local-only reason before marking the fake reason as entered.';
        render();
        return;
      }

      delete state.approvalReasonWarnings[state.selectedLaunchId];
      state.fakeReasonEntered.add(state.selectedLaunchId);
      render();
    }
  }

  function handleInput(event) {
    if (event.target.id !== 'approval-note' || !state.selectedLaunchId) {
      return;
    }

    state.localApprovalNotes[state.selectedLaunchId] = event.target.value;
    delete state.approvalReasonWarnings[state.selectedLaunchId];

    const markButton = document.querySelector('[data-action="mark-fake-reason"]');
    if (markButton) {
      const hasExistingReason = Boolean(getSelectedContext().approval?.reason?.trim());
      markButton.disabled = !event.target.value.trim() && !hasExistingReason;
    }

    document.querySelector('[data-approval-warning]')?.remove();
  }

  function render() {
    const root = getRoot();
    const launches = collection('launches');
    if (!launches.length) {
      root.innerHTML = `
        <section class="error-card">
          <p class="eyebrow">Empty fake data</p>
          <h2>No seeded launches were found.</h2>
        </section>
      `;
      return;
    }

    if (!state.selectedLaunchId || !launches.some((launch) => launch.id === state.selectedLaunchId)) {
      state.selectedLaunchId = launches[0].id;
    }

    const selected = getSelectedContext();
    const launchCards = launches.map((launch) => deriveLaunchContext(launch));

    root.innerHTML = `
      <aside class="panel" aria-label="Seeded launches">
        <p class="eyebrow">Seeded launches</p>
        <div class="launch-list">
          ${launchCards.map(renderLaunchButton).join('')}
        </div>
      </aside>
      <section class="detail-stack" aria-label="Selected launch cockpit">
        ${renderHero(selected)}
        ${renderGates(selected)}
        <div class="two-column">
          ${renderAiReview(selected)}
          ${renderApproval(selected)}
        </div>
        ${renderTimeline(selected)}
      </section>
    `;
  }

  function renderLaunchButton(context) {
    const isSelected = context.launch.id === state.selectedLaunchId;
    return `
      <button class="launch-button" type="button" data-launch-id="${escapeAttr(context.launch.id)}" aria-current="${isSelected}">
        <strong>${escapeHtml(context.title)}</strong>
        <span>${escapeHtml(context.channelName)} · ${escapeHtml(formatDate(context.launch.targetLaunchDate))}</span>
        <span><span class="small-pill ${context.overallStatus}">${statusLabels[context.overallStatus]}</span></span>
      </button>
    `;
  }

  function renderHero(context) {
    const nextAction = getNextSafeAction(context);
    return `
      <article class="panel hero-panel">
        <div class="hero-topline">
          <div>
            <p class="eyebrow">Selected launch</p>
            <h2>${escapeHtml(context.title)}</h2>
          </div>
          <span class="status-pill ${context.overallStatus}">${statusLabels[context.overallStatus]}</span>
        </div>
        <div class="meta-grid">
          ${renderMeta('Owner', context.ownerName)}
          ${renderMeta('Channel', context.channelName)}
          ${renderMeta('Target date', formatDate(context.launch.targetLaunchDate))}
          ${renderMeta('State', context.launch.status)}
        </div>
        <div class="metric-grid">
          ${renderMetric('Ready gates', `${context.readyGateCount}/${gateOrder.length}`)}
          ${renderMetric('Blockers', String(context.blockers.length))}
          ${renderMetric('Approval reason', context.approvalReasonState)}
        </div>
        <div>
          <p class="eyebrow">Next safe action</p>
          <p>${escapeHtml(nextAction)}</p>
        </div>
        ${renderBlockers(context)}
      </article>
    `;
  }

  function renderMeta(label, value) {
    return `
      <div class="meta-item">
        <span class="meta-label">${escapeHtml(label)}</span>
        <span class="meta-value">${escapeHtml(value || 'Missing')}</span>
      </div>
    `;
  }

  function renderMetric(label, value) {
    return `
      <div class="metric-card">
        <span class="metric-label">${escapeHtml(label)}</span>
        <span class="metric-value">${escapeHtml(value)}</span>
      </div>
    `;
  }

  function renderBlockers(context) {
    if (!context.blockers.length) {
      return '<p>No blockers in fake data. Keep this local until review accepts the slice.</p>';
    }

    return `
      <div>
        <p class="eyebrow">Blockers and review items</p>
        <ul class="blocker-list">
          ${context.blockers.map((blocker) => `<li>${escapeHtml(blocker)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  function renderGates(context) {
    return `
      <section class="panel">
        <p class="eyebrow">Derived readiness gates</p>
        <h2>Commerce launch control layer</h2>
        <div class="gate-grid">
          ${context.gates.map(renderGateCard).join('')}
        </div>
      </section>
    `;
  }

  function renderGateCard(gate) {
    const blockers = gate.blockers.length
      ? `<ul class="blocker-list">${gate.blockers.map((blocker) => `<li>${escapeHtml(blocker)}</li>`).join('')}</ul>`
      : '<p>No blocker recorded.</p>';

    return `
      <article class="gate-card">
        <div class="hero-topline">
          <h3>${escapeHtml(gate.label)}</h3>
          <span class="small-pill ${gate.status}">${statusLabels[gate.status]}</span>
        </div>
        ${blockers}
        <p><strong>Next:</strong> ${escapeHtml(gate.nextAction)}</p>
      </article>
    `;
  }

  function renderAiReview(context) {
    const review = context.aiReview;
    const flags = review?.flags ?? [];
    const preparedActions = review?.preparedActions ?? [];

    return `
      <section class="panel">
        <p class="eyebrow">AI review stub</p>
        <h2>Advisory only</h2>
        <p>${escapeHtml(review?.summary || 'No AI review record exists for this launch.')}</p>
        <h3>Flags</h3>
        <ul class="flag-list">
          ${(flags.length ? flags : ['No flags recorded.']).map((flag) => `<li>${escapeHtml(flag)}</li>`).join('')}
        </ul>
        <h3>Prepared actions</h3>
        <ul class="action-list">
          ${(preparedActions.length ? preparedActions : ['No prepared actions recorded.']).map((action) => `<li>${escapeHtml(action)}</li>`).join('')}
        </ul>
        <p class="approval-note">AI can summarize and prepare notes here; it cannot approve, send, sync, or mutate live records.</p>
      </section>
    `;
  }

  function renderApproval(context) {
    const approval = context.approval;
    const localNote = state.localApprovalNotes[context.launch.id] ?? approval?.reason ?? '';
    const hasLocalReason = Boolean(localNote.trim());
    const fakeReasonEntered = state.fakeReasonEntered.has(context.launch.id) || Boolean(approval?.reason?.trim());
    const reasonWarning = state.approvalReasonWarnings[context.launch.id];
    const reasonMessage = fakeReasonEntered
      ? 'A fake human reason is present for display only.'
      : 'A human reason is required before fake approval or rejection can be shown as complete.';

    return `
      <section class="panel">
        <p class="eyebrow">Approval control</p>
        <h2>Reason required</h2>
        <p>${escapeHtml(approval?.riskSummary || 'No approval request exists for this launch.')}</p>
        <p><span class="small-pill ${fakeReasonEntered ? 'ready' : 'needs_review'}">${escapeHtml(reasonMessage)}</span></p>
        <label for="approval-note" class="meta-label">Local approval note draft</label>
        <textarea id="approval-note" placeholder="Draft a local-only reason. Nothing is saved outside this page.">${escapeHtml(localNote)}</textarea>
        ${reasonWarning ? `<p class="form-hint warning" data-approval-warning>${escapeHtml(reasonWarning)}</p>` : ''}
        <div class="action-row">
          <button class="prototype-button" type="button" data-action="draft-approval-note">Draft approval note</button>
          <button class="prototype-button secondary" type="button" data-action="mark-fake-reason" ${hasLocalReason ? '' : 'disabled'}>Mark fake reason entered</button>
        </div>
      </section>
    `;
  }

  function renderTimeline(context) {
    const events = [...context.events].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
    return `
      <section class="panel">
        <p class="eyebrow">Activity and audit timeline</p>
        <h2>Every shown gate has a fake event</h2>
        <div class="timeline-list">
          ${events.map(renderTimelineCard).join('')}
        </div>
      </section>
    `;
  }

  function renderTimelineCard(event) {
    const actor = findById(collection('users'), event.actorId)?.name ?? event.actorId ?? 'Unknown actor';
    const gateType = event.metadata?.gateType ? ` · ${gateLabels[event.metadata.gateType]}` : '';
    return `
      <article class="timeline-card">
        <time datetime="${escapeAttr(event.createdAt)}">${escapeHtml(formatDateTime(event.createdAt))}</time>
        <strong>${escapeHtml(actor)}</strong>
        <p>${escapeHtml(humanize(event.action))}${escapeHtml(gateType)}</p>
      </article>
    `;
  }

  function getSelectedContext() {
    const launch = findById(collection('launches'), state.selectedLaunchId) ?? collection('launches')[0];
    return deriveLaunchContext(launch);
  }

  function deriveLaunchContext(launch) {
    const product = findById(collection('products'), launch.productId);
    const skuRecords = collection('skus').filter((sku) => sku.productId === launch.productId);
    const owner = findById(collection('users'), launch.ownerId);
    const channel = findById(collection('channels'), launch.targetChannelId);
    const supplierTerms = collection('supplierTerms').filter((term) => term.productId === launch.productId);
    const costModel = collection('costModels').find((model) => model.productId === launch.productId);
    const complianceRequirements = collection('complianceRequirements').filter(
      (requirement) => requirement.productId === launch.productId,
    );
    const launchGates = collection('launchGates').filter((gate) => gate.launchId === launch.id);
    const approval = collection('approvals').find((candidate) => {
      return launchGates.some((gate) => gate.requiredApprovalId === candidate.id) || candidate.entityId === launch.id;
    });
    const aiReview = collection('aiReviews').find((review) => review.launchId === launch.id);
    const gateIds = new Set(launchGates.map((gate) => gate.id));
    const events = collection('activityEvents').filter((event) => {
      return event.entityId === launch.id || gateIds.has(event.entityId) || event.metadata?.launchId === launch.id;
    });
    const context = {
      launch,
      product,
      skuRecords,
      owner,
      channel,
      supplierTerms,
      costModel,
      complianceRequirements,
      launchGates,
      approval,
      aiReview,
      events,
      title: product?.name ?? launch.id,
      ownerName: owner?.name ?? launch.ownerId,
      channelName: channel?.name ?? launch.targetChannelId,
    };

    context.gates = gateOrder.map((gateType) => deriveGate(gateType, context));
    context.blockers = context.gates.flatMap((gate) => gate.blockers.map((blocker) => `${gate.label}: ${blocker}`));
    context.readyGateCount = context.gates.filter((gate) => gate.status === 'ready').length;
    context.overallStatus = deriveOverallStatus(context.gates);
    context.approvalReasonState = deriveApprovalReasonState(context);

    return context;
  }

  function deriveGate(gateType, context) {
    const gate = context.launchGates.find((candidate) => candidate.gateType === gateType);
    const blockers = [...(gate?.blockers ?? [])];
    let status = normalizeStatus(gate?.status ?? 'not_started');
    let nextAction = gate?.nextAction ?? 'Create a fake gate record before showing readiness.';
    const hasGateEvent = gate
      ? context.events.some((event) => {
          return event.entityId === gate.id && event.metadata?.gateType === gateType;
        })
      : false;

    if (gate && !hasGateEvent) {
      blockers.push('Activity event for this gate transition is missing.');
      status = worsen(status, 'blocked');
      nextAction = 'Add a fake audit event before displaying this gate as ready.';
    }

    if (gateType === 'product') {
      if (!context.product) {
        blockers.push('Product record is missing.');
        status = worsen(status, 'blocked');
      }
      if (!context.skuRecords.length) {
        blockers.push('SKU record is missing.');
        status = worsen(status, 'blocked');
      }
    }

    if (gateType === 'supplier') {
      if (!context.supplierTerms.length) {
        blockers.push('Supplier terms are missing.');
        status = worsen(status, 'blocked');
      }
      if (context.supplierTerms.some((term) => term.status === 'blocked')) {
        blockers.push('A supplier term is blocked.');
        status = worsen(status, 'blocked');
      }
      if (context.supplierTerms.some((term) => ['draft', 'review_needed'].includes(term.status))) {
        status = worsen(status, 'needs_review');
      }
    }

    if (gateType === 'economics') {
      if (!context.costModel || typeof context.costModel.targetSellPrice !== 'number') {
        blockers.push('Target sell price is missing from the fake cost model.');
        status = worsen(status, 'blocked');
      } else if (['needs_human_review', 'needs_review', 'review_needed'].includes(context.costModel.status)) {
        status = worsen(status, 'needs_review');
      }
    }

    if (gateType === 'compliance') {
      if (!context.complianceRequirements.length) {
        blockers.push('Compliance requirement record is missing.');
        status = worsen(status, 'blocked');
      }
      const missingEvidence = context.complianceRequirements.flatMap((requirement) => requirement.missingEvidence ?? []);
      if (missingEvidence.length) {
        blockers.push(`Missing evidence: ${missingEvidence.join(', ')}.`);
        status = worsen(status, 'blocked');
      }
      if (context.complianceRequirements.some((requirement) => requirement.status === 'needs_review')) {
        status = worsen(status, 'needs_review');
      }
    }

    if (gateType === 'channel') {
      if (!context.channel) {
        blockers.push('Target channel is missing.');
        status = worsen(status, 'blocked');
      } else if (context.channel.syncMode !== 'disabled_fake_only') {
        blockers.push('Channel sync mode must stay disabled_fake_only in this slice.');
        status = worsen(status, 'blocked');
      }
    }

    if (gateType === 'ai_review' && !context.aiReview) {
      blockers.push('AI review stub record is missing.');
      status = worsen(status, 'not_started');
    }

    if (gateType === 'approval') {
      if (!context.approval) {
        blockers.push('Approval request is missing.');
        status = worsen(status, 'not_started');
      } else if (['approved', 'rejected'].includes(context.approval.status) && !context.approval.reason?.trim()) {
        blockers.push('Approval cannot be complete without a human reason.');
        status = worsen(status, 'blocked');
      } else if (!context.approval.reason?.trim()) {
        status = worsen(status, 'needs_review');
      }
    }

    if (blockers.length && status !== 'needs_review') {
      status = worsen(status, 'blocked');
    }

    return {
      label: gateLabels[gateType],
      gateType,
      status,
      blockers,
      nextAction,
    };
  }

  function deriveOverallStatus(gates) {
    if (gates.some((gate) => gate.status === 'blocked')) {
      return 'blocked';
    }
    if (gates.some((gate) => ['needs_review', 'not_started'].includes(gate.status))) {
      return 'needs_review';
    }
    return 'ready';
  }

  function deriveApprovalReasonState(context) {
    if (context.approval?.reason?.trim()) {
      return 'recorded in fake data';
    }
    if (state.fakeReasonEntered.has(context.launch.id)) {
      return 'entered locally';
    }
    return 'required';
  }

  function getNextSafeAction(context) {
    const firstBlocked = context.gates.find((gate) => gate.status === 'blocked');
    if (firstBlocked) {
      return firstBlocked.nextAction;
    }

    const firstReview = context.gates.find((gate) => gate.status === 'needs_review' || gate.status === 'not_started');
    if (firstReview) {
      return firstReview.nextAction;
    }

    return 'Keep the launch staged in this repo-local cockpit and wait for Themis/ANANKE review.';
  }

  function buildApprovalDraft(context) {
    const blockerLine = context.blockers.length
      ? `Review these blockers before any fake decision: ${context.blockers.join('; ')}`
      : 'All displayed fake readiness gates are clear.';
    return `${context.title}: local approval note draft. ${blockerLine} This note is not saved to a backend and does not trigger external activity.`;
  }

  function collection(name) {
    return state.data?.[name] ?? [];
  }

  function findById(records, id) {
    return records.find((record) => record.id === id);
  }

  function normalizeStatus(status) {
    if (status === 'approved' || status === 'cleared') {
      return 'ready';
    }
    if (status === 'requested' || status === 'draft') {
      return 'needs_review';
    }
    return statusLabels[status] ? status : 'not_started';
  }

  function worsen(current, next) {
    return statusPriority[next] > statusPriority[current] ? next : current;
  }

  function formatDate(value) {
    if (!value) {
      return 'Missing';
    }

    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00Z`));
  }

  function formatDateTime(value) {
    if (!value) {
      return 'Missing time';
    }

    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'UTC',
    }).format(new Date(value));
  }

  function humanize(value) {
    return String(value).replaceAll('_', ' ');
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }
})();
