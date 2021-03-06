import { PropsWithChildren, useEffect, useReducer, useState } from "react";
import { ContextEvents, Context } from "./Context";
import {
  Dao,
  NewVoteEvent,
  ProposalClosedEvent,
  ProposalCreatedEvent,
} from "../typechain/Dao";
import { useMoralis } from "react-moralis";
import { Dao__factory } from "../typechain";
import { Provider } from "@ethersproject/providers";
import { Signer } from "ethers";

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
        if (
          !events[action.event.type]
            .map(({ transactionHash }) => transactionHash)
            .includes(action.event.payload.transactionHash)
        ) {
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
  const [signer, setSigner] = useState<Signer | undefined>();
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  const { web3, isWeb3Enabled } = useMoralis();
  useEffect(() => {
    if (isWeb3Enabled) {
      setContract(Dao__factory.connect(props.address, web3 as Provider));
      setSigner(web3?.getSigner());
    } else {
      setContract(undefined);
      dispatch({ type: "CLEAR" });
    }
  }, [isWeb3Enabled, web3, props.address]);

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

        (web3 as Provider).once("block", () => {
          contract.on(contract.filters.ProposalCreated(), (...args) => {
            const [, , , , payload] = args;
            dispatch({
              type: "PUSH",
              event: {
                type: "ProposalCreated",
                payload,
              },
            });
          });
          contract.on(contract.filters.NewVote(), (...args) => {
            const [, , , , , , payload] = args;
            dispatch({
              type: "PUSH",
              event: {
                type: "NewVote",
                payload,
              },
            });
          });
          contract.on(contract.filters.ProposalClosed(), (...args) => {
            const [, , , payload] = args;
            dispatch({
              type: "PUSH",
              event: {
                type: "ProposalClosed",
                payload,
              },
            });
          });
        });
      })();
    }
  }, [contract]);

  return (
    <Context.Provider value={{ events, contract, signer, historyLoading }}>
      {props.children}
    </Context.Provider>
  );
};

export default DaoProvider;
