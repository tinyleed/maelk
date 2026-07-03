export type DemoLaunch = {
  id: string;
  name: string;
  status: "ready" | "blocked";
  owner: string;
  nextAction: string;
};

export const demoLaunches: DemoLaunch[] = [
  {
    id: "lnch_oat_barista_q3",
    name: "Oat Barista 1L",
    status: "blocked",
    owner: "Launch lead",
    nextAction: "Collect missing compliance evidence before review.",
  },
  {
    id: "lnch_cloudberry_yogurt_ready",
    name: "Cloudberry Yogurt 500g",
    status: "ready",
    owner: "Channel manager",
    nextAction: "Keep staged locally until human review accepts the slice.",
  },
  {
    id: "lnch_nordic_granola_reset",
    name: "Nordic Granola 350g",
    status: "blocked",
    owner: "Launch lead",
    nextAction: "Resolve supplier and economics blockers before approval.",
  },
];
