import { Component, input, effect, OnInit, OnDestroy, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { IRevenueStreamData } from '../../../shared/interfaces/analytics';
import { LayoutService } from '../../../layout/service/layout.service';

@Component({
    standalone: true,
    selector: 'app-revenue-stream-widget',
    imports: [ChartModule],
    template: `<div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Revenue Stream</div>
        @if (revenue()) {
            <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-100" />
        } @else {
            <div class="flex justify-center items-center h-100">Loading chart data...</div>
        }
    </div>`
})
export class RevenueStreamWidget implements OnInit, OnDestroy {

  revenue = input<IRevenueStreamData>();

  chartData: any;
  chartOptions: any;
  private subscription!: Subscription;
  private layoutService = inject(LayoutService);

  constructor() {
      // Automatically re-init chart whenever the revenue input changes
      effect(() => {
          if (this.revenue()) {
              this.initChart();
          }
      });
  }

  ngOnInit() {
      this.subscription = this.layoutService.configUpdate$
          .pipe(debounceTime(25))
          .subscribe(() => {
              this.initChart();
          });
  }

  initChart() {
      const data = this.revenue();
      if (!data) return;

      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const borderColor = documentStyle.getPropertyValue('--surface-border');
      const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

      const datasets = data.datasets.map((ds, index) => {

          const bgColor = index === 0
              ? documentStyle.getPropertyValue('--p-primary-500')
              : documentStyle.getPropertyValue('--p-orange-500');

          return {
              type: 'bar',
              label: ds.label,
              backgroundColor: bgColor,
              data: ds.data,
              barThickness: 32,
              borderRadius: index === 0 ? { topLeft: 8, topRight: 8 } : 0,
          };
      });

      this.chartData = {
          labels: data.labels,
          datasets: datasets
      };

      this.chartOptions = {
          maintainAspectRatio: false,
          aspectRatio: 0.8,
          plugins: {
              legend: {
                  labels: { color: textColor }
              },
              tooltip: {
                  mode: 'index',
                  intersect: false
              }
          },
          scales: {
              x: {
                  stacked: true,
                  ticks: { color: textMutedColor },
                  grid: { color: 'transparent', borderColor: 'transparent' }
              },
              y: {
                  stacked: true,
                  ticks: { color: textMutedColor },
                  grid: { color: borderColor, drawTicks: false }
              }
          }
      };
  }

  ngOnDestroy() {
      if (this.subscription) {
          this.subscription.unsubscribe();
      }
  }

}
