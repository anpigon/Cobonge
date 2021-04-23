import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';
import { encode } from 'querystring';
import jwt from 'jsonwebtoken';
import upbitApi from 'upbit-api';
import { CreateOrderParams, Order } from './types/upbit';

const HOST = 'https://api.upbit.com';

export default class Upbit {
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly http: AxiosInstance;

  constructor(accessKey: string = '', secretKey: string = '') {
    this.accessKey = accessKey;
    this.secretKey = secretKey;

    this.http = axios.create({ baseURL: HOST });
    this.http.interceptors.request.use((value: AxiosRequestConfig) => {
      if (Boolean(this.accessKey) && Boolean(this.secretKey)) {
        const token = this.generateToken(value.data || value.params);
        value.headers['Authorization'] = `Bearer ${token}`;
      }
      return value;
    });
    this.http.interceptors.response.use(
      (res: AxiosResponse) => res,
      (error: AxiosError) => Promise.reject(error?.response?.data?.error || error)
    );
  }

  generateToken(data?: any): string {
    const payload: { [key: string]: string } = {
      access_key: this.accessKey,
      nonce: uuidv4(),
    };

    if (Boolean(data)) {
      const queryHash = createHash('sha512').update(encode(data), 'utf-8').digest('hex');
      payload['query_hash'] = queryHash;
      payload['query_hash_alg'] = 'SHA512';
    }

    const jwtToken = jwt.sign(payload, this.secretKey);
    return jwtToken;
  }

  async createOrder(params: CreateOrderParams): Promise<Order> {
    const { market, side, volume, price, orderType } = params;
    const { data } = await this.http.post<Order>("/v1/orders", {
      market,
      side,
      volume,
      price,
      ord_type: orderType,
    });
    return data;
  }

  getMarketCodes = upbitApi.allMarket;
  getTicker = upbitApi.ticker;
  getOrderBook = upbitApi.orderBook;
  getTradesTicks = upbitApi.ticks;
  getCandlesMinutes = upbitApi.candlesMinutes;
  getCandlesDays = upbitApi.candlesDay;
  getCandlesWeeks = upbitApi.candlesWeek;
  getCandlesMonths = upbitApi.candlesMonth;
}
