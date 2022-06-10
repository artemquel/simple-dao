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

export const Proposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    description,
    passed,
    createdBy,
    progress,
    maxProgress,
    votesFor,
    votesAgainst,
    deadline,
    votes,
  } = {
    description:
      "There is sample description of proposal. You can vote for or against, but anyway i don't give a fuck.",
    passed: true,
    createdBy: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    progress: 4354,
    maxProgress: 10000,
    votesFor: 15,
    votesAgainst: 25,
    deadline: Math.round(Date.now() / 1000),
    votes: [],
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
          <Row.Col span={1}>
            {passed ? (
              <Tag color={"green"} text={"Passed"} />
            ) : (
              <Tag color={"red"} text={"Rejected"} />
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
                <Tooltip content={createdBy} position={"left"}>
                  <Blockie seed={createdBy} />
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
            info={`${Math.round((progress / maxProgress) * 100).toString()}%`}
          />
        </Row.Col>
        <Row.Col span={3}>
          <Widget title={"Votes for"} info={votesFor.toString()} />
        </Row.Col>
        <Row.Col span={3}>
          <Widget title={"Votes against"} info={votesAgainst.toString()} />
        </Row.Col>
        <Row.Col span={6}>
          <Widget
            title={"Deadline"}
            info={format(deadline * 1000, "dd.MM.yyyy HH:mm:ss")}
          />
        </Row.Col>
      </Row>
      <div style={{ marginTop: spacings["1"], marginBottom: spacings["1"] }}>
        <Row>
          <Row.Col span={18}>
            <Table
              columnsConfig={"90% 10%"}
              header={["Address", "Vote"]}
              data={votes}
              pageSize={5}
            />
          </Row.Col>
          <Row.Col span={6}>
            <Card cursorType={"default"}>
              <Form
                title={"Vote"}
                buttonConfig={{
                  isLoading: false,
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
                onSubmit={(e) => window.console.log(e)}
                id={"propsal-vote"}
              />
            </Card>
          </Row.Col>
        </Row>
      </div>
    </>
  );
};
