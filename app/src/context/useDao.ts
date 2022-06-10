import { useCallback, useContext, useEffect, useState } from "react";
import { Context } from "./Context";
import { getUnixTime } from "date-fns";
import { useNotification } from "web3uikit";
import { Proposal } from "./types";

const useDao = () => {
  const { contract, signer, events, historyLoading } = useContext(Context);
  const notify = useNotification();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeProposalsCount, setActiveProposalsCount] = useState<number>(0);
  const [proposalsCount, setProposalsCount] = useState<number>(0);

  useEffect(() => {
    if (events?.ProposalCreated && events.ProposalClosed) {
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
          notify({
            type: "error",
            title: "Error",
            message: "Error during create proposal",
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
  };
};

export default useDao;
