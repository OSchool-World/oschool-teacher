
const { Chart } = require('chart.js');
const { Line, mixins } = require('vue-chartjs');
const { reactiveProp } = mixins
Chart.defaults.global.defaultFontFamily = "'IRANSans', 'tahoma'";

module.exports = {
    extends: Line,
    mixins: [reactiveProp],
    props: ['chartData', 'options'],
    mounted() {
        this.renderChart(this.chartData, this.options);
    },
}