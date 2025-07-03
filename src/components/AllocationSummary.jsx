
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
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [visibleMonths, setVisibleMonths] = useState([]);

  const data2025 = transformed.filter(item => {
    const d = new Date(item.forecastProductionDate);
    return d.getFullYear() === 2025;
  });

  if (!data2025.length) return <div className="text-center text-gray-500 mt-10">No 2025 forecast data found.</div>;

  const monthDealerMap = {};
  const monthDateMap = {};
  const allDealers = Array.from(new Set(data2025.map(d => d.dealer))).sort();

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

  const allMonths = Object.keys(monthDealerMap).sort();

  const toggleMonth = (month) => {
    setVisibleMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const handleExpand = (month) => {
    setExpandedMonth(prev => (prev === month ? null : month));
  };

  return (
    <div className="overflow-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Allocation Summary (2025)</h2>

      <div className="mb-4">
        <label className="font-medium">Select Months:</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {allMonths.map(month => (
            <label key={month} className="text-sm flex items-center gap-1">
              <input
                type="checkbox"
                checked={visibleMonths.includes(month)}
                onChange={() => toggleMonth(month)}
              />
              {month}
            </label>
          ))}
        </div>
      </div>

      <table className="min-w-full border-collapse text-sm table-fixed">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 sticky left-0 z-10 w-40">Dealer</th>
            {visibleMonths.map(month => (
              <th key={month} colSpan={2} className="border p-2 bg-gray-100 text-center min-w-32">
                {month}
                <div>
                  <button
                    onClick={() => handleExpand(month)}
                    className="text-xs text-blue-600 underline"
                  >
                    {expandedMonth === month ? "Collapse" : "Expand"}
                  </button>
                </div>
              </th>
            ))}
          </tr>
          <tr>
            <th className="border bg-gray-50 sticky left-0 z-10"></th>
            {visibleMonths.map(month => (
              <React.Fragment key={month + "-sub"}>
                <th className="border text-center text-green-700">Occ</th>
                <th className="border text-center text-red-700">Emp</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {allDealers.map(dealer => (
            <React.Fragment key={dealer}>
              <tr>
                <td className="border p-2 sticky left-0 bg-white z-0 font-medium">
                  <span
                    className="px-2 py-1 rounded"
                    style={{
                      backgroundColor: dealerColors?.[dealer] || "#f0f0f0",
                      display: "inline-block"
                    }}
                  >
                    {dealer}
                  </span>
                </td>
                {visibleMonths.map(month => {
                  const stats = monthDealerMap[month]?.[dealer] || { Occupied: 0, Empty: 0 };
                  return (
                    <React.Fragment key={month}>
                      <td className="border p-2 text-center text-green-600">{stats.Occupied}</td>
                      <td className="border p-2 text-center text-red-600">{stats.Empty}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
              {expandedMonth === visibleMonths.find(m => m === expandedMonth) && (
                Object.entries(monthDateMap[expandedMonth] || {}).sort().map(([date, dealers]) => (
                  <tr key={dealer + date}>
                    <td className="border px-2 py-1 text-xs text-gray-500 sticky left-0 bg-white z-0">{date}</td>
                    {visibleMonths.map(month => {
                      if (month !== expandedMonth) return <td key={month} colSpan={2}></td>;
                      const s = dealers[dealer] || { Occupied: 0, Empty: 0 };
                      return (
                        <React.Fragment key={month + dealer + date}>
                          <td className="border px-1 py-1 text-center text-green-600">{s.Occupied}</td>
                          <td className="border px-1 py-1 text-center text-red-600">{s.Empty}</td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                ))
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationSummary;
