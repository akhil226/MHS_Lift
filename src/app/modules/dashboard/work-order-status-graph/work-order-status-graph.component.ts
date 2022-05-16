import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import * as c3 from 'c3';
import { WorkOrderStatusGraph } from '../../shared/interfaces/workOrder.interface';
import { WO_STATUS_GRAPH } from './../../shared/constants/style.constant';
import { WorkOrderService } from './../../shared/services/work-order.service';

type WoSelectedMetaData = { woId: string, woType: number, location: string[] };

@Component({
  selector: 'app-work-order-status-graph',
  templateUrl: './work-order-status-graph.component.html',
  styleUrls: ['./work-order-status-graph.component.scss']
})
export class WorkOrderStatusGraphComponent implements OnInit, OnChanges {
  @Input() workOrderStatus: WorkOrderStatusGraph | undefined;
  columns: any = [];
  colors: any = {};
  chart: any;
  total: any = 0;
  type: any;
  private woIdNameMapper: { [key: string]: string } = {};
  constructor(private router: Router, private woService: WorkOrderService) {
  }

  ngOnInit(): void {
    const idNameMapper = Object.entries(WO_STATUS_GRAPH).map(([key, value]) => ({ [value[0]]: key }));
    this.woIdNameMapper = Object.assign({}, ...idNameMapper);
  }
  ngOnChanges(changes: SimpleChanges): void {
    for (const propName in changes) {
      if (changes.hasOwnProperty(propName)) {
        this.columns = this.workOrderStatus?.columns;
        this.colors = this.workOrderStatus?.colors;
        this.total = this.workOrderStatus?.total;
        this.type = this.workOrderStatus?.type;
        this.generateDonutChart();
      }
    }
  }

  public generateDonutChart(): void {
    const type = 'donut';
    const title = '';
    const colors = this.colors;
    const columns = this.columns;
    setTimeout(() => {
      this.chart = c3.generate({
        bindto: '#woStatus',
        size: { height: 280 },
        data: {
          columns, colors, labels: false, type,
          onclick: (selectedWorkOrder) => {
            const { id } = selectedWorkOrder;
            this.navToWorkOrder(id);
          },
        },
        transition: { duration: 1000 },
        donut: { title, label: { format(value, ratio, id): string { return ''; } }, width: 40 },
        tooltip: { show: false },
        legend: {
          show: false, position: 'right'
        }
      });
    });
  }
  onLegendClick([woName]: [string]): void {
    this.navToWorkOrder(woName);
  }
  private navToWorkOrder(woStatus: string): void {
    const selectedName = this.woIdNameMapper[woStatus];
    const selectedId = this.workOrderStatus?.wostatusMap.find(({ valueField }) => selectedName === valueField)?.keyField || '';
    const woMetadata = this.woService.getWoSelectedMetadata() as WoSelectedMetaData;
    const metadata = { ...woMetadata, woId: selectedId};
    this.woService.setWoSelectedMetadata(metadata);
    this.router.navigateByUrl(`/work-orders?woStatus=${selectedId}`);
  }
  public legendMouserover(id: any): void {
    this.chart.focus(id);
  }
  public legendMouseOut(): void {
    this.chart.revert();
  }
}
