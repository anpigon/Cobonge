require("dotenv").config();
import delay from 'delay';
import schedule from 'node-schedule';
import { OrderSide, OrderType } from './types/upbit.types';
import Upbit from './upbit';

const UPBIT_ACCESS_KEY = process.env.UPBIT_ACCESS_KEY;
const UPBIT_SECRET_KEY = process.env.UPBIT_SECRET_KEY;

const upbit = new Upbit(UPBIT_ACCESS_KEY, UPBIT_SECRET_KEY);;

// 변동성 돌파 전략 목표가 계산하기
async function getTargetPrice(market: string) {
  const data = await upbit.getCandlesDays(market, 2);
  const yesterdayCandle = data[1]; // 어제자 캔들

  const range = yesterdayCandle.high - yesterdayCandle.low;
  const targetPrice = yesterdayCandle.price + range * 0.5; // 목표가격
  return targetPrice;
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

  let targetPrice = await getTargetPrice(marketCode); // 목표 가격

  // UTL 0시 마다 목표 가격 계산하기
  const rule = new schedule.RecurrenceRule();
  rule.hour = 0;
  rule.tz = 'Etc/UTC';
  schedule.scheduleJob(rule, async () => {
    targetPrice = await getTargetPrice(marketCode); // 목표 가격
  });

  while (true) {
    const currentPrice = await getCurrentPrice(marketCode); // 현재 가격 조회
    console.info(`현재가격: ${currentPrice.toFixed(2)} / 목표가격: ${targetPrice.toFixed(2)}`);

    if (currentPrice >= targetPrice) {
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
