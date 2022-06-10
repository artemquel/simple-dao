export type Proposal = {
  id: number;
  description: string;
  inProgress: boolean;
  isPassed: boolean;
  proposer: string;
  deadline: number;
};

export type Vote = {
  votesFor: number;
  votesAgainst: number;
  voter: string;
  proposal: number;
  votedFor: boolean;
  progress: number;
};
