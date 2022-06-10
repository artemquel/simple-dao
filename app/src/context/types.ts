export type Proposal = {
  id: number;
  description: string;
  inProgress: boolean;
  isPassed: boolean;
  proposer: string;
  deadline: number;
  votes: Vote[];
};

export type Vote = {
  votesFor: number;
  votesAgainst: number;
  voter: string;
  votedFor: boolean;
  progress: number;
};
