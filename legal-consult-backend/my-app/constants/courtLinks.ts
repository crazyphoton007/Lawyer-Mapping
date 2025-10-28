export type CourtLink = {
  id: string;
  title: string;
  desc?: string;
  url: string;
  tags?: string[]; // future: state, bench, court type
};

// Start with only Lucknow Bench
export const COURT_LINKS: CourtLink[] = [
  {
    id: "allahabad_hc_lucknow",
    title: "Lucknow Bench",
    desc: "",
    url: "https://hclko.allahabadhighcourt.in/status/",
    tags: ["Allahabad HC", "Lucknow Bench"],
  },
];

// Example entries you can add later:
// {
//   id: "allahabad_hc_prayagraj",
//   title: "Prayagraj — Case Status",
//   desc: "Allahabad High Court (Main Bench)",
//   url: "https://allahabadhighcourt.in/<status-url>",
//   tags: ["Allahabad HC", "Prayagraj Bench"],
// },
