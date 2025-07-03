
import React from "react";

const AllocationSummary = ({ data }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No schedule data available to render Allocation Summary.
      </div>
    );
  }

  // 过滤出 2025 年数据
  const data2025 = data.filter(item => {
    const date = new Date(item.forecastProductionDate);
    return date.getFullYear() === 2025;
  });

  if (data2025.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No 2025 forecast data found.
      </div>
    );
  }

  // 分组函数
  const groupBy = (arr, key) => arr.reduce((acc, item) => {
    const groupKey = item[key] || "Unknown";
    acc[groupKey] = acc[groupKey] || [];
    acc[groupKey].push(item);
    return acc;
  }, {});

  const groupedByDealer = groupBy(data2025, "dealer");

  // 分月份分天分状态统计
  const getSlotMatrix = (records) => {
    const matrix = {};
    records.forEach(item => {
      const date = new Date(item.forecastProductionDate);
      if (isNaN(date)) return;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const day = date.toISOString().split("T")[0];
      const isOccupied = item.chassisNo ? "Occupied" : "Empty";
      matrix[month] = matrix[month] || {};
      matrix[month][day] = matrix[month][day] || { Occupied: 0, Empty: 0 };
      matrix[month][day][isOccupied]++;
    });
    return matrix;
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Allocation Summary - 2025</h2>
      {Object.entries(groupedByDealer).map(([dealer, records]) => {
        const matrix = getSlotMatrix(records);
        return (
          <div key={dealer} className="mb-6 border p-4 rounded-lg shadow bg-white">
            <h3 className="text-lg font-bold mb-2">{dealer}</h3>
            {Object.entries(matrix).map(([month, days]) => (
              <div key={month} className="mb-3">
                <h4 className="text-md font-semibold text-indigo-700">{month}</h4>
                <table className="table-auto border-collapse w-full text-sm mt-2">
                  <thead>
                    <tr>
                      <th className="border p-1 bg-gray-100">Date</th>
                      <th className="border p-1 bg-gray-100">Occupied</th>
                      <th className="border p-1 bg-gray-100">Empty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(days).map(([day, stats]) => (
                      <tr key={day}>
                        <td className="border p-1">{day}</td>
                        <td className="border p-1 text-green-600">{stats.Occupied}</td>
                        <td className="border p-1 text-red-600">{stats.Empty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default AllocationSummary;
