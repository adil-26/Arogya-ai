'use client';
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    RadialLinearScale,
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend
);

const HealthCharts = ({ data, type = 'line' }) => {
    // data: { labels: [], datasets: [{ label: '', data: [], borderColor: '' }] }

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Health Trends',
            },
        },
    };

    if (type === 'radar') {
        return <Radar data={data} options={options} />;
    }

    if (type === 'bar') {
        return <Bar data={data} options={options} />;
    }

    return <Line data={data} options={options} />;
};

export default HealthCharts;
