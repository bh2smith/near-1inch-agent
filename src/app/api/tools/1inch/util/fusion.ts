import { MetaTransaction, SignRequestData } from "near-safe";
import {
  FusionOrder,
  FusionSDK,
  OrderInfo,
  PreparedOrder,
  RelayerRequest,
} from "@1inch/fusion-sdk";
import { ParsedQuoteRequest } from "./parse";
import { getAddress, zeroAddress } from "viem";
import { sellTokenApprovalTx } from "../../util";

const authKey = process.env.ONEINCH_AUTH_KEY;
if (!authKey) {
  throw new Error("ONEINCH_AUTH_KEY is not set");
}

function getFusionSdk(chainId: number) {
  return new FusionSDK({
    url: "https://api.1inch.dev/fusion",
    network: chainId,
    authKey,
  });
}

// TODO: Implement Fusion Orders
export async function fusionRequestFlow({
  chainId,
  quoteRequest,
}: ParsedQuoteRequest): Promise<{
  transaction: SignRequestData;
  meta: { orderData: PreparedOrder };
}> {
  const fusionSdk = getFusionSdk(chainId);
  console.log(`Requesting quote for ${JSON.stringify(quoteRequest, null, 2)}`);
  const metaTransactions: MetaTransaction[] = [];
  const quoteResponse = await fusionSdk.getQuote(quoteRequest);
  console.log("unusedQuoteResponse", quoteResponse);

  const approvalTx = await sellTokenApprovalTx({
    ...quoteRequest,
    chainId,
    from: quoteRequest.walletAddress,
    spender: getAddress(quoteResponse.settlementAddress.toString()),
    sellAmount: quoteRequest.amount,
  });
  if (approvalTx) {
    console.log("prepending approval");
    // TODO: Update approval address.
    metaTransactions.push(approvalTx);
  }

  // TODO: Get Create Order to work....
  const { order, quoteId } = await fusionSdk.createOrder(quoteRequest);
  console.log("Order with quoteId", quoteId, order);
  const typedData = await getOrderTypedData(chainId, order);
  console.log("TypedData", typedData);

  return {
    transaction: {
      method: "eth_signTypedData",
      chainId,
      params: [
        getAddress(quoteRequest.walletAddress || zeroAddress),
        JSON.stringify(typedData),
      ],
    },
    meta: {
      // TODO: The order hash might be the thing to sign.
      orderData: { order, quoteId, hash: order.getOrderHash(chainId) },
    },
  };
}

// We have to split up these functions from the fusionSDK because we need to aquire signature differently.
async function getOrderTypedData(chainId: number, order: FusionOrder) {
  return order.getTypedData(chainId);
}

export async function submitSignedOrder(
  chainId: number,
  order: FusionOrder,
  signature: string,
  quoteId: string,
): Promise<OrderInfo> {
  const fusionSdk = getFusionSdk(chainId);
  const orderStruct = order.build();

  const relayerRequest = RelayerRequest.new({
    order: orderStruct,
    signature,
    quoteId,
    extension: order.extension.encode(),
  });

  await fusionSdk.api.submitOrder(relayerRequest);

  return {
    order: orderStruct,
    signature,
    quoteId,
    orderHash: order.getOrderHash(chainId),
    extension: relayerRequest.extension,
  };
}
