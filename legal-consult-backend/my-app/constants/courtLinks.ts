export type Bench = { name: string; url: string | null };
export type NamedCourt = { name: string; benches?: Bench[]; url?: string | null };

export const COURT_CATALOG = {
  highCourt: {
    title: "High Court",
    courts: [
      {
        name: "Allahabad High Court",
        benches: [
          { name: "Allahabad ", url: "https://www.allahabadhighcourt.in/apps/status_ccms/" },
          { name: "Lucknow Bench",  url: "https://hclko.allahabadhighcourt.in/status/" },
        ],
      },
      // add more high courts later (e.g., Patna High Court) with benches
    ] as NamedCourt[],
  },

  lowerCourt: {
    title: "Lower Court",
    courts: [
      { name: "Allahabad", url: null },
      { name: "Lucknow", url: null },
      { name: "Lakhimpur Kheri", url: null },
    ] as NamedCourt[],
  },
} as const;
