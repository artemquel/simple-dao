import {
  Dao,
  NewVoteEvent,
  ProposalClosedEvent,
  ProposalCreatedEvent,
} from "../typechain/Dao";
import { createContext } from "react";

export interface ContextEvents {
  ProposalCreated: ProposalCreatedEvent[];
  NewVote: NewVoteEvent[];
  ProposalClosed: ProposalClosedEvent[];
}

export interface DaoContext {
  events?: ContextEvents;
  contract?: Dao;
  historyLoading?: boolean;
}

export const DaoContext = createContext<DaoContext>({});
