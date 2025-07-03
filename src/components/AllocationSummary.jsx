
import React, { useState } from "react";

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
  const [expandedMonths, setExpandedMonths] = useState({});

  const toggleMonth = (month) => {
    setExpandedMonths(prev => ({ ...prev, [month]: !prev[month] }));
  };

  const data2025 = transformed.filter(item => {
    const d = new Date(item.forecastProductionDate);
    return d.getFullYear() === 2025;
  });

  if (!data2025.length) return <div className="text-center text-gray-500 mt-10">No 2025 forecast data found.</div>;

  const groupByMonth = {};
  data2025.forEach(item => {
    const date = new Date(item.forecastProductionDate);
    const monthKey = date.toLocaleString('default', { month: 'long' });
    if (!groupByMonth[monthKey]) groupByMonth[monthKey] = [];
    groupByMonth[monthKey].push(item);
  });

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Allocation Summary (2025)</h2>
      {Object.entries(groupByMonth).map(([month, records]) => (
        <div key={month} className="mb-4 border rounded shadow bg-white">
          <div className="flex justify-between items-center px-4 py-2 bg-gray-100 font-semibold cursor-pointer" onClick={() => toggleMonth(month)}>
            <span>{month} ({records.length} records)</span>
            <span>{expandedMonths[month] ? "▲" : "▼"}</span>
          </div>
          {expandedMonths[month] && (
            <table className="min-w-full text-sm table-auto border-t">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Dealer</th>
                  <th className="border px-2 py-1">Status</th>
                  <th className="border px-2 py-1">Chassis No</th>
                </tr>
              </thead>
              <tbody>
                {records.sort((a, b) => new Date(a.forecastProductionDate) - new Date(b.forecastProductionDate)).map((rec, i) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{rec.forecastProductionDate}</td>
                    <td className="border px-2 py-1">
                      <span className="px-2 py-1 rounded" style={{ backgroundColor: dealerColors?.[rec.dealer] || "#f0f0f0" }}>
                        {rec.dealer}
                      </span>
                    </td>
                    <td className="border px-2 py-1">{rec.chassisNo ? "Occupied" : "Empty"}</td>
                    <td className="border px-2 py-1">{rec.chassisNo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
};

export default AllocationSummary;
