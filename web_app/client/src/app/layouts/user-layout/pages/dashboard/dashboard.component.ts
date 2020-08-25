import { Component, OnInit } from '@angular/core';
import Chart from 'chart.js';
import { SocketioService } from 'src/app/services/socketio.service';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private socketioService: SocketioService,
    private route: ActivatedRoute
  ) { }

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
    this.linechart.data.labels = this.labels;
  }

  setEventsData() {
    this.eventTypesEmittedPerBlock.forEach(
      x => {
        this.eventTopicsData.push(x.events_count)
      }
    );
  }

  setTransactionsData() {
    this.transactionsEmittedPerBlock.forEach(
      x => {
        this.transactionsData.push(x.transactions_count)
      }
    );
  }

  setDataToEvents() {
    this.linechart.data.datasets[0].data = this.eventTopicsData;
    this.linechart.options.scales.yAxes[0].scaleLabel.labelString = 'Events Emitted';
    this.labelString = 'Events';
    this.linechart.update();
  }

  setDataToTransactions() {
    this.linechart.data.datasets[0].data = this.transactionsData;
    this.linechart.options.scales.yAxes[0].scaleLabel.labelString = 'Transactions Emitted';
    this.labelString = 'Transactions';
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
              fontSize: 18,
              beginAtZero: true,
              callback: function(value) {if (value % 1 === 0) {return value;}}
            }
          }],
        }
      }
    });  
  }

  resetData() {
    this.labels = [];
    this.eventTopicsData = [];
    this.transactionsData = [];
    this.data = this.eventTopicsData;
  }

  ngOnInit() {
    this.labelString = 'Events Emitted';
    this.resetData();
    this.initializeChart();
    const previous_route = this.route.snapshot.paramMap.get('previousUrl');
    console.log('previous_route => ', previous_route);
    if(!previous_route) {
      // send an event to request metrics whenever the user opens the dashboard page
      this.socketioService.getSocketInstance().emit('requestMetrics');
    }
    // each time we receive a metrics event, we'll use that data to display it
    this.socketioService.getSocketInstance().on('metrics', (metrics) => {
      // assign our metrics
      this.metrics = JSON.parse(metrics);
      this.resetData();
      this.assignMetrics();
      this.setLabels();
      this.setEventsData();
      this.setTransactionsData();
      this.linechart.data.datasets[0].data = this.eventTopicsData;
      this.linechart.update();
    });
  }
}
