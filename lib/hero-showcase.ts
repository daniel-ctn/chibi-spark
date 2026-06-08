export interface HeroShowcaseItem {
  src: string;
  title: string;
  tag: string;
  className: string;
}

export const HERO_SHOWCASE_ITEMS: HeroShowcaseItem[] = [
  {
    src: "/hero/hero-shiba-bento.png",
    title: "Bento pup",
    tag: "Morning mood",
    className: "left-[2%] top-[4%] z-10 w-[46%] -rotate-6",
  },
  {
    src: "/hero/hero-cat-barista.png",
    title: "Café cat",
    tag: "Cozy drop",
    className: "right-[0%] top-[8%] z-20 w-[48%] rotate-5",
  },
  {
    src: "/hero/hero-bunny-tulips.png",
    title: "Garden bun",
    tag: "Spring vibes",
    className: "bottom-[6%] left-[4%] z-[15] w-[44%] rotate-4",
  },
  {
    src: "/hero/hero-fox-cloud.png",
    title: "Cloud fox",
    tag: "Dreamy read",
    className: "right-[6%] bottom-[2%] z-30 w-[50%] -rotate-3",
  },
];
