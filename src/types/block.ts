import type { TransactionMessage } from "./transaction";
import type { IValidatorAddress } from "./validator";

export interface Block {
  datetime: string;
  height: number;
  proposer: IValidatorAddress;
  transactionCount: number;
}

export interface BlockDetail {
  height: number;
  proposer: IValidatorAddress;
  datetime: string;
  hash: string;
  gasUsed: number;
  gasWanted: number;
  transactions: BlockTransaction[];
}

export interface BlockTransaction {
  hash: string;
  isSuccess: boolean;
  error: string;
  fee: number;
  datetime: string;
  messages: TransactionMessage[];
}
