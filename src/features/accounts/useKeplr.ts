import { coin } from "@cosmjs/proto-signing";
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AccountType, setKeplrAccount } from "../accounts/accountsSlice";
import { Keplr } from "@keplr-wallet/types";
import { pushMessage } from "../messages/messagesSlice";
// import { fromMicroDenom } from "../../util/coins";

// const CosmosCoinType = 118;

let savedKeplr: Keplr;

export async function getKeplr(): Promise<Keplr> {
  let keplr: Keplr | undefined;
  if (savedKeplr) {
    keplr = savedKeplr;
  } else if (window.keplr) {
    keplr = window.keplr;
  } else if (document.readyState === "complete") {
    keplr = window.keplr;
  } else {
    keplr = await new Promise((resolve) => {
      const documentStateChange = (event: Event) => {
        if (
          event.target &&
          (event.target as Document).readyState === "complete"
        ) {
          resolve(window.keplr);
          document.removeEventListener("readystatechange", documentStateChange);
        }
      };

      document.addEventListener("readystatechange", documentStateChange);
    });
  }

  if (!keplr) throw new Error("Keplr not found");
  if (!savedKeplr) savedKeplr = keplr;

  return keplr;
}

export function useKeplr(): {
  connect: () => Promise<void>;
} {
  const config = useAppSelector((state) => state.connection.config);
  const dispatch = useAppDispatch();

  const getAccount = useCallback(async (): Promise<void> => {
    const keplr = await getKeplr();

    const { name: label, bech32Address: address } = await keplr.getKey(
      config["chainId"]
    );

    dispatch(
      setKeplrAccount({
        label,
        address,
        type: AccountType.Keplr,
        balance: coin(0, config["microDenom"]),
      })
    );
  }, [dispatch, config]);

  useEffect(() => {
    try {
      getKeplr();
    } catch (e) {
      dispatch(
        pushMessage({
          status: "danger",
          header: "Keplr not found",
          message: e instanceof Error ? e.message : JSON.stringify(e),
        })
      );
    }
  }, [dispatch]);

  const suggestChain = useCallback(async (): Promise<void> => {
    const keplr = await getKeplr();

    // const coinMinimalDenom: string = config["microDenom"];
    // const coinDecimals = Number.parseInt(config["coinDecimals"]);
    // const coinGeckoId: string = config["coinGeckoId"];
    // const chainId: string = config["chainId"];
    // const chainName: string = config["chainName"];
    // const rpcEndpoint: string = config["rpcEndpoint"];
    // const restEndpoint: string = config["restEndpoint"];
    // const addrPrefix: string = config["addressPrefix"];
    // const gasPrice = Number.parseFloat(config["gasPrice"]);
    // const coin = fromMicroDenom(coinMinimalDenom);
    // const coinDenom = coin.toUpperCase();
    await keplr.experimentalSuggestChain({
      chainId: "secret-4",
      chainName: "Secret Mainnet",
      rpc: "https://secret-4.api.trivium.network:26657",
      rest: "https://secret-4.api.trivium.network:1317",
      bip44: {
          coinType: 529,
      },
      bech32Config: {
          bech32PrefixAccAddr: "secret",
          bech32PrefixAccPub: "secretpub",
          bech32PrefixValAddr: "secretvaloper",
          bech32PrefixValPub: "secretvaloperpub",
          bech32PrefixConsAddr: "secretvalcons",
          bech32PrefixConsPub: "secretvalconspub",
      },
      currencies: [ 
          { 
              coinDenom: "SCRT", 
              coinMinimalDenom: "uscrt", 
              coinDecimals: 6, 
          }, 
      ],
      feeCurrencies: [
          {
              coinDenom: "SCRT",
              coinMinimalDenom: "uscrt",
              coinDecimals: 6,
          },
      ],
      stakeCurrency: {
          coinDenom: "SCRT",
          coinMinimalDenom: "uscrt",
          coinDecimals: 6,
      },
      coinType: 529,
      gasPriceStep: {
          low: 0.1,
          average: 0.25,
          high: 0.3,
      },
  
    });
  }, []);

  const connect = useCallback(async (): Promise<void> => {
    try {
      await suggestChain();
      await getAccount();
    } catch (e) {
      dispatch(
        pushMessage({
          status: "danger",
          header: "Keplr connection failed",
          message: e instanceof Error ? e.message : JSON.stringify(e),
        })
      );
    }
  }, [getAccount, suggestChain, dispatch]);

  return { connect };
}
