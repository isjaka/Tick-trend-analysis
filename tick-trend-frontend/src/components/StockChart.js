import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import axios from 'axios';

const StockChart = ({ symbol, date }) => {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(
                    `http://localhost:8000/api/stock-data/${symbol}?date=${date}`
                );
                const data = response.data.map(point => [
                    new Date(point.time).getTime(),
                    point.price
                ]);
                setChartData(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Error loading chart data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (symbol && date) {
            fetchData();
        }
    }, [symbol, date]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!chartData.length) return <div>No data available for the selected date.</div>;

    const options = {
        title: {
            text: `Stock Price: ${symbol}`
        },
        rangeSelector: {
            selected: 1,
            buttons: [{
                type: 'hour',
                count: 1,
                text: '1h'
            }, {
                type: 'hour',
                count: 3,
                text: '3h'
            }, {
                type: 'hour',
                count: 6,
                text: '6h'
            }, {
                type: 'all',
                text: 'All'
            }]
        },
        series: [{
            name: symbol,
            data: chartData,
            type: 'line',
            tooltip: {
                valueDecimals: 2
            }
        }],
        xAxis: {
            type: 'datetime',
            labels: {
                format: '{value:%H:%M}'
            }
        },
        yAxis: {
            title: {
                text: 'Price'
            }
        },
        tooltip: {
            split: false,
            shared: true,
            formatter: function() {
                return `<b>${symbol}</b><br/>
                        Time: ${Highcharts.dateFormat('%H:%M:%S', this.x)}<br/>
                        Price: ${this.y.toFixed(2)}`;
            }
        }
    };

    return (
        <div className="chart-container">
            <HighchartsReact
                highcharts={Highcharts}
                constructorType={'stockChart'}
                options={options}
            />
        </div>
    );
};

export default StockChart;