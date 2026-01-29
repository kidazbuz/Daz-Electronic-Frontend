export interface IStatsWidgetData {
    total_orders: number;
    new_orders: number;
    total_revenue: number;
    revenue_growth_percent: number;
    total_customers: number;
    new_customers: number;
    unread_comments: number;
    responded_comments: number;
}


export interface IRecentSaleItem {
    image: string;
    name: string;
    price: number;
}

export interface IBestSellerItem {
    name: string;
    category: string;
    percentage: number;
    color: string; // e.g., 'orange', 'cyan', 'pink', 'green', 'purple', 'teal'
}

export interface IRevenueDataset {
    label: string;    // e.g., 'Subscriptions', 'Advertising', 'Affiliate'
    data: number[];   // e.g., [4000, 10000, 15000, 4000]
}

export interface IRevenueStreamData {
    labels: string[]; // e.g., ['Q1', 'Q2', 'Q3', 'Q4']
    datasets: IRevenueDataset[];
}

export interface IExpensesDataset {
    label: string;    // e.g., 'Subscriptions', 'Advertising', 'Affiliate'
    data: number[];   // e.g., [4000, 10000, 15000, 4000]
}

export interface IExpensesStreamData {
    labels: string[]; // e.g., ['Q1', 'Q2', 'Q3', 'Q4']
    datasets: IExpensesDataset[];
}

export interface IDashboardMaster {
    stats: IStatsWidgetData;          // Card 1-4 (Orders, Revenue, Customers, Comments)
    recent_sales: IRecentSaleItem[];   // The Table
    best_sellers: IBestSellerItem[];   // The Progress Bars
    expense_stream: IExpensesStreamData; // The Timeline (Today, Yesterday, etc.)
    revenue_stream: IRevenueStreamData;      // The Bar Chart
}
