import { Component, OnInit, inject, signal } from '@angular/core';
import { ExpensesWidget } from './components/expenseswidget';
import { StatsWidget } from './components/statswidget';
import { RecentSalesWidget } from './components/recentsaleswidget';
import { BestSellingWidget } from './components/bestsellingwidget';
import { RevenueStreamWidget } from './components/revenuestreamwidget';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Analytics } from '../../shared/services/analytics';
import { IDashboardMaster } from '../../shared/interfaces/analytics';
import { Allowedgroup } from '../../shared/directives/allowedgroup';
import { CustomerDashboard } from './components/customer_dashboard';

@Component({
    selector: 'app-dashboard',
    imports: [StatsWidget, Allowedgroup, CustomerDashboard, CommonModule, ProgressSpinnerModule, ButtonModule, RecentSalesWidget, BestSellingWidget, RevenueStreamWidget, ExpensesWidget],
    template: `

      <div *ngIf="isLoading()" class="card border-none bg-surface-0 dark:bg-surface-900 rounded-2xl overflow-hidden">
        <div class="flex flex-col items-center justify-center p-12">
            <p-progressSpinner styleClass="w-12 h-12" strokeWidth="4" />
            <p class="mt-4 text-surface-500 font-medium">Fetching today's stats...</p>
        </div>
      </div>

        <div *ngIf="!isLoading()">
          <div *appAllowedgroup="['Chief Executive Officer (CEO)', 'Sales Representative']" class="grid grid-cols-12 gap-8">
              <div *ngIf="dashboardData(); let data">
                <app-stats-widget [stats] = "data.stats" class="contents" />
                <div class="col-span-12 xl:col-span-6">
                    <app-recent-sales-widget [sales] = "data.recent_sales || []" />
                    <app-best-selling-widget [sellers] = "data.best_sellers" />
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <app-revenue-stream-widget [revenue] = "data.revenue_stream" />
                    <app-expenses-widget [expenses] = "data.expense_stream" />
                    <app-customer-dashboard />
                </div>
            </div>
          </div>

          <div *appAllowedgroup="'Customer'">
              <div>
                <app-customer-dashboard />
            </div>
          </div>
        </div>

        <div *ngIf="!isLoading() && !dashboardData()" class="card border-none bg-surface-0 dark:bg-surface-900 rounded-2xl overflow-hidden">

          <div class="flex flex-col items-center justify-center min-h-[400px] w-full p-12 text-center">

            <div class="w-20 h-20 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-6 text-surface-400">
            <i class="pi pi-chart-bar text-4xl"></i>
            </div>

            <h3 class="text-xl font-bold text-surface-900 dark:text-surface-0">No Activity Yet</h3>

            <p class="text-surface-500 max-w-sm mt-2">
            We couldn't find any sales or payment records for your account today. Start selling to see your real-time summary here.
            </p>

            <p-button label="Sync Data" icon="pi pi-sync" class="mt-6" (onClick)="loadSummary()" />
          </div>

        </div>





    `
})
export class Dashboard implements OnInit {

  private dashboardService = inject(Analytics);

  dashboardData = signal<IDashboardMaster | null>(null);
  isLoading = signal(false);

  ngOnInit() {
        this.loadSummary();
    }

  loadSummary() {
      this.isLoading.set(true);
      this.dashboardService.getDashboardSummary().subscribe({
          next: (data) => {
            this.dashboardData.set(data),
            this.isLoading.set(false);
          },
          error: () => {
              this.dashboardData.set(null);
              this.isLoading.set(false);
          }
      });
  }

}
