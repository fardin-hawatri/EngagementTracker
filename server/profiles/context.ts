import { AsyncLocalStorage } from "node:async_hooks";
import type { RuntimeProfile } from "../config/profiles";

const profileStore = new AsyncLocalStorage<RuntimeProfile>();

export function runWithProfile<T>(profile: RuntimeProfile, fn: () => Promise<T>): Promise<T> {
  return profileStore.run(profile, fn);
}

export function getActiveProfile(): RuntimeProfile {
  const profile = profileStore.getStore();
  if (!profile) {
    throw new Error("No active profile in request context.");
  }
  return profile;
}
