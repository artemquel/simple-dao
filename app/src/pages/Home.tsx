import { Form, Row, Table, Tag, Typography, Widget } from "web3uikit";
import { spacings } from "../theme";
import { useDao } from "../context";
import { FormDataReturned } from "web3uikit/dist/components/Form/types";
import { trackPromise, usePromiseTracker } from "react-promise-tracker";
import { areas } from "../constants";
import { Link } from "react-router-dom";

export const Home = (): JSX.Element => {
  const { promiseInProgress: isProposalCreating } = usePromiseTracker({
    area: areas.proposalCreating,
  });

  const {
    createProposal,
    proposals,
    activeProposalsCount,
    proposalsCount,
    historyLoading,
  } = useDao();

  const onProposalCreate = async ({ data }: FormDataReturned) => {
    const [{ inputResult: date }, { inputResult: description }] = data;
    trackPromise(
      createProposal(
        description as string,
        typeof date === "object" ? (date as string[])[0] : date
      ),
      areas.proposalCreating
    );
  };

  return (
    <>
      <Typography
        variant={"h1"}
        style={{ marginTop: spacings["2"], marginBottom: spacings["2"] }}
      >
        Overview
      </Typography>
      <Row alignItems={"center"}>
        <Row.Col span={4}>
          <Widget
            title={"Total"}
            isLoading={historyLoading}
            info={proposalsCount.toString()}
          />
        </Row.Col>
        <Row.Col span={4}>
          <Widget title={"Members"} info={"25"} />
        </Row.Col>
        <Row.Col span={4}>
          <Widget
            title={"Active"}
            isLoading={historyLoading}
            info={activeProposalsCount.toString()}
          />
        </Row.Col>
      </Row>
      <Typography
        variant={"h1"}
        style={{ marginTop: spacings["2"], marginBottom: spacings["2"] }}
      >
        Recent proposals
      </Typography>
      <Table
        key={proposals.length} //TODO: fix it when library updated
        isLoading={historyLoading}
        columnsConfig={"10% 70% 20%"}
        header={["ID", "Description", "Status"]}
        data={proposals.map(({ id, description, inProgress, isPassed }) => [
          <Typography variant={"body16"}>{id}</Typography>,
          <Typography variant={"body16"}>{description}</Typography>,
          <Link to={`/proposal/${id}`}>
            {inProgress ? (
              <Tag text={"In progress"} color={"blueLight"} />
            ) : isPassed ? (
              <Tag text={"Passed"} color={"green"} />
            ) : (
              <Tag text={"Rejected"} color={"red"} />
            )}
          </Link>,
        ])}
        pageSize={5}
      />
      <div style={{ marginTop: spacings["2"], marginBottom: spacings["2"] }}>
        <Form
          key={Number(isProposalCreating)} //TODO: fix it when library updated
          title={"New proposal"}
          buttonConfig={{
            isLoading: isProposalCreating,
            loadingText: "Loading",
            text: "Create",
            theme: "primary",
          }}
          data={[
            {
              name: "deadline",
              type: "date",
              validation: {
                required: true,
              },
              value: new Date().toString(),
            },
            {
              inputWidth: "100%",
              name: "description",
              type: "textarea",
              validation: {
                required: true,
              },
              value: "",
            },
          ]}
          id={"proposal-form"}
          onSubmit={onProposalCreate}
        />
      </div>
    </>
  );
};
