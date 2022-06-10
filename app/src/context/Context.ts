import {
  Dao,
  NewVoteEvent,
  ProposalClosedEvent,
  ProposalCreatedEvent,
} from "../typechain/Dao";
import { createContext } from "react";
import { Signer } from "ethers";

export interface ContextEvents {
  ProposalCreated: ProposalCreatedEvent[];
  NewVote: NewVoteEvent[];
  ProposalClosed: ProposalClosedEvent[];
}

export interface DaoContext {
  events?: ContextEvents;
  contract?: Dao;
  signer?: Signer;
  historyLoading?: boolean;
}

export const Context = createContext<DaoContext>({});
