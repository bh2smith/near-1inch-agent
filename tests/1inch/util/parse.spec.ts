import { parseQuoteRequest } from "@/src/app/api/tools/1inch/util/parse";
import { OrderKind } from "@/src/app/api/tools/util";
import { NextRequest } from "next/server";
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
  it("parseQuoteRequest", async () => {
    const request = new NextRequest("https://fake-url.xyz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mb-metadata": JSON.stringify({
          accountId: "neareth-dev.testnet",
        }),
      },
      body: JSON.stringify(quoteRequest),
    });

    expect(await parseQuoteRequest(request)).toStrictEqual({
      chainId: 11155111,
      quoteRequest: {
        fromTokenAddress: "0xB4F1737Af37711e9A5890D9510c9bB60e170CB0D",
        toTokenAddress: "0x0625aFB445C3B6B7B929342a04A22599fd5dBB59",
        amount: "2000000000000000000000000000000000000",
        walletAddress: "0x5E1E315D96BD81c8f65c576CFD6E793aa091b480",
      },
    });
  });
});
