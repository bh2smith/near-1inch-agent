import { orderRequestFlow } from "@/src/app/api/tools/1inch/util/classic";
import { OrderKind } from "@/src/app/api/tools/util";
import { getAddress } from "viem";

const GNOSIS_WXDAI = getAddress("0xe91d153e0b41518a2ce8dd3d7944fa863463a97d");
const GNOSIS_COW = getAddress("0x177127622c4a00f3d409b75571e12cb3c8973d3c");
// Safe Associated with max-normal.near on Bitte Wallet.
const DEPLOYED_SAFE = getAddress("0x54F08c27e75BeA0cdDdb8aA9D69FD61551B19BbA");

const chainId = 100;
const quoteRequest = {
  chainId,
  walletAddress: DEPLOYED_SAFE,
  fromTokenAddress: GNOSIS_COW,
  toTokenAddress: GNOSIS_WXDAI,
  receiver: DEPLOYED_SAFE,
  kind: OrderKind.SELL,
  amount: "100000000000000000",
};

describe("1inch Plugin", () => {
  // Swaps 0.1 COW to WXDAI on Gnosis Chain using 1inch.dev API
  it.skip("orderRequestFlow", async () => {
    console.log("Requesting Quote...");
    const signRequest = await orderRequestFlow({
      chainId,
      quoteRequest: { ...quoteRequest },
    });
    console.log(JSON.stringify(signRequest, null, 2));
    console.log(
      `https://wallet.bitte.ai/sign-evm?evmTx=${encodeURI(JSON.stringify(signRequest.transaction))}`,
    );
  });
});
