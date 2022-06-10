import { useCallback, useContext, useEffect, useState } from "react";
import { Context } from "./Context";
import { getUnixTime } from "date-fns";
import { useNotification } from "web3uikit";
import { Proposal, RevertError, Vote } from "./types";

const useDao = () => {
  const { contract, signer, events, historyLoading } = useContext(Context);
  const notify = useNotification();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeProposalsCount, setActiveProposalsCount] = useState<number>(0);
  const [proposalsCount, setProposalsCount] = useState<number>(0);

  useEffect(() => {
    if (events?.ProposalCreated && events.ProposalClosed && events.NewVote) {
      setProposals(
        events.ProposalCreated.map<Proposal>((eventCreate) => ({
          description: eventCreate.args.description,
          id: eventCreate.args.id.toNumber(),
          proposer: eventCreate.args.proposer,
          inProgress: !events.ProposalClosed.find((eventClose) =>
            eventClose.args.id.eq(eventCreate.args.id)
          ),
          isPassed: !!events.ProposalClosed.find((eventClose) =>
            eventClose.args.id.eq(eventCreate.args.id)
          )?.args.passed,
          deadline: eventCreate.args.deadline.toNumber(),
          votes: events.NewVote.filter((voteEvent) =>
            voteEvent.args.proposal.eq(eventCreate.args.id)
          ).map<Vote>((voteEvent) => ({
            votesFor: voteEvent.args.votesFor.toNumber(),
            votesAgainst: voteEvent.args.votesAgainst.toNumber(),
            voter: voteEvent.args.voter,
            votedFor: voteEvent.args.votedFor,
            progress: voteEvent.args.progress.toNumber(),
          })),
        }))
      );
    }
  }, [events]);

  useEffect(() => {
    setActiveProposalsCount(
      proposals.filter((proposal) => proposal.inProgress).length
    );
    setProposalsCount(proposals.length);
  }, [proposals]);

  const createProposal = useCallback(
    async (description: string, deadline: string) => {
      if (contract && signer) {
        const unixDeadline = getUnixTime(new Date(deadline));
        try {
          await contract
            .connect(signer)
            .createProposal(description, unixDeadline);
        } catch (e) {
          if (
            (e as RevertError).data.message.includes(
              "Only DAO's member can do this"
            )
          ) {
            notify({
              type: "error",
              title: "Error",
              message: "Only DAO's member can do this",
              position: "bottomL",
            });
          } else {
            notify({
              type: "error",
              title: "Error",
              message: "Error during create proposal",
              position: "bottomL",
            });
          }
        }
      } else {
        notify({
          type: "error",
          title: "Error",
          message: "Blockchain connection error",
          position: "bottomL",
        });
      }
    },
    [contract, signer, notify]
  );

  const vote = useCallback(
    async (proposal: number, decision: boolean) => {
      if (contract && signer) {
        try {
          await contract.connect(signer).vote(proposal, decision);
        } catch (e) {
          if (
            (e as RevertError).data.message.includes(
              "Only DAO's member can do this"
            )
          ) {
            notify({
              type: "error",
              title: "Error",
              message: "Only DAO's member can do this",
              position: "bottomL",
            });
          } else if (
            (e as RevertError).data.message.includes(
              "The deadline has passed for this proposal"
            )
          ) {
            notify({
              type: "error",
              title: "Error",
              message: "The deadline has passed for this proposal",
              position: "bottomL",
            });
          } else {
            notify({
              type: "error",
              title: "Error",
              message: "Voting error",
              position: "bottomL",
            });
          }
        }
      } else {
        notify({
          type: "error",
          title: "Error",
          message: "Blockchain connection error",
          position: "bottomL",
        });
      }
    },
    [contract, signer, notify]
  );

  const closeProposal = useCallback(
    async (id: number) => {
      if (contract && signer) {
        try {
          await contract.connect(signer).countVotes(id);
        } catch (e) {
          notify({
            type: "error",
            title: "Error",
            message: "Proposal close error",
            position: "bottomL",
          });
        }
      } else {
        notify({
          type: "error",
          title: "Error",
          message: "Blockchain connection error",
          position: "bottomL",
        });
      }
    },
    [contract, signer, notify]
  );

  return {
    createProposal,
    proposals,
    activeProposalsCount,
    proposalsCount,
    historyLoading,
    vote,
    closeProposal,
  };
};

export default useDao;
