import { MetaTransaction, SignRequestData } from "near-safe";
import { ParsedQuoteRequest } from "./parse";
import { sellTokenApprovalTx } from "../../util";
import { signRequestFor } from "@bitteprotocol/agent-sdk";
import { getAddress } from "viem";

const authKey = process.env.ONEINCH_AUTH_KEY;
if (!authKey) {
  throw new Error("ONEINCH_AUTH_KEY is not set");
}
const headers = {
  Authorization: `Bearer ${authKey}`,
  accept: "application/json",
};

const AGGREGATION_ROUTER_V6 = "0x111111125421ca6dc452d289314280a0f8842a65";
export async function orderRequestFlow({
  chainId,
  quoteRequest,
}: ParsedQuoteRequest): Promise<{
  transaction: SignRequestData;
  meta: { orderData: string };
}> {
  const swapParams = {
    src: quoteRequest.fromTokenAddress,
    dst: quoteRequest.toTokenAddress,
    amount: quoteRequest.amount,
    from: quoteRequest.walletAddress,
    slippage: "1", // Maximum acceptable slippage percentage for the swap (e.g., 1 for 1%)
    disableEstimate: "false", // Set to true to disable estimation of swap details
    allowPartialFill: "false", // Set to true to allow partial filling of the swap order
  };
  const metaTransactions: MetaTransaction[] = [];
  const approvalTx = await sellTokenApprovalTx({
    ...quoteRequest,
    chainId,
    from: quoteRequest.walletAddress,
    spender: AGGREGATION_ROUTER_V6,
    sellAmount: quoteRequest.amount,
  });
  if (approvalTx) {
    console.log("prepending approval");
    // TODO: Update approval address.
    metaTransactions.push(approvalTx);
  }
  const swapTransaction = await buildTxForSwap(chainId, swapParams);
  console.log("Transaction for swap: ", swapTransaction);
  metaTransactions.push(swapTransaction);

  return {
    transaction: signRequestFor({
      chainId,
      from: getAddress(quoteRequest.walletAddress),
      metaTransactions,
    }),
    meta: { orderData: "1inch Order Data" },
  };
}

// async function buildTxForApproveTradeWithRouter(
//   args:
//   {chainId: number,
//   tokenAddress: Address,
//   amount: string,
//   walletAddress: Address}
// ): Promise<MetaTransaction> {
//   const {chainId, tokenAddress, amount} = args;
//   const url = apiRequestUrl(chainId, "/approve/transaction", amount ? { tokenAddress, amount } : { tokenAddress });
//   const { data, to, value } = await fetch(url, { headers }).then((res) => res.json());
//   return {to, value, data};
// }

// Construct full API request URL
function apiRequestUrl(
  chainId: number,
  methodName: string,
  queryParams: Record<string, string>,
) {
  const apiBaseUrl = `https://api.1inch.dev/swap/v6.0/${chainId}`;
  return (
    apiBaseUrl + methodName + "?" + new URLSearchParams(queryParams).toString()
  );
}

async function buildTxForSwap(
  chainId: number,
  swapParams: Record<string, string>,
): Promise<MetaTransaction> {
  console.log("Swap Params", swapParams);
  const url = apiRequestUrl(chainId, "/swap", swapParams);

  // Fetch the swap transaction details from the API
  return fetch(url, { headers })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => res.statusText);
        console.error("1inch API error:", {
          status: res.status,
          statusText: res.statusText,
          error: errorData,
        });
        throw new Error(`1inch API error: ${res.status} ${res.statusText}`);
      }
      return res.json();
    })
    .then((res) => res.tx);
}

// // Post raw transaction to the API and return transaction hash
// async function broadCastRawTransaction(chainId: number, rawTransaction: object) {
//   const broadcastApiUrl = `https://api.1inch.dev/tx-gateway/v1.1/${chainId}/broadcast`;
//   return fetch(broadcastApiUrl, {
//     method: "post",
//     body: JSON.stringify({ rawTransaction }),
//     headers
//   })
//     .then((res) => res.json())
//     .then((res) => {
//       return res.transactionHash;
//     });
// }
