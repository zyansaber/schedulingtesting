
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
  const [expandedMonths, setExpandedMonths] = useState([]);
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

  const toggleExpand = (month) => {
    setExpandedMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const toggleVisible = (month) => {
    setVisibleMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
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
                onChange={() => toggleVisible(month)}
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
              <th key={month} className="border p-2 bg-gray-100 text-center min-w-40">
                {month}
                <div>
                  <button
                    onClick={() => toggleExpand(month)}
                    className="text-xs text-blue-600 underline"
                  >
                    {expandedMonths.includes(month) ? "Collapse" : "Expand"}
                  </button>
                </div>
              </th>
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
                    <td key={month} className="border p-2 text-center">
                      <div className="text-green-600">Occ: {stats.Occupied}</div>
                      <div className="text-red-600">Emp: {stats.Empty}</div>
                    </td>
                  );
                })}
              </tr>

              {visibleMonths.map(month =>
                expandedMonths.includes(month) ? (
                  <tr key={month + "-" + dealer + "-expand"}>
                    <td className="border p-2 bg-gray-50 italic text-right pr-4">
                      <span className="text-xs text-gray-600">Details for {month}</span>
                    </td>
                    <td colSpan={visibleMonths.length} className="border p-2">
                      <div className="overflow-x-auto">
                        <table className="text-xs border table-auto w-full">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="border px-1 py-1 text-left">Date</th>
                              <th className="border px-1 py-1 text-green-700">Occ</th>
                              <th className="border px-1 py-1 text-red-700">Emp</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(monthDateMap[month] || {})
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([date, dealers]) => {
                                const s = dealers[dealer] || { Occupied: 0, Empty: 0 };
                                return (
                                  <tr key={date}>
                                    <td className="border px-1 py-1">{date}</td>
                                    <td className="border px-1 py-1 text-green-600 text-center">{s.Occupied}</td>
                                    <td className="border px-1 py-1 text-red-600 text-center">{s.Empty}</td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                ) : null
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationSummary;
