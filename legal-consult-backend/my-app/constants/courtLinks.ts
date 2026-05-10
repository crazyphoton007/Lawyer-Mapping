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
          {
            name: "Judgment & Orders",
            url: "https://elegalix.allahabadhighcourt.in/elegalix/StartWebSearch.do",
          },
        ],
      },
      // add more high courts later (e.g., Patna High Court) with benches
    ] as NamedCourt[],
  },

  lowerCourt: {
    title: "eCourts Services",
    courts: [
      {
        name: "CNR Number",
        url: "https://services.ecourts.gov.in/ecourtindia_v6/?p=home/index&app_token=",
      },
      {
        name: "Case Status",
        url: "https://services.ecourts.gov.in/ecourtindia_v6/?p=casestatus/index&app_token=",
      },
      {
        name: "Court Orders",
        url: "https://services.ecourts.gov.in/ecourtindia_v6/?p=courtorder/index&app_token=",
      },
      {
        name: "Cause List",
        url: "https://services.ecourts.gov.in/ecourtindia_v6/?p=cause_list/index&app_token=",
      },
      {
        name: "Caveat Search",
        url: "https://services.ecourts.gov.in/ecourtindia_v6/?p=caveat_search/index&app_token=",
      },
    ] as NamedCourt[],
  },
} as const;
