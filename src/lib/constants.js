// App version - increment on every deploy
export const APP_VERSION = "1.1.0";

// Available avatars for kid profiles
export const AVATARS = [
  { id: "rocket", name: "Rocket", emoji: "🚀" },
  { id: "dinosaur", name: "Dinosaur", emoji: "🦕" },
  { id: "rainbow", name: "Rainbow", emoji: "🌈" },
  { id: "robot", name: "Robot", emoji: "🤖" },
  { id: "unicorn", name: "Unicorn", emoji: "🦄" },
  { id: "astronaut", name: "Astronaut", emoji: "👨‍🚀" },
  { id: "dragon", name: "Dragon", emoji: "🐉" },
  { id: "penguin", name: "Penguin", emoji: "🐧" }
];

// Available silly names for kid profiles
export const SILLY_NAMES = [
  "Captain Bubbles",
  "Professor Giggles",
  "Doctor Spaghetti",
  "Major Zoom",
  "Sergeant Sparkle",
  "Commander Waffle",
  "Admiral Noodles",
  "Chief Wobblebottom",
  "Baron Von Fuzzypants",
  "Lady Bumblebee"
];

// Default profile IDs
export const PROFILE_IDS = ["profile_1", "profile_2"];

// Default profiles with pre-configured settings
export const DEFAULT_PROFILES = [
  {
    id: "profile_1",
    avatarId: "rocket",
    sillyName: "Captain Bubbles",
    createdAt: new Date().toISOString(),
  },
  {
    id: "profile_2",
    avatarId: "dinosaur",
    sillyName: "Professor Giggles",
    createdAt: new Date().toISOString(),
  },
];
