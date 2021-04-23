export enum OrderSide {
  BID = "bid",
  ASK = "ask",
}

export enum OrderType {
  LIMIT = "limit",
  PRICE = "price",
  MARKET = "market",
}

export enum OrderStatus {
  WAIT = "wait",
  DONE = "done",
  CANCEL = "cancel",
}

export type Order = {
  uuid: string;
  side: OrderSide;
  ord_type: OrderType;
  price: string; // Number-like
  avg_price: string; // Number-like
  state: OrderStatus;
  market: string;
  created_at: string;
  volume: string; // Number-like
  remaining_volume: string; // Number-like
  reserved_fee: string; // Number-like
  remaining_fee: string; // Number-like
  paid_fee: string; // Number-like
  locked: string; // Number-like
  executed_volume: string; // Number-like
  trades_count: number;
};

export type CreateOrderParams = {
  market: string;
  side: OrderSide;
  volume?: string;
  price?: string;
  orderType: OrderType;
};
