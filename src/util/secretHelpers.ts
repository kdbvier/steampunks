import { SecretNetworkClient } from 'secretjs';
// import { Any } from 'secretjs/dist/protobuf_stuff/google/protobuf/any';
const Storage = window.sessionStorage;
export const ChainId: string = "secret-4";
//@ts-ignore
export const Keplr:any = window.keplr;
export let Querier: SecretNetworkClient;

type contractAddressRequest = {
    contractAddress: string;
}

type queryRequest = {
    contractAddress: string;
    ownerAddress: string;
}

type queryDossierRequest = {
    contractAddress: string;
    ownerAddress: string;
    tokenId: string;
}

type ContractInfoResponse = {
    contract_info: {
        name: string;
        symbol: string;
    };
}

export interface DossierResponse {
    nft_dossier: {
        public_metadata: {
            extension: Extension | null;
            token_uri: string | null
        };
        private_metadata: {
            extension: Extension | null;
            token_uri: string | null
        }
    };
}

interface Media {
    authentication: {
        key: string | null;
        user: string | null;
    }
    file_type: string;
    extension: string;
    url: string;
}

type OwnedTokensResponse = {
    token_list: {
        tokens: Array<string>
    };
}

interface Trait {
    display_type: string | null;
    max_value: string| null;
    trait_type: string;
    value: string;
}

export interface Extension {
    attributes: Trait[];
    image: string | null;
    media: Media[] | null;
}


const contractInfoQuery = {
    contract_info: {}
}



export const queryNftDossier = async({contractAddress, ownerAddress, tokenId}: queryDossierRequest): Promise<DossierResponse> => {
    const query = {
        nft_dossier: {
          token_id: tokenId,
        }
    };


    return await Querier.query.compute.queryContract({
        contractAddress: contractAddress,
        query: {
            with_permit: {
                query: query,
                permit: {
                    params: {
                        permit_name: 'Trivium-NFT-Viewer',
                        allowed_tokens: [contractAddress],
                        chain_id: ChainId,
                        permissions: ['owner'],
                    },
                    signature: await getPermit({contractAddress: contractAddress}),
                }
            }
        }
    });
}


// export const queryStateInfo = async({contractAddress}: queryDossierRequest): Promise<DossierResponse> => {
//     const query = {
//         get_state_info: {
//         }
//     };


//     return await Querier.query.compute.queryContract({
//         contractAddress: contractAddress,
//         query: {
//             with_permit: {
//                 query: query,
//                 permit: {
//                     params: {
//                         permit_name: 'Trivium-NFT-Viewer',
//                         allowed_tokens: [contractAddress],
//                         chain_id: ChainId,
//                         permissions: ['owner'],
//                     },
//                     signature: await getPermit({contractAddress: contractAddress}),
//                 }
//             }
//         }
//     });
// }



export const queryContractInfo = async({contractAddress}: contractAddressRequest): Promise<ContractInfoResponse> => {
    if (!Querier) await setupQuerier();

    return await Querier.query.compute.queryContract({
        contractAddress: contractAddress,
        query: contractInfoQuery,
    });
}

export const queryOwnedTokens = async({contractAddress, ownerAddress}: queryRequest): Promise<OwnedTokensResponse> => {
    if (!Querier) await setupQuerier();

    const ownedTokensQuery = {
        tokens: {
          owner: ownerAddress,
        }
    };

    return await Querier.query.compute.queryContract({
        contractAddress: contractAddress,
        query: {
            with_permit: {
                query: ownedTokensQuery,
                permit: {
                    params: {
                        permit_name: 'Trivium-NFT-Viewer',
                        allowed_tokens: [contractAddress],
                        chain_id: ChainId,
                        permissions: ['owner'],
                    },
                    signature: await getPermit({contractAddress: contractAddress}),
                }
            }
        }
    });
}

const setupQuerier = async() => {
    Querier = await SecretNetworkClient.create({
        grpcWebUrl: process.env.REACT_APP_GRPC_URL as string,
        chainId: ChainId,
    });
}

export const getPermit = async({contractAddress}: contractAddressRequest) => {
    const storageKey = `trivium-nft-viewer-v1-permit-${contractAddress}`

    // Check cache for permit
    const permit = Storage.getItem(storageKey)
    if (permit) return JSON.parse(permit);

    Keplr.enable(ChainId);
    const keplrOfflineSigner = Keplr.getOfflineSignerOnlyAmino(ChainId);
    const [{ address: myAddress }] = await keplrOfflineSigner.getAccounts();

    const { signature } = await Keplr.signAmino(
        ChainId,
        myAddress,
        {
          chain_id: ChainId,
          account_number: "0", // Must be 0
          sequence: "0", // Must be 0
          fee: {
            amount: [{ denom: "uscrt", amount: "0" }], // Must be 0 uscrt
            gas: "1", // Must be 1
          },
          msgs: [
            {
              type: "query_permit", // Must be "query_permit"
              value: {
                permit_name: 'Trivium-NFT-Viewer',
                allowed_tokens: [contractAddress],
                permissions: ['owner'],
              },
            },
          ],
          memo: "", // Must be empty
        },
        {
          preferNoSetFee: true, // Fee must be 0, so hide it from the user
          preferNoSetMemo: true, // Memo must be empty, so hide it from the user
        }
    );
    
    // Cache Permit
    Storage.setItem(storageKey, JSON.stringify(signature));

    return signature;
}
export const queryStateInfo = async({contractAddress }: any) => {
    const query = {
        get_state_info: {
        }
    };


    return await Querier.query.compute.queryContract({
        contractAddress: contractAddress,
        query: {
            query: query,
        }
    });

}