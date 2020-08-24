import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2
} from "../../../../variables/charts";
import { SocketioService } from 'src/app/services/socketio.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public data: any;
  public salesChart;
  public clicked: boolean = true;
  public clicked1: boolean = false;
  private metrics;
  private eventTypesEmittedPerBlock = [];
  private transactionsEmittedPerBlock = [];
  private eventTopicsEmitted = [];
  private subscribedUsersCount = [];
  private linechart: any;
  private labels = [];
  private eventTopicsData = [];
  private transactionsData = [];
  private labelString: any;

  constructor(private socketioService: SocketioService) { }

  assignMetrics() {
    this.eventTypesEmittedPerBlock = this.metrics.eventTypesEmittedPerBlock;
    this.transactionsEmittedPerBlock = this.metrics.transactionsEmittedPerBlock;
    this.eventTopicsEmitted = this.metrics.eventTopicsEmitted;
    this.subscribedUsersCount = this.metrics.subscribedUsersCount;
  }

  setLabels() {
    this.eventTypesEmittedPerBlock.forEach(
      x => {
        this.labels.push(x.blockNumber)
      }
    );
    console.log("labels => ", this.labels);
    this.linechart.data.labels = this.labels;
  }

  setEventsData() {
    this.eventTypesEmittedPerBlock.forEach(
      x => {
        this.eventTopicsData.push(x.events_count)
      }
    );
    console.log("eventTopicsData => ", this.eventTopicsData);
  }

  setTransactionsData() {
    this.transactionsEmittedPerBlock.forEach(
      x => {
        this.transactionsData.push(x.transactions_count)
      }
    );
    console.log("transactionsData => ", this.transactionsData);
  }

  setDataToEvents() {
    this.linechart.data.datasets[0].data = this.eventTopicsData;
    this.linechart.options.scales.yAxes[0].scaleLabel.labelString = 'Events';
    this.labelString = 'Events';
    console.log(this.linechart.data.datasets[0].data);
    this.linechart.update();
  }

  setDataToTransactions() {
    this.linechart.data.datasets[0].data = this.transactionsData;
    this.linechart.options.scales.yAxes[0].scaleLabel.labelString = 'Transactions';
    this.labelString = 'Transactions';
    console.log(this.linechart.data.datasets[0].data);
    this.linechart.update();
  }

  initializeChart() {
    this.linechart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            data: this.data,
            fill: false,
            borderColor: '#3cb371',
            backgroundColor: "#0000FF",
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: 'Block Number',
              fontColor: '#20d3b5',
              fontSize: 18
            },
            ticks: {
              fontColor: '#20d3b5',
              fontSize: 18
            }
          }],
          yAxes: [{
            display: true,
            scaleLabel: {
              display: true,
              labelString: this.labelString,
              fontColor: '#20d3b5',
              fontSize: 18
            },
            ticks: {
              fontColor: '#20d3b5',
              fontSize: 18
            }
          }],
        }
      }
    });  
  }

  ngOnInit() {
    this.labelString = 'Events';
    this.data = this.eventTopicsData;
    this.initializeChart();
    // send an event to request metrics whenever the user opens the dashboard page
    this.socketioService.getSocketInstance().emit('requestMetrics');
    // each time we receive a metrics event, we'll use that data to display it
    this.socketioService.getSocketInstance().on('metrics', (metrics) => {
      console.log('metrics => ',JSON.parse(metrics));
      // assign our metrics
      this.metrics = JSON.parse(metrics);
      this.assignMetrics();
      this.setLabels();
      this.setEventsData();
      this.setTransactionsData();
      this.linechart.update();
    });

    /*var chartOrders = document.getElementById('chart-orders');

    parseOptions(Chart, chartOptions());


    var ordersChart = new Chart(chartOrders, {
      type: 'bar',
      options: chartExample2.options,
      data: chartExample2.data
    });

    var chartSales = document.getElementById('chart-sales');

    this.salesChart = new Chart(chartSales, {
			type: 'line',
			options: chartExample1.options,
			data: chartExample1.data
    });*/
  }





  public updateOptions() {
    this.salesChart.data.datasets[0].data = this.data;
    this.salesChart.update();
  }

}
