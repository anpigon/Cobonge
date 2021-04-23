require('dotenv').config();
import delay from 'delay';
import schedule from 'node-schedule';
import { DataFrame } from 'data-forge';

import { OrderSide, OrderType } from './types/upbit.types';
import Upbit from './upbit';

const UPBIT_ACCESS_KEY = process.env.UPBIT_ACCESS_KEY;
const UPBIT_SECRET_KEY = process.env.UPBIT_SECRET_KEY;

const upbit = new Upbit(UPBIT_ACCESS_KEY, UPBIT_SECRET_KEY);

// 변동성 돌파 전략 목표가 계산하기
async function getTargetPrice(market: string) {
  const data = await upbit.getCandlesDays(market, 6);
  const yesterdayCandle = data[1]; // 어제자 캔들

  const range = yesterdayCandle.high - yesterdayCandle.low;
  const targetPrice = yesterdayCandle.price + range * 0.5; // 목표가격

  // 5MA 계산하기
  const df = new DataFrame({
    columnNames: ['close'],
    rows: data.map((item) => [item.price]),
  });
  const ma5Price = df
    .getSeries('close')
    .reverse()
    .rollingWindow(5)
    .select((v) => v.sum() / 5)
    .skip(1)
    .take(1)
    .toArray()[0];

  return { targetPrice, ma5Price };
}

async function getCurrentPrice(market: string) {
  const response = await upbit.getTicker([market]);
  const coin = response?.find(
    (e: { market: string; coin: string; price: number }) => `${e.market}-${e.coin}` === market
  );
  return coin?.price || 0.0;
}

async function main() {
  const marketCode = 'KRW-STEEM';

  let { targetPrice, ma5Price } = await getTargetPrice(marketCode); // 목표 가격

  // UTL 0시 마다 목표 가격 계산하기
  const rule = new schedule.RecurrenceRule();
  rule.hour = 0;
  rule.tz = 'Etc/UTC';
  schedule.scheduleJob(rule, async () => {
    ({ targetPrice, ma5Price } = await getTargetPrice(marketCode)); // 목표 가격

    const {
      ask_account: { balance },
    } = await upbit.getOrderChance(marketCode); // 보유 코인 조회
    if (parseFloat(balance) > 0) {
      // 시장가에 전량 매도하기
      await upbit.createOrder({
        market: marketCode,
        volume: balance,
        side: OrderSide.ASK, // 매도
        orderType: OrderType.MARKET, // 시장가 주문(매도)
      });
    }
  });

  while (true) {
    const currentPrice = await getCurrentPrice(marketCode); // 현재 가격 조회
    console.info(
      `현재가격: ${currentPrice.toFixed(2)} / 목표가격: ${targetPrice.toFixed(2)} / 5MA: ${ma5Price.toFixed(2)}`
    );

    if (currentPrice >= targetPrice && currentPrice > ma5Price) {
      console.log('목표 가격에 도달하였습니다.');
      try {
        await upbit.createOrder({
          market: marketCode,
          price: 5000,
          side: OrderSide.BID, // 매수
          orderType: OrderType.PRICE, // 시장가 주문(매수)
        });
      } catch (err) {
        console.error(err);
      }
    }

    await delay(1000);
  }
}
main();
