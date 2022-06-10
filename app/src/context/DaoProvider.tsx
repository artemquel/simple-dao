import { PropsWithChildren, useEffect, useReducer, useState } from "react";
import { ContextEvents, DaoContext } from "./Context";
import {
  Dao,
  NewVoteEvent,
  ProposalClosedEvent,
  ProposalCreatedEvent,
} from "../typechain/Dao";
import { useMoralis } from "react-moralis";
import { Dao__factory } from "../typechain";
import { Provider } from "@ethersproject/providers";

type Props = {
  address: string;
};

type EventPayload = {
  type: keyof ContextEvents;
  payload: ProposalCreatedEvent | NewVoteEvent | ProposalClosedEvent;
};

type EventsPayload = {
  type: keyof ContextEvents;
  payload: ProposalCreatedEvent[] | NewVoteEvent[] | ProposalClosedEvent[];
};

type Action = {
  type: "PUSH" | "CLEAR" | "SET";
  event?: EventPayload;
  events?: EventsPayload;
};

const eventReducer = (events: ContextEvents, action: Action): ContextEvents => {
  switch (action.type) {
    case "CLEAR":
      return {
        ProposalCreated: [],
        ProposalClosed: [],
        NewVote: [],
      };
    case "SET":
      if (action.events?.type) {
        return {
          ...events,
          [action.events?.type]: action.events.payload,
        };
      } else {
        return events;
      }
    case "PUSH":
      if (action.event?.type) {
        return {
          ...events,
          [action.event?.type]: [
            ...events[action.event?.type],
            action.event?.payload,
          ],
        };
      } else {
        return events;
      }
    default:
      return events;
  }
};

const DaoProvider = (props: PropsWithChildren<Props>): JSX.Element => {
  const [events, dispatch] = useReducer(eventReducer, {
    ProposalClosed: [],
    ProposalCreated: [],
    NewVote: [],
  });

  const [contract, setContract] = useState<Dao | undefined>();
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const { web3, isWeb3Enabled } = useMoralis();

  useEffect(() => {
    if (isWeb3Enabled) {
      setContract(Dao__factory.connect(props.address, web3 as Provider));
    } else {
      setContract(undefined);
      dispatch({ type: "CLEAR" });
    }
  }, [isWeb3Enabled, web3]);

  useEffect(() => {
    if (contract) {
      (async () => {
        setHistoryLoading(true);

        await Promise.all([
          contract
            .queryFilter(contract.filters.ProposalClosed(), 0)
            .then((payload) =>
              dispatch({
                type: "SET",
                events: { type: "ProposalClosed", payload },
              })
            ),
          contract
            .queryFilter(contract.filters.ProposalCreated(), 0)
            .then((payload) =>
              dispatch({
                type: "SET",
                events: { type: "ProposalCreated", payload },
              })
            ),
          contract.queryFilter(contract.filters.NewVote(), 0).then((payload) =>
            dispatch({
              type: "SET",
              events: { type: "NewVote", payload },
            })
          ),
        ]);

        setHistoryLoading(false);
      })();
    }
  }, [contract]);

  return (
    <DaoContext.Provider value={{ events, contract, historyLoading }}>
      {props.children}
    </DaoContext.Provider>
  );
};

export default DaoProvider;
