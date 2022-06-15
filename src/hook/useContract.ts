import { coins } from "@cosmjs/proto-signing";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import {
  useAppDispatch,
  // useAppSelector
} from "../app/hooks";
import {
  importContract,
  // contractAccounts,
  // deleteAccount,
} from "../features/accounts/accountsSlice";
import connectionManager from "../features/connection/connectionManager";
import { toMicroAmount } from "../util/coins";

export const contractAddresses: any = {
  MINT_CONTRACT:
    "secret1ujh92nwuw2u6symf23j4nm0wjsj5sd20dqmrst",
  TOKEN_CONTRACT:
    "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek",
  NFT_CONTRACT:
    "secret1z0hdnd7k0u2l4edkeep9q8qrurfrsqlsgu4duz"
};

const useContract = () => {
  const dispatch = useAppDispatch();
  // const contracts = useAppSelector(contractAccounts);

  const state = useSelector((state: any) => state);

  const initContracts = useCallback(() => {
    // remove existing contracts
    // if (contracts.length) {
    //   for (let i = 0; i < contracts.length; i++) {
    //     const contract = contracts[i];
    //     dispatch(deleteAccount(contract.address));
    //   }
    // }

    // import target contracts
    console.log("contractAddress: ",contractAddresses);
    Object.keys(contractAddresses).map((key: string) => {
      dispatch(importContract(contractAddresses[key]));
      return null;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runQuery = useCallback(
    // async (contractAddress: string, queryMsg: any) => {
    async (contract: any, queryMsg: any) => {
      // const contract = state.accounts.accountList[contractAddress];
      if (!contract) {
        // dispatch(importContract(contractAddress));
        throw new Error("No contract selected");
      }
      const client = await connectionManager.getQueryClient(
        state.connection.config
      );
      const result = await client.queryContractSmart(
        contract.address,
        queryMsg
      );
      return result;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const runExecute = useCallback(
    async (
      contractAddress: string,
      executeMsg: any,
      option?: {
        memo?: string;
        funds?: string;
      }
    ) => {
      const contract = state.accounts.accountList[contractAddress];
      const account = state.accounts.keplrAccount;
      if (!contract) {
        throw new Error("No contract selected");
      }

      const client = await connectionManager.getSigningClient(
        account,
        state.connection.config
      );

      const executeOptions = state.console.executeOptions;
      const executeMemo = option?.memo ?? executeOptions?.memo;
      const executeFunds = option?.funds ?? executeOptions?.funds;

      return client.execute(
        account.address,
        contract.address,
        executeMsg,
        "auto",
        executeMemo,
        executeFunds
          ? coins(
              toMicroAmount(
                executeFunds,
                state.connection.config["coinDecimals"]
              ),
              state.connection.config["microDenom"]
            )
          : undefined
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    initContracts,
    runQuery,
    runExecute,
  };
};

export default useContract;
