import type { ChartType } from 'chart.js';

export type ChartDatasetItem = {
    label: string;
    data: number[];
    borderColor: string;
};

export type DrawChartOptions = {
    labels: Array<string | number>;
    datasets: ChartDatasetItem[];
    type?: ChartType;
};

export interface IJournalFilterState {
    status?: string;
    mode: string;
    isAllErrors: boolean;
    format: ChartType;
}
