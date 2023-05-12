import { PublicClient, createPublicClient, http } from "viem";
import { polygon } from "viem/chains";

export const BLOCKS_PER_QUERY = BigInt(100_000);

const ALCHEMY_URL = process.env.RPC_URL ?? "";
const transport = http(ALCHEMY_URL);

export const bigIntMax = (...args: bigint[]) =>
  args.reduce((m, e) => (e > m ? e : m));
export const bigIntMin = (...args: bigint[]) =>
  args.reduce((m, e) => (e < m ? e : m));

const client: PublicClient = createPublicClient({
  chain: polygon,
  transport,
});

export { client };
