
const { Chart } = require('chart.js');
const { Doughnut, mixins } = require('vue-chartjs');
const { reactiveProp } = mixins
Chart.defaults.global.defaultFontFamily = "'IRANSans', 'tahoma'";

module.exports = {
    extends: Doughnut,
    mixins: [reactiveProp],
    props: ['chartData', 'options'],
    mounted() {
        this.renderChart(this.chartData, this.options);
    }
}