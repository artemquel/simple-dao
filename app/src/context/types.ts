export type Proposal = {
  id: number;
  description: string;
  inProgress: boolean;
  isPassed: boolean;
  proposer: string;
  deadline: number;
};
