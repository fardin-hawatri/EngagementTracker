export interface TopicDefinition {
  id: string;
  label: string;
  category: string;
  keywords: string[];
}

export interface CategoryDefinition {
  id: string;
  label: string;
}

export const CATEGORIES: CategoryDefinition[] = [
  { id: "FACE", label: "FACE" },
  { id: "NECK", label: "NECK / POSTURE" },
  { id: "BODY", label: "BODY" },
  { id: "SPECIALIZED", label: "SPECIALIZED" },
  { id: "GENERAL", label: "GENERAL" },
];

export const TOPICS: TopicDefinition[] = [
  {
    id: "smile-lines",
    label: "Smile Lines",
    category: "FACE",
    keywords: [
      "smile line", "smile lines", "nasolabial", "nasolabial fold", "laugh line",
      "laugh lines", "marionette", "mouth wrinkle", "mouth wrinkles", "parenthesis",
    ],
  },
  {
    id: "forehead-lines",
    label: "Forehead Lines",
    category: "FACE",
    keywords: ["forehead", "forehead line", "forehead lines", "frontalis", "brow line", "horizontal line"],
  },
  {
    id: "frown-lines",
    label: "Frown Lines",
    category: "FACE",
    keywords: ["frown", "frown line", "glabella", "glabellar", "11s", "11 lines", "between brows", "angry 11"],
  },
  {
    id: "dark-circles",
    label: "Dark Circles",
    category: "FACE",
    keywords: ["dark circle", "dark circles", "under eye circle", "undereye circle", "tired eyes", "eye darkness"],
  },
  {
    id: "eye-bags",
    label: "Eye Bags",
    category: "FACE",
    keywords: ["eye bag", "eye bags", "bags under", "under eye bag", "baggy eyes"],
  },
  {
    id: "puffy-eyes",
    label: "Puffy Eyes",
    category: "FACE",
    keywords: ["puffy eye", "puffy eyes", "puffiness", "morning puff", "swollen eye", "eye swelling"],
  },
  {
    id: "puffy-cheeks",
    label: "Puffy Cheeks",
    category: "FACE",
    keywords: ["puffy cheek", "puffy cheeks", "chipmunk", "swollen cheek", "cheek puff"],
  },
  {
    id: "slimmer-cheeks",
    label: "Slimmer Cheeks",
    category: "FACE",
    keywords: [
      "slimmer cheek", "slim cheek", "cheek slim", "buccal", "cheek hollow",
      "sculpt cheek", "cheek lift", "cheekbone lift", "reduce cheeks",
    ],
  },
  {
    id: "cheekbones",
    label: "Cheekbones",
    category: "FACE",
    keywords: ["cheekbone", "cheekbones", "zygomatic", "high cheek", "define cheek"],
  },
  {
    id: "jawline",
    label: "Jawline",
    category: "FACE",
    keywords: ["jawline", "jaw line", "jaw sculpt", "mandible", "jaw definition", "defined jaw", "v-line", "vline"],
  },
  {
    id: "double-chin",
    label: "Double Chin",
    category: "FACE",
    keywords: ["double chin", "submental", "under chin", "chin fat", "chin tuck fat"],
  },
  {
    id: "saggy-jaw",
    label: "Saggy Jaw",
    category: "FACE",
    keywords: ["saggy jaw", "jowl", "jowls", "sagging jaw", "jaw sag"],
  },
  {
    id: "saggy-neck",
    label: "Saggy Neck",
    category: "FACE",
    keywords: ["saggy neck", "turkey neck", "neck sag", "crepey neck", "neck skin"],
  },
  {
    id: "neck-fat",
    label: "Neck Fat",
    category: "FACE",
    keywords: ["neck fat", "fat neck", "neck bulge"],
  },
  {
    id: "chin-wrinkles",
    label: "Chin Wrinkles",
    category: "FACE",
    keywords: ["chin wrinkle", "chin wrinkles", "orange peel chin", "pebble chin", "mentalis"],
  },
  {
    id: "lip-lines",
    label: "Lip Lines",
    category: "FACE",
    keywords: ["lip line", "lip lines", "smoker line", "smokers line", "barcode lip", "perioral"],
  },
  {
    id: "lip-corners",
    label: "Lip Corners",
    category: "FACE",
    keywords: ["lip corner", "downturned", "mouth corner", "oral commissure", "sad mouth"],
  },
  {
    id: "face-lifting",
    label: "Face Lifting",
    category: "FACE",
    keywords: ["face lift", "facelift", "face lifting", "natural lift", "lifted face", "sculpt face"],
  },
  {
    id: "facial-symmetry",
    label: "Facial Symmetry",
    category: "FACE",
    keywords: ["symmetry", "asymmetry", "uneven face", "crooked", "facial balance"],
  },
  {
    id: "general-face-yoga",
    label: "General Face Yoga",
    category: "FACE",
    keywords: [
      "face yoga", "facial yoga", "face workout", "face exercise", "facial exercise",
      "face massage", "gua sha", "face sculpt", "facial workout",
    ],
  },
  {
    id: "neck-tension",
    label: "Neck Tension",
    category: "NECK",
    keywords: ["neck tension", "tight neck", "neck tightness", "suboccipital", "base of skull"],
  },
  {
    id: "neck-stiffness",
    label: "Neck Stiffness",
    category: "NECK",
    keywords: ["stiff neck", "neck stiffness", "locked neck", "neck lock"],
  },
  {
    id: "neck-mobility",
    label: "Neck Mobility",
    category: "NECK",
    keywords: ["neck mobility", "neck stretch", "neck range", "neck rotation", "neck movement"],
  },
  {
    id: "posture",
    label: "Posture",
    category: "NECK",
    keywords: ["posture", "forward head", "tech neck", "text neck", "desk neck", "hunch"],
  },
  {
    id: "shoulder-tension",
    label: "Shoulder Tension",
    category: "NECK",
    keywords: ["shoulder tension", "tight shoulder", "trap tension", "upper trap", "shoulders tight"],
  },
  {
    id: "frozen-shoulder",
    label: "Frozen Shoulder",
    category: "NECK",
    keywords: ["frozen shoulder", "adhesive capsulitis", "stiff shoulder"],
  },
  {
    id: "belly-fat",
    label: "Belly Fat",
    category: "BODY",
    keywords: ["belly fat", "stomach fat", "tummy fat", "gut fat"],
  },
  {
    id: "upper-belly",
    label: "Upper Belly",
    category: "BODY",
    keywords: ["upper belly", "upper stomach", "epigastric", "upper abs"],
  },
  {
    id: "lower-belly",
    label: "Lower Belly",
    category: "BODY",
    keywords: ["lower belly", "lower stomach", "lower tummy", "pooch", "lower abs"],
  },
  {
    id: "waist",
    label: "Waist",
    category: "BODY",
    keywords: ["waist", "waistline", "hourglass", "oblique", "cinch"],
  },
  {
    id: "back-fat",
    label: "Back Fat",
    category: "BODY",
    keywords: ["back fat", "bra fat", "bra bulge", "posterior fat"],
  },
  {
    id: "arm-fat",
    label: "Arm Fat",
    category: "BODY",
    keywords: ["arm fat", "bat wing", "bingo wing", "flabby arm", "tricep fat"],
  },
  {
    id: "thigh-fat",
    label: "Thigh Fat",
    category: "BODY",
    keywords: ["thigh fat", "thighs", "outer thigh", "saddlebag"],
  },
  {
    id: "inner-thigh",
    label: "Inner Thigh",
    category: "BODY",
    keywords: ["inner thigh", "thigh gap", "adductor"],
  },
  {
    id: "legs",
    label: "Legs",
    category: "BODY",
    keywords: ["legs", "leg workout", "calves", "quad", "leg sculpt"],
  },
  {
    id: "hips",
    label: "Hips",
    category: "BODY",
    keywords: ["hips", "hip dip", "hip dips", "glute", "hip mobility"],
  },
  {
    id: "chest",
    label: "Chest",
    category: "BODY",
    keywords: ["chest", "pectoral", "chest tightness", "open chest"],
  },
  {
    id: "body-fat-reduction",
    label: "Body Fat Reduction",
    category: "BODY",
    keywords: ["body fat", "fat reduction", "lose fat", "fat loss", "slim body"],
  },
  {
    id: "lymphatic-drainage",
    label: "Lymphatic Drainage",
    category: "SPECIALIZED",
    keywords: ["lymph", "lymphatic", "drainage", "de-puff", "depuff", "fluid retention"],
  },
  {
    id: "eye-exercises",
    label: "Eye Exercises",
    category: "SPECIALIZED",
    keywords: ["eye exercise", "eye yoga", "vision exercise", "orbicularis", "eye workout"],
  },
  {
    id: "headache-tension",
    label: "Headache Tension",
    category: "SPECIALIZED",
    keywords: ["headache", "migraine", "tension headache", "head tension"],
  },
  {
    id: "temporalis",
    label: "Temporalis / Temple Tension",
    category: "SPECIALIZED",
    keywords: ["temporalis", "temple", "temples", "tmj", "jaw clench", "jaw tension", "clenching"],
  },
  {
    id: "hairfall",
    label: "Hairfall",
    category: "SPECIALIZED",
    keywords: ["hairfall", "hair fall", "hair loss", "scalp", "hair growth"],
  },
  {
    id: "general-facial-exercise",
    label: "General Facial Exercise",
    category: "GENERAL",
    keywords: ["facial", "face routine", "face tip"],
  },
  {
    id: "general-fitness",
    label: "General Fitness",
    category: "GENERAL",
    keywords: ["workout", "fitness", "exercise at home", "home workout"],
  },
  {
    id: "general-wellness",
    label: "General Wellness",
    category: "GENERAL",
    keywords: ["wellness", "self care", "self-care", "relax", "stress relief"],
  },
  {
    id: "other",
    label: "Other",
    category: "GENERAL",
    keywords: [],
  },
  {
    id: "uncategorized",
    label: "Uncategorized",
    category: "GENERAL",
    keywords: [],
  },
];

export const CONTENT_TYPES = [
  "Exercise",
  "Routine",
  "Quick Tip",
  "Tutorial",
  "Before / After",
  "Educational",
  "Problem / Solution",
  "Myth / Fact",
  "Transformation",
  "Other",
] as const;
