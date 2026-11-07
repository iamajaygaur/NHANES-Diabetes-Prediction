import {
  Activity,
  Beer,
  Cigarette,
  HeartPulse,
  Ruler,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export type FeaturePack = {
  id: string;
  title: string;
  blurb: string;
  initial: string;
  accent: string;
  ring: string;
  tint: string;
  icon: LucideIcon;
  keys: string[];
  match: (name: string) => boolean;
};

/** Shared NHANES feature packs used by Dataset tracks and Predict releases. */
export const FEATURE_PACKS: FeaturePack[] = [
  {
    id: "demo",
    title: "Demographics",
    blurb: "Age, sex, race, education, household",
    initial: "D",
    accent: "from-orange-400 to-amber-500",
    ring: "#f97316",
    tint: "bg-orange-500/15 text-orange-700 dark:text-orange-300",
    icon: UserRound,
    keys: [
      "RIDSTATR",
      "RIAGENDR",
      "RIDAGEYR",
      "RIDRETH1",
      "RIDRETH3",
      "RIDEXMON",
      "DMQMILIZ",
      "DMDBORN4",
      "DMDYRUSR",
      "DMDEDUC2",
      "DMDMARTZ",
      "RIDEXPRG",
      "DMDHHSIZ",
      "INDFMPIR",
    ],
    match: (n) =>
      /^(RID|DMQ|DMD|IND)/.test(n) || ["RIAGENDR", "RIDSTATR"].includes(n),
  },
  {
    id: "body",
    title: "Body measures",
    blurb: "BMI, weight, height, waist",
    initial: "B",
    accent: "from-sky-500 to-blue-600",
    ring: "#0ea5e9",
    tint: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    icon: Ruler,
    keys: ["BMXBMI", "BMXWT", "BMXHT", "BMXWAIST"],
    match: (n) => n.startsWith("BMX"),
  },
  {
    id: "bp",
    title: "Blood pressure",
    blurb: "Readings, pulse, HTN & lipids history",
    initial: "P",
    accent: "from-rose-500 to-red-600",
    ring: "#f43f5e",
    tint: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    icon: HeartPulse,
    keys: [
      "BPXOSY1",
      "BPXODI1",
      "BPXOSY2",
      "BPXODI2",
      "BPXOSY3",
      "BPXODI3",
      "BPXOPLS1",
      "BPXOPLS2",
      "BPXOPLS3",
      "BPQ020",
      "BPQ030",
      "BPQ150",
      "BPQ080",
      "BPQ101D",
    ],
    match: (n) => n.startsWith("BPX") || n.startsWith("BPQ"),
  },
  {
    id: "activity",
    title: "Physical activity",
    blurb: "Work activity and sedentary time",
    initial: "A",
    accent: "from-emerald-400 to-teal-600",
    ring: "#10b981",
    tint: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    icon: Activity,
    keys: ["PAD790Q", "PAD790U", "PAD800", "PAD810Q", "PAD810U", "PAD820", "PAD680"],
    match: (n) => n.startsWith("PAD"),
  },
  {
    id: "smoking",
    title: "Smoking",
    blurb: "Lifetime and recent cigarette use",
    initial: "S",
    accent: "from-violet-500 to-indigo-600",
    ring: "#8b5cf6",
    tint: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    icon: Cigarette,
    keys: ["SMQ020", "SMQ040", "SMD641", "SMD650"],
    match: (n) => n.startsWith("SMQ") || n.startsWith("SMD"),
  },
  {
    id: "alcohol",
    title: "Alcohol",
    blurb: "Frequency and heavy drinking markers",
    initial: "L",
    accent: "from-fuchsia-500 to-pink-600",
    ring: "#d946ef",
    tint: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300",
    icon: Beer,
    keys: ["ALQ111", "ALQ121", "ALQ130", "ALQ142", "ALQ270", "ALQ280", "ALQ151", "ALQ170"],
    match: (n) => n.startsWith("ALQ"),
  },
];
