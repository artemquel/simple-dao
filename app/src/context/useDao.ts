import { useCallback, useContext } from "react";
import { Context } from "./Context";
import { getUnixTime } from "date-fns";
import { useNotification } from "web3uikit";

const useDao = () => {
  const { contract, signer, events } = useContext(Context);
  const notify = useNotification();

  const createProposal = useCallback(
    async (description: string, deadline: string) => {
      if (contract && signer) {
        const unixDeadline = getUnixTime(new Date(deadline));
        await contract
          .connect(signer)
          .createProposal(description, unixDeadline);
      } else {
        notify({
          type: "error",
          title: "Error",
          message: "Blockchain connection error",
          position: "bottomL",
        });
      }
    },
    [contract, signer]
  );

  return { createProposal };
};

export default useDao;
