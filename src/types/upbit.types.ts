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

export type OrdersChance = {
  bid_fee: string; // NumberString
  ask_fee: string; // NumberString
  market: {
    id: string;
    name: string;
    order_types: Array<string>;
    order_sides: Array<string>;
    bid: {
      currency: string;
      price_unit: string | null;
      min_total: string;
    };
    ask: {
      currency: string;
      price_unit: string | null;
      min_total: string;
    };
    max_total: string; // NumberString
    state: string;
  };
  bid_account: {
    currency: string;
    balance: string; // NumberString
    locked: string; // NumberString
    avg_krw_buy_price: string; // NumberString
    modified: boolean;
  };
  ask_account: {
    currency: string;
    balance: string; // NumberString
    locked: string; // NumberString
    avg_krw_buy_price: string; // NumberString
    modified: boolean;
  };
};
