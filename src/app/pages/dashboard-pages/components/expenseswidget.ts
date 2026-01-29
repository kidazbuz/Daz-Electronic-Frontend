import { Component, input, effect, OnInit, OnDestroy, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { debounceTime, Subscription } from 'rxjs';
import { IExpensesStreamData } from '../../../shared/interfaces/analytics';
import { LayoutService } from '../../../layout/service/layout.service';

@Component({
    standalone: true,
    selector: 'app-expenses-widget',
    imports: [ChartModule],
    template: `
    <div class="card mb-8!">
        <div class="font-semibold text-xl mb-4">Monthly Expenses</div>
        @if (expenses()) {
            <p-chart type="bar" [data]="chartData" [options]="chartOptions" class="h-100" />
        } @else {
            <div class="flex justify-center items-center h-100">
                <i class="pi pi-spin pi-spinner mr-2"></i> Loading expenses...
            </div>
        }
    </div>`
})
export class ExpensesWidget implements OnInit, OnDestroy {

    expenses = input<IExpensesStreamData>();

    chartData: any;
    chartOptions: any;
    private subscription!: Subscription;
    private layoutService = inject(LayoutService);

    constructor() {

        effect(() => {
            if (this.expenses()) {
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
        const data = this.expenses();
        if (!data) return;

        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const borderColor = documentStyle.getPropertyValue('--surface-border');
        const textMutedColor = documentStyle.getPropertyValue('--text-color-secondary');

        const datasets = data.datasets.map((ds) => {
            return {
                type: 'bar',
                label: ds.label,
                backgroundColor: documentStyle.getPropertyValue('--p-orange-500'),
                data: ds.data,
                barThickness: 32,
                borderRadius: { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 },
                borderSkipped: false
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
                    ticks: { color: textMutedColor },
                    grid: { color: 'transparent', borderColor: 'transparent' }
                },
                y: {
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
