import { normalizeInterests } from "./interests";

const PROFILE_KEY = "lingtu_profile_v2";
const LEGACY_KEY = "lingtu_profile_v1";

export const EMPTY_PROFILE = {
  pace: "适中",
  with: "",
  foodPreference: "",
  interests: [], // 有序多选（最多 3 个）
  people: 2,
  profileTags: [],
};

function hydrate(saved) {
  return {
    ...EMPTY_PROFILE,
    ...saved,
    // 兼容 v1 的单选字符串
    interests: normalizeInterests(
      Array.isArray(saved.interests)
        ? saved.interests
        : saved.interests
          ? [saved.interests]
          : []
    ),
    people: Number(saved.people) > 0 ? Number(saved.people) : EMPTY_PROFILE.people,
    profileTags: Array.isArray(saved.profileTags) ? saved.profileTags : [],
  };
}

export function loadProfile() {
  try {
    const raw =
      localStorage.getItem(PROFILE_KEY) || localStorage.getItem(LEGACY_KEY);
    const saved = JSON.parse(raw || "null");
    if (!saved || typeof saved !== "object") return EMPTY_PROFILE;
    return hydrate(saved);
  } catch {
    return EMPTY_PROFILE;
  }
}

export function saveProfile(form) {
  try {
    const profile = {
      pace: form.pace || "适中",
      with: form.with || "",
      foodPreference: form.foodPreference || "",
      interests: normalizeInterests(form.interests),
      people: Number(form.people) > 0 ? Number(form.people) : 2,
      profileTags: Array.isArray(form.profileTags) ? form.profileTags.slice(0, 8) : [],
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return profile;
  } catch {
    return null;
  }
}
