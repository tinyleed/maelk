import {
  createProductLaunchSummaries,
  productLaunchFixtures,
  type ProductLaunchSummary,
} from "~/modules/product-launch-os";

export type DemoLaunch = ProductLaunchSummary;

export const demoLaunches: DemoLaunch[] = createProductLaunchSummaries(productLaunchFixtures);
