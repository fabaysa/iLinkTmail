import { randomInt } from "node:crypto";

const INDONESIAN_FIRST_NAMES = [
  "adi", "aditya", "agung", "ahmad", "aji", "akbar", "aldi", "alfian", "alif",
  "amalia", "amelia", "andika", "andre", "anggi", "anggun", "anisa", "annisa",
  "ari", "arif", "arya", "aulia", "ayu", "bagas", "bagus", "bayu", "bima",
  "bintang", "budi", "cahya", "citra", "damar", "dani", "danu", "dedi", "devi",
  "dewi", "dian", "dimas", "dina", "dinda", "doni", "dwi", "eka", "eko", "elsa",
  "endi", "erik", "fajar", "farah", "farhan", "farras", "fathur", "fauzan",
  "febri", "fika", "fikri", "fitri", "galang", "galih", "gilang", "gita", "hana",
  "hanif", "hendra", "heru", "ilham", "indah", "indra", "intan", "iqbal", "ira",
  "irfan", "irwan", "jihan", "kemal", "kevin", "kiki", "laras", "lestari",
  "luthfi", "maharani", "maya", "mega", "melati", "mira", "muhammad",
  "mutiara", "nabila", "nada", "nadia", "naura", "nia", "nisa", "novi",
  "nugroho", "nurul", "oktavia", "pandu", "pramudya", "pratama", "putra",
  "putri", "radit", "rafi", "rahma", "rahmat", "raka", "rama", "randi", "rani",
  "ratna", "rayhan", "renata", "rendi", "resa", "reza", "ria", "ridho",
  "ridwan", "rifqi", "rika", "rina", "rio", "riska", "rizal", "rizki", "rizky",
  "salma", "salsa", "sandi", "sari", "satria", "sekar", "shinta", "sinta",
  "siti", "suci", "surya", "syifa", "tari", "tasya", "taufik", "tiara", "tika",
  "tina", "tri", "utami", "vera", "vita", "wahyu", "wawan", "widya", "wulan",
  "yoga", "yogi", "yuda", "yudi", "yulia", "yuni", "zahra", "zaki",
] as const;

const INDONESIAN_LAST_NAMES = [
  "adi", "aditya", "akbar", "amalia", "andini", "anggraini", "anwar",
  "ardiansyah", "arifin", "arman", "astuti", "atmojo", "azis", "bakti",
  "budiman", "cahyadi", "cahyani", "darmawan", "dewi", "fadhilah", "fauzi",
  "firmansyah", "gunawan", "hakim", "handayani", "hariyanto", "hartono",
  "haryanto", "hasan", "hermawan", "hidayat", "hutomo", "ibrahim", "iskandar",
  "jayanti", "kartika", "kurnia", "kurniawan", "kusuma", "lestari", "mahendra",
  "mansur", "maulana", "mulyadi", "munawar", "nugraha", "nugroho", "nuraini",
  "oktaviani", "pangestu", "permadi", "permata", "pertiwi", "prabowo",
  "pradana", "prakoso", "pramono", "prasetyo", "pratama", "prayoga", "purba",
  "purnama", "purwanto", "putra", "putri", "rahayu", "rahmadi", "rahman",
  "ramadhan", "ramadhani", "ratnasari", "rianto", "rosadi", "safitri", "salim",
  "santoso", "saputra", "saputri", "sari", "setiawan", "setiawati", "setyawan",
  "siregar", "subagyo", "sudrajat", "sugiarto", "suhendra", "sulistyo",
  "sunardi", "supriadi", "suryadi", "susanto", "susilo", "sutanto", "suwandi",
  "syahputra", "tanjung", "utami", "utomo", "wardani", "wibisono", "wibowo",
  "wicaksono", "widodo", "wijaya", "winata", "yulianti", "yusuf", "zulkarnain",
] as const;

const INTERNATIONAL_FIRST_NAMES = [
  "aaron", "adam", "adrian", "aidan", "alex", "alexander", "alice", "amber",
  "amelia", "andrew", "anna", "anthony", "aria", "arthur", "ashley", "austin",
  "ava", "benjamin", "blake", "brandon", "brian", "brooke", "caleb", "camila",
  "carlos", "caroline", "charlotte", "chloe", "chris", "christian", "claire",
  "clara", "cole", "connor", "daniel", "david", "derek", "diana", "diego",
  "dylan", "elena", "eli", "elijah", "eliza", "ella", "emily", "emma", "eric",
  "ethan", "eva", "evan", "felix", "fiona", "gabriel", "grace", "hailey",
  "hannah", "harper", "harry", "hazel", "henry", "hugo", "ian", "isaac",
  "isabella", "ivan", "jack", "jacob", "jake", "james", "jasmine", "jason",
  "javier", "jenna", "jennifer", "jeremy", "jessica", "joel", "john", "jonah",
  "jordan", "joseph", "joshua", "julia", "julian", "justin", "kai", "kate",
  "katherine", "kayla", "keith", "kelly", "kenji", "kevin", "kyle", "laura",
  "lauren", "layla", "leo", "leon", "liam", "lillian", "lily", "logan", "lucas",
  "lucy", "luke", "madison", "marcus", "maria", "mario", "mark", "mason",
  "mateo", "matthew", "max", "maya", "megan", "mia", "michael", "miles", "mila",
  "naomi", "natalie", "nathan", "nicole", "nina", "noah", "nolan", "nora",
  "oliver", "olivia", "omar", "oscar", "owen", "paige", "parker", "patrick",
  "paul", "peter", "rachel", "rafael", "rebecca", "riley", "robert", "robin",
  "ruby", "ryan", "sam", "samantha", "samuel", "sara", "sarah", "scott",
  "sean", "sebastian", "serena", "shane", "simon", "sofia", "sophia", "stella",
  "stephen", "steven", "summer", "sydney", "tariq", "taylor", "thomas", "toby",
  "tyler", "victoria", "vincent", "violet", "william", "wyatt", "xavier",
  "zach", "zoe",
] as const;

const INTERNATIONAL_LAST_NAMES = [
  "adams", "allen", "anderson", "bailey", "baker", "barnes", "bell", "bennett",
  "brooks", "brown", "bryant", "butler", "campbell", "carter", "chen", "clark",
  "coleman", "collins", "cook", "cooper", "cox", "cruz", "davis", "diaz",
  "edwards", "ellis", "evans", "fisher", "flores", "foster", "garcia", "gomez",
  "gonzalez", "gray", "green", "griffin", "hall", "hamilton", "harris", "hayes",
  "henderson", "hernandez", "hill", "howard", "hughes", "hunter", "jackson",
  "james", "jenkins", "johnson", "jones", "kelly", "kennedy", "kim", "king",
  "lee", "lewis", "long", "lopez", "martin", "martinez", "mason", "miller",
  "mitchell", "moore", "morales", "morgan", "morris", "murphy", "myers",
  "nelson", "nguyen", "ortiz", "palmer", "park", "parker", "patel", "perez",
  "perry", "peterson", "phillips", "powell", "price", "ramirez", "reed",
  "reyes", "reynolds", "richardson", "rivera", "roberts", "robinson",
  "rodriguez", "rogers", "ross", "russell", "sanchez", "sanders", "scott",
  "shaw", "simmons", "smith", "stewart", "sullivan", "tanaka", "taylor",
  "thomas", "thompson", "torres", "turner", "walker", "wallace", "walsh",
  "ward", "watson", "west", "white", "williams", "wilson", "wood", "wright",
  "young",
] as const;

const MIDDLE_INITIALS = "abcdefghjklmnprstwy";
const VALID_LOCAL_PART_PATTERN = /^[a-z0-9](?:[a-z0-9_-]*[a-z0-9])?$/;

type NameContext = {
  first: string;
  last: string;
  middleInitial: string;
  num2: string;
  numShort: string;
};

type UsernameTemplate = (ctx: NameContext) => string;

function pickOne<T>(items: readonly T[]): T {
  return items[randomInt(items.length)];
}

function pickDifferent(items: readonly string[], exclude: readonly string[]): string {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = pickOne(items);
    if (!exclude.includes(candidate)) return candidate;
  }
  return items.find((item) => !exclude.includes(item)) || items[0];
}

function randomShortTwoDigit(): string {
  return String(randomInt(1, 100)).padStart(2, "0");
}

function randomShortTwoOrThreeDigit(): string {
  if (randomInt(100) < 70) return randomShortTwoDigit();
  return String(randomInt(100, 1000));
}

function pickNamePools(): { firstNames: readonly string[]; lastNames: readonly string[] } {
  const roll = randomInt(100);
  if (roll < 45) return { firstNames: INDONESIAN_FIRST_NAMES, lastNames: INDONESIAN_LAST_NAMES };
  if (roll < 90) return { firstNames: INTERNATIONAL_FIRST_NAMES, lastNames: INTERNATIONAL_LAST_NAMES };
  if (randomInt(2) === 0) return { firstNames: INDONESIAN_FIRST_NAMES, lastNames: INTERNATIONAL_LAST_NAMES };
  return { firstNames: INTERNATIONAL_FIRST_NAMES, lastNames: INDONESIAN_LAST_NAMES };
}

const USERNAME_TEMPLATES: readonly UsernameTemplate[] = [
  ({ first, last, num2 }) => `${first}${last}${num2}`,
  ({ first, last, num2 }) => `${first}_${last}${num2}`,
  ({ first, last, num2 }) => `${first}-${last}${num2}`,
  ({ first, last, num2 }) => `${first}${last}_${num2}`,
  ({ first, last, num2 }) => `${first}_${last}_${num2}`,
  ({ first, last, num2 }) => `${first}-${last}-${num2}`,
  ({ first, last, numShort }) => `${first[0]}${last}${numShort}`,
  ({ first, last, numShort }) => `${first[0]}_${last}${numShort}`,
  ({ first, last, numShort }) => `${first[0]}-${last}${numShort}`,
  ({ first, last, numShort }) => `${first}${last[0]}${numShort}`,
  ({ first, last, numShort }) => `${first}_${last[0]}${numShort}`,
  ({ first, last, numShort }) => `${first}-${last[0]}${numShort}`,
  ({ first, middleInitial, last, num2 }) => `${first}_${middleInitial}_${last}${num2}`,
  ({ first, middleInitial, last, num2 }) => `${first}-${middleInitial}-${last}${num2}`,
  ({ first, last, num2 }) => `${last}_${first}${num2}`,
  ({ first, last, num2 }) => `${last}${first}${num2}`,
  ({ first, numShort }) => `${first}${numShort}`,
  ({ first, numShort }) => `${first}_${numShort}`,
  ({ first, numShort }) => `${first}-${numShort}`,
];

function isValidGeneratedUsername(value: string): boolean {
  return (
    value.length >= 3 &&
    value.length <= 40 &&
    !value.includes(".") &&
    VALID_LOCAL_PART_PATTERN.test(value) &&
    !/--|__|_-|-_/.test(value)
  );
}

/**
 * Generates a realistic, dot-free, person-style email username with a short numeric suffix.
 */
export function generatePersonUsername(): string {
  const { firstNames, lastNames } = pickNamePools();
  const first = pickOne(firstNames);
  const last = pickDifferent(lastNames, [first]);
  const ctx: NameContext = {
    first,
    last,
    middleInitial: MIDDLE_INITIALS[randomInt(MIDDLE_INITIALS.length)],
    num2: randomShortTwoDigit(),
    numShort: randomShortTwoOrThreeDigit(),
  };

  const candidate = pickOne(USERNAME_TEMPLATES)(ctx);
  if (isValidGeneratedUsername(candidate)) return candidate;
  return `${first}${last[0]}${ctx.num2}`;
}
