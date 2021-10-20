import { Chart, ChartType, registerables } from 'chart.js';
import addDays from 'date-fns/addDays';
import addHours from 'date-fns/addHours';
import closestIndexTo from 'date-fns/closestIndexTo';
import differenceInHours from 'date-fns/differenceInHours';
import eachMinuteOfInterval from 'date-fns/eachMinuteOfInterval';
import format from 'date-fns/format';

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

const TIME_DIVIDER = 1000;

const drawChart = (data: DrawChartOptions, diagram: HTMLCanvasElement): Chart => {
    Chart.register(...registerables);

    return new Chart(diagram, {
        type: data.type || 'line',
        data: {
            labels: data.labels,
            datasets: data.datasets,
        },
    });
};

export type FromType = 'hour' | 'day' | 'all';

export const getFromUnix = (formatType: FromType): number | undefined => {
    const date = new Date();
    let time: number;

    switch (formatType) {
        case 'day':
            time = addDays(date, -1).getTime();
            break;
        case 'hour':
            time = addHours(date, -1).getTime();
            break;
        default:
            return undefined;
    }

    return +(time / TIME_DIVIDER).toFixed(0);
};

export const getDates = (fromDate?: string): Date[] => {
    const date = new Date();
    const pastDate = fromDate ? new Date(fromDate) : addHours(date, -1);
    const differentHours = differenceInHours(date, pastDate);
    // eslint-disable-next-line no-magic-numbers
    const delimiter = differentHours < 1 ? 5 : differentHours * 5;

    return eachMinuteOfInterval(
        {
            start: differentHours < 1 ? addHours(date, -1) : pastDate,
            end: date,
        },
        { step: delimiter },
    );
};

export const getDatesDataset = (list: Date[], searchList: Date[]): number[] => {
    const indexList = list
        .map(date => closestIndexTo(date, searchList))
        .reduce((total, item) => {
            if (total[item]) {
                total[item] += 1;
            } else if (total[item] === undefined) {
                total[item] = 1;
            }

            return total;
        }, {});

    return searchList.map((_item, i) => (indexList[i] ? indexList[i] : 0));
};

export const getLabels = (dates: Date[]): string[] => dates.map(d => format(d, 'kk:mm'));

export default drawChart;
