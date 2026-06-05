/**
 * Curated chibi themes — safe, cute, visual prompts used as defaults
 * when the daily pipeline needs inspiration. The text model picks a
 * mix of these and approved user proposals.
 *
 * Each theme is a short, evocative description that the prompt expander
 * can turn into a clean image-generation prompt.
 */

export const CURATED_THEMES: readonly string[] = [
  "wizard cat with a glowing staff and oversized starry hat",
  "cyberpunk ramen girl with neon noodle steam and chrome chopsticks",
  "sleepy dragon office worker napping at a tiny desk covered in paperwork",
  "kawaii astronaut bunny floating in pastel space with a carrot rocket",
  "tiny forest mushroom fairy with glowing spore wings and a leaf dress",
  "cozy tea-loving hedgehog in a hand-knitted scarf holding a teacup",
  "chibi sushi chef cat with a salmon apron and a big proud smile",
  "steampunk fox inventor with brass goggles and a tiny wrench",
  "pirate penguin captain with a tiny ship steering wheel",
  "ninja rabbit with a carrot katana and a moon-print bandana",
  "fairy librarian riding a stack of floating storybooks",
  "ghost baker making translucent mochi in a haunted kitchen",
  "samurai panda in bamboo armor with a bamboo sword",
  "robot florist tending a garden of tiny neon flowers",
  "musician octopus playing eight tiny instruments at once",
  "tiny detective mouse with a magnifying glass and deerstalker",
  "witch's apprentice brewing a pot of starlight tea",
  "yoga frog meditating peacefully on a giant lily pad",
  "ghostly pianist in a moonlit music room with floating notes",
  "dinosaur barista making latte art of tiny volcanoes",
  "tiny dragon snuggled inside a floral teacup",
  "cloud shepherd tending a flock of pastel sheep in the sky",
  "wizard bunny with a glowing crystal ball and a wand",
  "ninja tofu warrior in a tiny dojo of sushi rolls",
  "alien sushi chef on a tiny spaceship kitchen",
  "singing cactus in a tiny desert band concert",
  "cute mechanic robot fixing a tiny vintage car",
  "tea-loving turtle holding a tiny teacup and a saucer",
  "dancing mushroom with a flower crown in a forest glade",
  "knight kitten in shining armor with a yarn-ball shield",
  "baker raccoon in a tiny bakery with croissants",
  "wizard hamster with a glowing moon wand and a star cape",
  "pirate mermaid reading a treasure map in a sunken library",
  "tiny farmer gnome with a vegetable patch of giant carrots",
  "kawaii taxi driver cat in a tiny pastel cab",
  "mystical owl librarian in a tree-trunk library",
  "tattoo artist chameleon painting a tiny mural",
  "cloud surfer riding waves of pastel cumulus",
  "tiny baker dragon making mini cupcakes in a pastry shop",
  "magical barista making star-shaped latte art",
];

export function isValidCuratedTheme(theme: string): boolean {
  return CURATED_THEMES.includes(theme);
}

export function getRandomCuratedThemes(count: number): string[] {
  const shuffled = [...CURATED_THEMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
