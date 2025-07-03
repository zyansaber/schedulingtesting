
import React, { useState } from "react";

// 工具函数
const groupBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const groupKey = item[key] || "Unknown";
    acc[groupKey] = acc[groupKey] || [];
    acc[groupKey].push(item);
    return acc;
  }, {});
};

const getMonthWeek = (date) => {
  const d = new Date(date);
  const month = d.getMonth() + 1;
  const week = Math.ceil((d.getDate()) / 7);
  return `M${month}-W${week}`;
};

const AllocationSummary = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div className="text-center text-gray-500 mt-10">No schedule data available.</div>;
  }

  const data2025 = data.filter(item => {
    const d = new Date(item.forecastProductionDate);
    return d.getFullYear() === 2025;
  });

  if (data2025.length === 0) {
    return <div className="text-center text-gray-500 mt-10">No 2025 forecast data found.</div>;
  }

  const dealers = Array.from(new Set(data2025.map(d => d.dealer))).sort();
  const periods = Array.from(
    new Set(data2025.map(d => getMonthWeek(d.forecastProductionDate)))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const matrix = {};

  data2025.forEach(item => {
    const dealer = item.dealer || "Unknown";
    const period = getMonthWeek(item.forecastProductionDate);
    const isOccupied = item.chassisNo ? "Occupied" : "Empty";

    if (!matrix[dealer]) matrix[dealer] = {};
    if (!matrix[dealer][period]) matrix[dealer][period] = { Occupied: 0, Empty: 0 };

    matrix[dealer][period][isOccupied]++;
  });

  return (
    <div className="overflow-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Allocation Summary (2025)</h2>
      <table className="min-w-full text-sm border-collapse border">
        <thead>
          <tr>
            <th className="border px-2 py-1 bg-gray-100 sticky left-0 z-10">Dealer</th>
            {periods.map(p => (
              <React.Fragment key={p}>
                <th className="border px-2 py-1 bg-gray-100">{p} - Occ</th>
                <th className="border px-2 py-1 bg-gray-100">{p} - Emp</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {dealers.map(dealer => (
            <tr key={dealer}>
              <td className="border px-2 py-1 font-medium sticky left-0 bg-white z-0">{dealer}</td>
              {periods.map(p => (
                <React.Fragment key={p}>
                  <td className="border px-2 py-1 text-center text-green-600">{matrix[dealer]?.[p]?.Occupied || 0}</td>
                  <td className="border px-2 py-1 text-center text-red-500">{matrix[dealer]?.[p]?.Empty || 0}</td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationSummary;
