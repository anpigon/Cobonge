export enum OrderSide {
  BID = 'bid',
  ASK = 'ask',
}

export enum OrderType {
  LIMIT = 'limit',
  PRICE = 'price',
  MARKET = 'market',
}

export enum OrderStatus {
  WAIT = 'wait',
  DONE = 'done',
  CANCEL = 'cancel',
}

export type Order = {
  uuid: string;
  side: OrderSide;
  ord_type: OrderType;
  price: string; // NumberString
  avg_price: string; // NumberString
  state: OrderStatus;
  market: string;
  created_at: string;
  volume: string; // NumberString
  remaining_volume: string; // NumberString
  reserved_fee: string; // NumberString
  remaining_fee: string; // NumberString
  paid_fee: string; // NumberString
  locked: string; // NumberString
  executed_volume: string; // NumberString
  trades_count: number;
};

export type CreateOrderParams = {
  market: string;
  side: OrderSide;
  volume?: string | number; // NumberString
  price?: string | number; // NumberString
  orderType: OrderType;
};
