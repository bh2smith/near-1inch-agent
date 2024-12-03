import { orderRequestFlow } from "@/src/app/api/tools/1inch/util/orderFlow";
import { OrderKind } from "@/src/app/api/tools/util";
import { getAddress } from "viem";

const SEPOLIA_DAI = getAddress("0xb4f1737af37711e9a5890d9510c9bb60e170cb0d");
const SEPOLIA_COW = getAddress("0x0625afb445c3b6b7b929342a04a22599fd5dbb59");
// Safe Associated with neareth-dev.testnet on Bitte Wallet.
const DEPLOYED_SAFE = getAddress("0x5E1E315D96BD81c8f65c576CFD6E793aa091b480");

const chainId = 11155111;
const quoteRequest = {
  chainId,
  walletAddress: DEPLOYED_SAFE,
  fromTokenAddress: SEPOLIA_DAI,
  toTokenAddress: SEPOLIA_COW,
  receiver: DEPLOYED_SAFE,
  kind: OrderKind.SELL,
  amount: "2000000000000000000",
};

describe("1inch Plugin", () => {
  // This posts an order to COW Orderbook.
  it.skip("orderRequestFlow", async () => {
    console.log("Requesting Quote...");
    const signRequest = await orderRequestFlow({
      chainId,
      quoteRequest: { ...quoteRequest },
    });
    console.log(signRequest);
    console.log(
      `https://testnet.wallet.bitte.ai/sign-evm?evmTx=${encodeURI(JSON.stringify(signRequest))}`,
    );
  });
});
