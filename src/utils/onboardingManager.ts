import * as SecureStore from "expo-secure-store";

const ONBOARDING_KEY = "jefflink_onboarding_complete";
const ONBOARDING_VERSION = "1";

export const onboardingManager = {
  async isComplete(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return value === ONBOARDING_VERSION;
  },
  async markComplete(): Promise<void> {
    await SecureStore.setItemAsync(ONBOARDING_KEY, ONBOARDING_VERSION);
  },
  async reset(): Promise<void> {
    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
  }
};
