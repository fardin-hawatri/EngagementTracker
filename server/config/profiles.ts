import type { ConnectedPlatform, ConnectedProfile } from "../../shared/types";

export interface ProfileDefinition {
  id: string;
  label: string;
  platform: ConnectedPlatform;
  usernameHint: string;
  /** Env var that holds the access token for this profile. */
  tokenEnv: string;
}

/**
 * Connected accounts. Add Facebook entries here later with platform: "facebook"
 * and a FACEBOOK_* token env once the Facebook connector exists.
 */
export const PROFILE_DEFINITIONS: ProfileDefinition[] = [
  {
    id: "mallika-some",
    label: "mallika.some",
    platform: "instagram",
    usernameHint: "mallika.some",
    tokenEnv: "INSTAGRAM_ACCESS_TOKEN",
  },
  {
    id: "mallika-some-global",
    label: "mallika.some.global",
    platform: "instagram",
    usernameHint: "mallika.some.global",
    tokenEnv: "INSTAGRAM_ACCESS_TOKEN_GLOBAL",
  },
];

export interface RuntimeProfile extends ProfileDefinition {
  token: string;
}

export function listPublicProfiles(): ConnectedProfile[] {
  return PROFILE_DEFINITIONS.map((profile) => ({
    id: profile.id,
    label: profile.label,
    platform: profile.platform,
    usernameHint: profile.usernameHint,
    configured: Boolean(process.env[profile.tokenEnv]?.trim()),
  }));
}

export function getConfiguredProfiles(): RuntimeProfile[] {
  return PROFILE_DEFINITIONS.flatMap((profile) => {
    const token = process.env[profile.tokenEnv]?.trim();
    if (!token) return [];
    return [{ ...profile, token }];
  });
}

export function getDefaultProfileId(): string {
  const configured = getConfiguredProfiles();
  if (configured[0]) return configured[0].id;
  return PROFILE_DEFINITIONS[0]?.id ?? "mallika-some";
}

export function resolveProfile(profileId?: string | null): RuntimeProfile {
  const configured = getConfiguredProfiles();
  if (configured.length === 0) {
    throw new Error(
      "No connected profiles configured. Set INSTAGRAM_ACCESS_TOKEN and/or INSTAGRAM_ACCESS_TOKEN_GLOBAL.",
    );
  }

  const id = profileId?.trim() || getDefaultProfileId();
  const match = configured.find((profile) => profile.id === id);
  if (!match) {
    const known = configured.map((profile) => profile.id).join(", ");
    throw new Error(`Unknown or unconfigured profile "${id}". Available: ${known}`);
  }

  if (match.platform === "facebook") {
    throw new Error(`Facebook connector is not implemented yet for profile "${match.id}".`);
  }

  return match;
}
