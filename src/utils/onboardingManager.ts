import { secureStorage } from "./secureStorage";

const ONBOARDING_KEY = "jefflink_onboarding_complete";
const ONBOARDING_VERSION = "2";

export const onboardingManager = {
  async isComplete(): Promise<boolean> {
    const value = await secureStorage.getItem(ONBOARDING_KEY);
    return value === ONBOARDING_VERSION;
  },
  async markComplete(): Promise<void> {
    await secureStorage.setItem(ONBOARDING_KEY, ONBOARDING_VERSION);
  },
  async reset(): Promise<void> {
    await secureStorage.removeItem(ONBOARDING_KEY);
  }
};
