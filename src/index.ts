import Upbit from "./upbit";

const upbit = new Upbit();

// 변동성 돌파 전략 목표가 계산
async function getTargetPrice(market: string) {
  const data = await upbit.getCandlesDays(market, 2);
  const yesterdayCandle = data[1]; // 어제자 캔들

  const range = yesterdayCandle.high - yesterdayCandle.low;
  const targetPrice = yesterdayCandle.price + range * 0.5; // 목표가격
  return targetPrice;
}

async function main() {
  const targetPrice = await getTargetPrice("KRW-STEEM");
  console.log(targetPrice);
}
main();
