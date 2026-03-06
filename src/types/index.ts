export interface Participant {
  name: string;
  amountPaid: number;
}

export interface SplitResult {
  from: string;
  to: string;
  amount: number;
}