import { useSelector } from 'react-redux';
import Chart from 'react-apexcharts';
import arrowUpImage from '../assets/down-arrow.svg'
import arrowDownImage from '../assets/down-arrow.svg'

import Banner from './Banner'
import { options, series } from './PriceChart.config'
import { priceChartSelector } from '../store/selectors';

const PriceChart = () => {
  const account = useSelector(state => state.provider.account)
  const tokenSymbols = useSelector(state => state.tokens.symbols)

  const priceChart = useSelector(priceChartSelector)

  return (
    <div className="component exchange__chart">
      <div className='component__header flex-between'>
        <div className='flex'>

          <h2>{tokenSymbols && tokenSymbols[0]}/{tokenSymbols && tokenSymbols[1]}</h2>

          <div className='flex'>

            {priceChart && priceChart.lastPriceChange === '+' ? (
              <img src={arrowUpImage} alt="Arrow up" />
            ): (
              <img src={arrowDownImage} alt="Arrow down" />
            )}

            <span className='up'>{priceChart && priceChart.lastPrice}</span>
          </div>

        </div>
      </div>

      {!account ? (
        <Banner text="Please connect your wallet" />
      ) : (
        <Chart
          type="candlestick"
          options={options}
          series={priceChart ? priceChart.series : series}
          width="100%"
          height="100%"
        />
      )}

    </div>
  );
}

export default PriceChart;
