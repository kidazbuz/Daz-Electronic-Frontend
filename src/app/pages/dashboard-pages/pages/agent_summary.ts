import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IAgentSummaryResponse } from '../../../shared/interfaces/sales';
import { SalesService } from '../../../shared/services/sales-service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
    selector: 'app-agent-summary',
    standalone: true,
    imports: [CommonModule, ToastModule, ConfirmDialogModule, ProgressSpinnerModule, TagModule, DividerModule, ButtonModule],
    template: `

    <p-toast />
    <p-confirmdialog />

    <div class="card border-none bg-surface-0 dark:bg-surface-900 rounded-2xl overflow-hidden">

        <div *ngIf="isLoading()" class="flex flex-col items-center justify-center p-12">
            <p-progressSpinner styleClass="w-12 h-12" strokeWidth="4" />
            <p class="mt-4 text-surface-500 font-medium">Fetching today's stats...</p>
        </div>

        <div *ngIf="!isLoading() && summary(); let data">
            <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center bg-surface-50/50 dark:bg-surface-800/50">
                <div>
                    <h2 class="text-xl font-bold text-surface-900 dark:text-surface-0 m-0">{{ data.agent_name }}</h2>
                    <p class="text-sm text-surface-500 m-0">{{ data.date | date:'fullDate' }}</p>
                </div>
                <p-tag [value]="data.is_closed ? 'DAY CLOSED' : 'OPEN SESSION'"
                       [severity]="data.is_closed ? 'success' : 'warn'"
                       [rounded]="true" />
            </div>

            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div class="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-xl border border-primary-100 dark:border-primary-800">
                        <span class="text-xs font-bold text-primary-600 uppercase tracking-wider">Gross Revenue</span>
                        <div class="text-2xl font-black text-primary-700 dark:text-primary-400 mt-1">
                            TSh {{ data.summary.revenue | number:'1.2-2' }}
                        </div>
                    </div>
                    <div class="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                        <span class="text-xs font-bold text-green-600 uppercase tracking-wider">Net Cash Handover</span>
                        <div class="text-2xl font-black text-green-700 dark:text-green-400 mt-1">
                            TSh {{ data.summary.net_cash_on_hand | number:'1.2-2' }}
                        </div>
                    </div>
                    <div class="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-100 dark:border-orange-800">
                        <span class="text-xs font-bold text-orange-600 uppercase tracking-wider">New Debt (Credit)</span>
                        <div class="text-2xl font-black text-orange-700 dark:text-orange-400 mt-1">
                            TSh {{ data.summary.new_credit_issued | number:'1.2-2' }}
                        </div>
                    </div>
                </div>

                <div class="bg-surface-50 dark:bg-surface-800 p-5 rounded-xl border border-surface-200 dark:border-surface-700">
                    <h4 class="text-sm font-bold text-surface-600 dark:text-surface-400 uppercase mb-4 tracking-widest">Collection Breakdown</h4>

                    <div class="space-y-3">
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-surface-500">Sales Transactions</span>
                            <span class="font-bold">{{ data.summary.sales_count }} Receipts</span>
                        </div>
                        <p-divider />
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-surface-500">Mobile Money (MoMo)</span>
                            <span class="font-bold text-blue-600">TSh {{ data.summary.momo_received | number:'1.2-2' }}</span>
                        </div>
                        <p-divider />
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-surface-500">Cash Expenses</span>
                            <span class="font-bold text-red-500">- TSh {{ data.summary.total_expenses | number:'1.2-2' }}</span>
                        </div>
                    </div>
                </div>

                <div class="mt-8 flex justify-end gap-3">
                    <p-button label="Refresh" icon="pi pi-refresh" severity="secondary" [text]="true" (onClick)="loadSummary()" />
                    <p-button *ngIf="!data.is_closed" label="Initiate Day Closure" icon="pi pi-lock" severity="primary" (onClick)="confirmCloseDay()" />
                </div>
            </div>
        </div>

      <div *ngIf="!isLoading() && !summary()" class="flex flex-col items-center justify-center min-h-[400px] w-full p-12 text-center">

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
    `,
    providers: [ConfirmationService, MessageService]
})
export class AgentSummary implements OnInit {

    private expenseService = inject(SalesService);
    private confirmationService = inject(ConfirmationService);
    private messageService = inject(MessageService);

    summary = signal<IAgentSummaryResponse | null>(null);
    isLoading = signal(false);

    ngOnInit() {
        this.loadSummary();
    }

    loadSummary() {
        this.isLoading.set(true);
        this.expenseService.getMySummary().subscribe({
            next: (data) => {
                // Check if summary actually has data (all zeros check)
                const hasActivity = data.summary.sales_count > 0 || Number(data.summary.revenue) > 0;
                this.summary.set(hasActivity ? data : null);
                this.isLoading.set(false);
            },
            error: () => {
                this.summary.set(null);
                this.isLoading.set(false);
            }
        });
    }

    confirmCloseDay() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to close the sales day? This will finalize all current transactions and notify the CEO.',
            header: 'Security Confirmation',
            icon: 'pi pi-lock',
            acceptLabel: 'Yes, Close Day',
            rejectLabel: 'Cancel',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.closeSalesDay()
        });
    }

    closeSalesDay(): void {
        this.isLoading.set(true);

        this.expenseService.closeDay().subscribe({
            next: (response: any) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Day Closed',
                    detail: response.detail
                });

                this.loadSummary();
            },
            error: (error) => {
                this.isLoading.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Closure Failed',
                    detail: error.error?.detail || "An error occurred while closing the day."
                });
            }
        });
    }

}
