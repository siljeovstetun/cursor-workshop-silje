export interface Tender {
  id: string;
  title: string;
  status: "open" | "closed" | "pending";
  createdAt: string;
  deadline: string;
}

export interface TenderRun {
  id: string;
  tenderId: string;
  startedAt: string;
  status: "running" | "completed" | "failed";
}

export const tenders: Tender[] = [
  {
    id: "tender-8d6782e104af49ea92387ef4e7a69bde",
    title: "Software Development Services 2024",
    status: "open",
    createdAt: "2024-01-10T08:00:00Z",
    deadline: "2024-03-31T23:59:59Z",
  },
  {
    id: "tender-a1b2c3d4e5f6",
    title: "Cloud Infrastructure Procurement",
    status: "pending",
    createdAt: "2024-02-01T09:00:00Z",
    deadline: "2024-04-15T23:59:59Z",
  },
];

export const tenderRuns: TenderRun[] = [];
