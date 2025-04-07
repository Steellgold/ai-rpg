import { SubscriptionTier, SUBSCRIPTION_PLANS } from "./subscription-plan";

export function getJobPriorityForUser(subscriptionTier: SubscriptionTier): number {
  const plan = SUBSCRIPTION_PLANS[subscriptionTier];
  return plan ? plan.priorityLevel : 0;
}

export const PRIORITY_LABELS = {
  0: "Utils.Priority.Labels.Standard",
  1: "Utils.Priority.Labels.Improved",
  2: "Utils.Priority.Labels.High",
  3: "Utils.Priority.Labels.Maximum"
};

export function calculateEstimatedWaitTime(position: number, priority: number): number {
  const baseTimePerJob = 2;
  const priorityFactor = [1, 0.8, 0.6, 0.4][priority] || 1;
  return Math.max(1, Math.ceil(position * baseTimePerJob * priorityFactor));
}

export function formatWaitTimeKey(minutes: number): string {
  if (minutes < 1) {
    return "Utils.Priority.WaitTime.LessThanMinute";
  } else if (minutes < 60) {
    return "Utils.Priority.WaitTime.Minutes|minutes=" + minutes;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `Utils.Priority.WaitTime.Hours|hours=${hours}|minutes=${remainingMinutes}`;
  }
}