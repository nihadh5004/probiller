import { Line } from "react-chartjs-2";
import React from "react";

const OrdersCountChart = ({ datas }) => {
  const ordersCountLabels = [];
  const ordersCountData = [];

  const revenueLabels = [];
  const revenueData = [];

  for (let i = 0; i < datas.orders.length; i++) {
    ordersCountLabels.push(datas.orders[i].dates);
    ordersCountData.push(datas.orders[i].counts);
  }

  const data = {
    labels: ordersCountLabels,
    datasets: [
      {
        label: "Orders",
        data: ordersCountData,
        backgroundColor: "#fd7670",
        borderColor: "#fd7670",
        borderWidth: 1,
        tension: 0,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  return <Line data={data} options={options} width={300} height={150} />;
};

export default OrdersCountChart;
