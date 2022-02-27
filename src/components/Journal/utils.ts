import { Chart, ChartOptions, Color, LegendItem, registerables } from 'chart.js';
import addDays from 'date-fns/addDays';
import addHours from 'date-fns/addHours';
import closestIndexTo from 'date-fns/closestIndexTo';
import differenceInHours from 'date-fns/differenceInHours';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import eachMinuteOfInterval from 'date-fns/eachMinuteOfInterval';
import format from 'date-fns/format';
import parseISO from 'date-fns/parseISO';
import type { JournalItem } from 'api/types';
import { TIMESTAMP_DIVIDER } from 'constants/date';
import type { DrawChartOptions, IJournalFilterState } from './types';

export const SUCCESS_STATUS_CODE = 200;
const TIME_MULTIPLIER = 5;

const drawChart = (data: DrawChartOptions, diagram: HTMLCanvasElement): Chart => {
    Chart.register(...registerables);

    const options = {
        // cast type because radius not typed in current version
        radius: 0,
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'Requests',
                    font: {
                        size: 20,
                        weight: '500',
                    },
                },
                ticks: {
                    callback(val) {
                        return Number(val) % 1 === 0 ? val : '';
                    },
                    font: {
                        weight: '600',
                    },
                },
            },
            x: {
                ticks: {
                    font: {
                        weight: '700',
                    },
                },
            },
        },
        plugins: {
            legend: {
                position: 'bottom',
                align: 'start',
                labels: {
                    boxHeight: 24,
                    boxWidth: 24,
                    padding: 20,
                    generateLabels: chart =>
                        chart.data.datasets.map<LegendItem>((dataset, index) => ({
                            text: dataset.label || '',
                            fillStyle: dataset.borderColor as Color,
                            datasetIndex: index,
                            lineWidth: 0,
                            borderRadius: 4,
                        })),
                },
            },
        },
        responsive: true,
        maintainAspectRatio: false,
    } as ChartOptions;

    return new Chart(diagram, {
        type: data.type || 'line',
        data: {
            labels: data.labels,
            datasets: data.datasets,
        },
        options,
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

    return +(time / TIMESTAMP_DIVIDER).toFixed(0);
};

export const getDates = (fromDate?: string): { dates: Date[]; type: 'day' | 'hour' } => {
    const date = new Date();
    const pastDate = fromDate ? new Date(fromDate) : addHours(date, -1);
    const differentHours = differenceInHours(date, pastDate);
    const delimiter = differentHours < 1 ? TIME_MULTIPLIER : differentHours * TIME_MULTIPLIER * 2;

    // eslint-disable-next-line no-magic-numbers
    return differentHours > 24
        ? { dates: eachDayOfInterval({ start: pastDate, end: date }), type: 'day' }
        : {
              dates: eachMinuteOfInterval(
                  {
                      start: differentHours < 1 ? addHours(date, -1) : pastDate,
                      end: date,
                  },
                  { step: delimiter },
              ),
              type: 'hour',
          };
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

export const getLabels = (dates: Date[], dateFormat = 'kk:mm'): string[] => dates.map(d => format(d, dateFormat));
export const getDate = (date: string): Date => parseISO(date);
export const getTimestamp = (date: Date): string => format(date, 'MMM dd, yyyy HH:mm:ss');

export const filterJournal = (journal: JournalItem[], filter: IJournalFilterState): JournalItem[] =>
    journal.filter(item => {
        let useFilter = true;

        switch (true) {
            case filter.isAllErrors:
                useFilter = item.response.status !== SUCCESS_STATUS_CODE;
                break;
            case !!filter.status:
                useFilter = item.response.status === Number(filter.status);
                break;
            case !!filter.mode:
                useFilter = item.mode === filter.mode;
                break;
            default:
                break;
        }

        return useFilter;
    });

export const capFirstLetter = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

export default drawChart;
