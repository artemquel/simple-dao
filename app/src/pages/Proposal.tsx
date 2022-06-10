import {
  Blockie,
  Button,
  Card,
  Form,
  Row,
  Table,
  Tag,
  Tooltip,
  Typography,
  Widget,
} from "web3uikit";
import { spacings } from "../theme";
import { format } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { useDao } from "../context";
import { FormDataReturned } from "web3uikit/dist/components/Form/types";
import { trackPromise, usePromiseTracker } from "react-promise-tracker";
import { areas } from "../constants";

export const Proposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { proposals, historyLoading, vote } = useDao();

  const { description, isPassed, inProgress, proposer, deadline, votes } =
    proposals.find((proposal) => id && proposal.id === Number(id)) || {
      votes: [],
    };

  const maxProgress = 10000;

  const { promiseInProgress: isVoting } = usePromiseTracker({
    area: areas.proposalVote,
  });

  const onVote = ({ data }: FormDataReturned) => {
    const [{ inputResult: decision }] = data;
    if (id) {
      trackPromise(
        vote(
          Number(id),
          (typeof decision === "object"
            ? (decision as string[])[0]
            : decision) === "For"
        ),
        areas.proposalVote
      );
    }
  };

  return (
    <>
      <Button
        icon={"chevronLeft"}
        iconLayout={"leading"}
        size={"large"}
        theme="secondary"
        type={"button"}
        text={"Go back"}
        onClick={() => navigate("/")}
      />
      <Typography
        variant={"h1"}
        style={{ marginTop: spacings["1"], marginBottom: spacings["1"] }}
      >
        Overview
      </Typography>
      <div style={{ marginTop: spacings["1"], marginBottom: spacings["1"] }}>
        <Row justifyItems={"space-between"} alignItems={"center"}>
          <Row.Col span={3}>
            {inProgress && !historyLoading ? (
              <Tag text={"In progress"} color={"blueLight"} />
            ) : isPassed ? (
              <Tag text={"Passed"} color={"green"} />
            ) : (
              <Tag text={"Rejected"} color={"red"} />
            )}
          </Row.Col>
          <Row.Col span={2}>
            <Row justifyItems={"space-between"} alignItems={"center"}>
              <Row.Col span={1}>
                <Typography variant={"body16"} style={{ whiteSpace: "nowrap" }}>
                  Created by:{" "}
                </Typography>
              </Row.Col>
              <Row.Col span={1}>
                <Tooltip content={proposer || ""} position={"left"}>
                  <Blockie seed={proposer || ""} />
                </Tooltip>
              </Row.Col>
            </Row>
          </Row.Col>
        </Row>
      </div>
      <div style={{ marginTop: spacings["1"], marginBottom: spacings["1"] }}>
        <Typography variant={"body18"}>{description}</Typography>
      </div>
      <Row justifyItems={"center"} alignItems={"center"}>
        <Row.Col span={3}>
          <Widget
            title={"Progress"}
            isLoading={historyLoading}
            info={`${
              votes.length
                ? Math.round(
                    (Math.max(...votes.map(({ progress }) => progress)) /
                      maxProgress) *
                      100
                  ).toString()
                : 0
            }%`}
          />
        </Row.Col>
        <Row.Col span={3}>
          <Widget
            title={"Votes for"}
            isLoading={historyLoading}
            info={votes.filter(({ votedFor }) => votedFor).length.toString()}
          />
        </Row.Col>
        <Row.Col span={3}>
          <Widget
            title={"Votes against"}
            isLoading={historyLoading}
            info={votes.filter(({ votedFor }) => !votedFor).length.toString()}
          />
        </Row.Col>
        <Row.Col span={6}>
          <Widget
            title={"Deadline"}
            isLoading={historyLoading}
            info={
              deadline ? format(deadline * 1000, "dd.MM.yyyy HH:mm:ss") : ""
            }
          />
        </Row.Col>
      </Row>
      <div style={{ marginTop: spacings["1"], marginBottom: spacings["1"] }}>
        <Row>
          <Row.Col span={18}>
            <Table
              key={votes.length} //TODO: fix it when library updated
              columnsConfig={"90% 10%"}
              header={["Address", "Vote"]}
              data={votes.map(({ voter, votedFor }) => [
                <Typography variant={"body16"}>{voter}</Typography>,
                votedFor ? (
                  <Tag text={"For"} color={"green"} />
                ) : (
                  <Tag text={"Against"} color={"red"} />
                ),
              ])}
              pageSize={5}
            />
          </Row.Col>
          <Row.Col span={6}>
            <Card cursorType={"default"}>
              <Form
                title={"Vote"}
                buttonConfig={{
                  isLoading: isVoting,
                  loadingText: "Loading",
                  text: "Vote",
                  theme: "primary",
                }}
                data={[
                  {
                    inputWidth: "100%",
                    name: "Vote",
                    type: "radios",
                    options: ["For", "Against"],
                    validation: {
                      required: true,
                    },
                    value: "",
                  },
                ]}
                onSubmit={onVote}
                id={"propsal-vote"}
              />
            </Card>
          </Row.Col>
        </Row>
      </div>
    </>
  );
};
