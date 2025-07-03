
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

const AllocationSummary = ({ fullData }) => {
  const dealerColors = fullData?.dealerColors || {};
  const rawData = fullData?.schedule || [];
  const transformed = transformData(rawData);

  const allMonths = Array.from(
    new Set(
      transformed
        .filter(d => new Date(d.forecastProductionDate).getFullYear() === 2025)
        .map(d => {
          const dt = new Date(d.forecastProductionDate);
          return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
        })
    )
  ).sort();

  const [selectedMonths, setSelectedMonths] = useState(allMonths);
  const [expandedMonths, setExpandedMonths] = useState([]);

  const toggleSelectedMonth = (month) => {
    setSelectedMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const toggleExpandMonth = (month) => {
    setExpandedMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  const data2025 = transformed.filter(d => {
    const dt = new Date(d.forecastProductionDate);
    const ym = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    return dt.getFullYear() === 2025 && selectedMonths.includes(ym);
  });

  const allDealers = Array.from(new Set(data2025.map(d => d.dealer))).sort();

  const monthDealerStats = {};
  const monthDateDealerStats = {};

  data2025.forEach(item => {
    const dt = new Date(item.forecastProductionDate);
    const month = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    const date = item.forecastProductionDate;
    const dealer = item.dealer || "Unknown";
    const status = item.chassisNo ? "Occupied" : "Empty";

    if (!monthDealerStats[month]) monthDealerStats[month] = {};
    if (!monthDealerStats[month][dealer]) monthDealerStats[month][dealer] = { Occupied: 0, Empty: 0 };
    monthDealerStats[month][dealer][status]++;

    if (!monthDateDealerStats[month]) monthDateDealerStats[month] = {};
    if (!monthDateDealerStats[month][date]) monthDateDealerStats[month][date] = {};
    if (!monthDateDealerStats[month][date][dealer]) monthDateDealerStats[month][date][dealer] = { Occupied: 0, Empty: 0 };
    monthDateDealerStats[month][date][dealer][status]++;
  });

  return (
    <div className="p-4 overflow-auto">
      <h2 className="text-xl font-semibold mb-4">Allocation Summary (2025)</h2>

      <div className="mb-4 flex flex-wrap gap-4">
        {allMonths.map(month => (
          <label key={month} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedMonths.includes(month)}
              onChange={() => toggleSelectedMonth(month)}
            />
            <span>{month}</span>
          </label>
        ))}
      </div>

      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2 bg-gray-100 sticky left-0 z-10">Dealer</th>
            {selectedMonths.map(month => (
              <React.Fragment key={month}>
                <th className="border p-2 bg-gray-100 text-center cursor-pointer" onClick={() => toggleExpandMonth(month)}>
                  Occ {month} {expandedMonths.includes(month) ? "▲" : "▼"}
                </th>
                <th className="border p-2 bg-gray-100 text-center">Emp {month}</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {allDealers.map(dealer => (
            <React.Fragment key={dealer}>
              <tr>
                <td className="border p-2 sticky left-0 bg-white z-0 font-medium">
                  <span className="px-2 py-1 rounded" style={{ backgroundColor: dealerColors?.[dealer] || "#f0f0f0" }}>
                    {dealer}
                  </span>
                </td>
                {selectedMonths.map(month => {
                  const s = monthDealerStats[month]?.[dealer] || { Occupied: 0, Empty: 0 };
                  return (
                    <React.Fragment key={month}>
                      <td className="border p-2 text-green-600 text-center">{s.Occupied}</td>
                      <td className="border p-2 text-red-600 text-center">{s.Empty}</td>
                    </React.Fragment>
                  );
                })}
              </tr>
              {expandedMonths.includes(month => true) &&
                expandedMonths.map(month =>
                  Object.entries(monthDateDealerStats[month] || {}).sort().map(([date, dealerMap]) => {
                    const stats = dealerMap[dealer];
                    if (!stats) return null;
                    return (
                      <tr key={date + dealer}>
                        <td className="border px-2 py-1 sticky left-0 bg-gray-50 text-xs">{date}</td>
                        {selectedMonths.map(m => {
                          if (m !== month) return [<td key={m + "-occ"}></td>, <td key={m + "-emp"}></td>];
                          return [
                            <td key={m + "-occ"} className="border p-1 text-green-600 text-xs text-center">{stats.Occupied}</td>,
                            <td key={m + "-emp"} className="border p-1 text-red-600 text-xs text-center">{stats.Empty}</td>
                          ];
                        })}
                      </tr>
                    );
                  })
                )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AllocationSummary;
