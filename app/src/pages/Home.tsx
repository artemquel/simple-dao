import { Form, Row, Table, TabList, Typography, Widget } from "web3uikit";
import { spacings } from "../theme";
import { useState } from "react";
import { useDao } from "../context";
import { FormDataReturned } from "web3uikit/dist/components/Form/types";
import { trackPromise, usePromiseTracker } from "react-promise-tracker";
import { areas } from "../constants";

export const Home = (): JSX.Element => {
  const [proposals, setProposals] = useState<any[]>([]);

  const { promiseInProgress: isProposalCreating } = usePromiseTracker({
    area: areas.proposalCreating,
  });

  const { createProposal } = useDao();

  const onProposalCreate = async ({ data }: FormDataReturned) => {
    const [{ inputResult: dateArr }, { inputResult: description }] = data;

    trackPromise(
      createProposal(description as string, (dateArr as string[])[0]),
      areas.proposalCreating
    );
  };

  return (
    <TabList defaultActiveKey={1} tabStyle={"bar"}>
      <TabList.Tab tabKey={1} tabName={"DAO"}>
        <Typography
          variant={"h1"}
          style={{ marginTop: spacings["2"], marginBottom: spacings["2"] }}
        >
          Overview
        </Typography>
        <Row alignItems={"center"}>
          <Row.Col span={4}>
            <Widget title={"Proposals created"} info={"56"} />
          </Row.Col>
          <Row.Col span={4}>
            <Widget title={"Members"} info={"25"} />
          </Row.Col>
          <Row.Col span={4}>
            <Widget title={"Active proposals"} info={"6"} />
          </Row.Col>
        </Row>
        <Typography
          variant={"h1"}
          style={{ marginTop: spacings["2"], marginBottom: spacings["2"] }}
        >
          Recent proposals
        </Typography>
        <Table
          columnsConfig={"10% 70% 20%"}
          header={["ID", "Description", "Status"]}
          data={proposals}
          pageSize={5}
        />
        <div style={{ marginTop: spacings["2"], marginBottom: spacings["2"] }}>
          <Form
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
                value: "",
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
      </TabList.Tab>
      <TabList.Tab tabKey={2} tabName={"Forum"}>
        <div>2</div>
      </TabList.Tab>
      <TabList.Tab tabKey={3} tabName={"Docs"}>
        <div>3</div>
      </TabList.Tab>
    </TabList>
  );
};
