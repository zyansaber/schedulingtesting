
import React, { useState } from "react";

// 转换原始数据格式
const transformData = (raw) => {
  return raw
    .map(item => {
      if (!item["Forecast Production Date"]) return null;
      const [day, month, year] = item["Forecast Production Date"].split("/");
      return {
        forecastProductionDate: `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`,
        chassisNo: item["Chassis"] || "",
        dealer: item["Dealer"] || "Unknown"
      };
    })
    .filter(Boolean);
};

const AllocationSummary = ({ data, dealerColors }) => {
  const transformed = transformData(data);
  const [expandedMonth, setExpandedMonth] = useState(null);

  const data2025 = transformed.filter(item => {
    const d = new Date(item.forecastProductionDate);
    return d.getFullYear() === 2025;
  });

  if (!data2025.length) return <div className="text-center text-gray-500 mt-10">No 2025 forecast data found.</div>;

  // 构建 month → dealer → count 数据
  const monthDealerMap = {};
  const monthDateMap = {};

  data2025.forEach(item => {
    const date = new Date(item.forecastProductionDate);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const day = date.toISOString().split("T")[0];
    const dealer = item.dealer || "Unknown";
    const isOccupied = item.chassisNo ? "Occupied" : "Empty";

    if (!monthDealerMap[month]) monthDealerMap[month] = {};
    if (!monthDealerMap[month][dealer]) monthDealerMap[month][dealer] = { Occupied: 0, Empty: 0 };
    monthDealerMap[month][dealer][isOccupied]++;

    if (!monthDateMap[month]) monthDateMap[month] = {};
    if (!monthDateMap[month][day]) monthDateMap[month][day] = {};
    if (!monthDateMap[month][day][dealer]) monthDateMap[month][day][dealer] = { Occupied: 0, Empty: 0 };
    monthDateMap[month][day][dealer][isOccupied]++;
  });

  const allDealers = Array.from(new Set(data2025.map(d => d.dealer))).sort();
  const allMonths = Object.keys(monthDealerMap).sort();

  return (
    <div className="overflow-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Allocation Summary (2025)</h2>
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 sticky left-0 z-10">Dealer</th>
            {allMonths.map(month => (
              <th key={month} className="border p-2 bg-gray-100 text-center">
                {month}<br />
                <button onClick={() => setExpandedMonth(expandedMonth === month ? null : month)} className="text-xs text-blue-600 underline">
                  {expandedMonth === month ? "Collapse" : "Expand"}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allDealers.map(dealer => (
            <tr key={dealer}>
              <td className="border p-2 sticky left-0 bg-white z-0">
                <span
                  className="px-2 py-1 rounded"
                  style={{ backgroundColor: dealerColors?.[dealer] || "#f0f0f0" }}
                >
                  {dealer}
                </span>
              </td>
              {allMonths.map(month => {
                const stats = monthDealerMap[month]?.[dealer] || { Occupied: 0, Empty: 0 };
                return (
                  <td key={month} className="border p-2 text-center">
                    <div className="text-green-600">Occ: {stats.Occupied}</div>
                    <div className="text-red-600">Emp: {stats.Empty}</div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 展开月的详细内容 */}
      {expandedMonth && (
        <div className="mt-6 border rounded shadow bg-white p-4">
          <h3 className="text-lg font-bold mb-2">Details for {expandedMonth}</h3>
          <table className="min-w-full text-sm table-auto border">
            <thead>
              <tr className="bg-gray-50">
                <th className="border px-2 py-1">Date</th>
                {allDealers.map(dealer => (
                  <th key={dealer} colSpan={2} className="border px-2 py-1 text-center">
                    <span
                      className="px-2 py-1 rounded"
                      style={{ backgroundColor: dealerColors?.[dealer] || "#f0f0f0" }}
                    >
                      {dealer}
                    </span>
                  </th>
                ))}
              </tr>
              <tr>
                <th></th>
                {allDealers.map(dealer => (
                  <React.Fragment key={dealer}>
                    <th className="border px-2 py-1">Occ</th>
                    <th className="border px-2 py-1">Emp</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(monthDateMap[expandedMonth] || {}).sort().map(([date, dealerMap]) => (
                <tr key={date}>
                  <td className="border px-2 py-1">{date}</td>
                  {allDealers.map(dealer => {
                    const s = dealerMap[dealer] || { Occupied: 0, Empty: 0 };
                    return (
                      <React.Fragment key={dealer}>
                        <td className="border px-2 py-1 text-center text-green-600">{s.Occupied}</td>
                        <td className="border px-2 py-1 text-center text-red-600">{s.Empty}</td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllocationSummary;
