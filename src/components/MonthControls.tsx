'use client';

import React from 'react';
import { Month, MONTHS, MONTH_FULL_NAMES, MonthInspection } from '@/types/inspection';
import { formatDateForDisplay, getMonthAbbreviation } from '@/lib/dateUtils';

interface MonthControlsProps {
  monthsData: Record<Month, MonthInspection>;
  onToggleOk: (month: Month) => void;
  onToggleDef: (month: Month) => void;
  onTogglePercentage: (month: Month, percentage: 3 | 5 | 10) => void;
  onSetAllOk: () => void;
  onSetAllDef: () => void;
  onSetDef3Percent: () => void;
  onSetDef5Percent: () => void;
  onSetDef10Percent: () => void;
  onDateChange: (month: Month, date: string) => void;
  onMileageChange: (month: Month, mileage: string) => void;
  currentSignature: string;
  onSignMonth: (month: Month) => void;
  onUnsignMonth: (month: Month) => void;
}

export default function MonthControls({
  monthsData,
  onToggleOk,
  onToggleDef,
  onTogglePercentage,
  onSetAllOk,
  onSetAllDef,
  onSetDef3Percent,
  onSetDef5Percent,
  onSetDef10Percent,
  onDateChange,
  onMileageChange,
  currentSignature,
  onSignMonth,
  onUnsignMonth,
}: MonthControlsProps) {

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSetAllOk}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-medium"
          >
            ✓ Set All OK
          </button>
          <button
            type="button"
            onClick={onSetAllDef}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
          >
            ⚠ Set All DEF
          </button>
          <button
            type="button"
            onClick={onSetDef3Percent}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
          >
            🎲 Set DEF 3%
          </button>
          <button
            type="button"
            onClick={onSetDef5Percent}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
          >
            🎲 Set DEF 5%
          </button>
          <button
            type="button"
            onClick={onSetDef10Percent}
            className="px-4 py-2 bg-orange-700 text-white rounded-md hover:bg-orange-800 focus:outline-none focus:ring-2 focus:ring-orange-600 font-medium"
          >
            🎲 Set DEF 10%
          </button>
        </div>
      </div>

      {/* Month Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Month
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                OK
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                DEF
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                3%
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                5%
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                10%
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mileage
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Signed
              </th>
              <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {MONTHS.map((month, index) => {
              const data = monthsData[month];
              const isJanuary = month === 'JAN';
              const canSign = currentSignature && (data.ok || data.def) && !data.signature;

              // Get the actual calendar month from the date, or fall back to the fixed month name
              const displayMonth = data.date
                ? MONTH_FULL_NAMES[getMonthAbbreviation(data.date)]
                : MONTH_FULL_NAMES[month];

              return (
                <tr key={month} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-1 py-2 whitespace-nowrap text-sm">
                    <span className="font-medium text-gray-900">{displayMonth.slice(0, 3)}</span>
                    {isJanuary && (
                      <span className="ml-1 text-xs text-blue-600">*</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={data.ok}
                      onChange={() => onToggleOk(month)}
                      className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={data.def}
                      onChange={() => onToggleDef(month)}
                      className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-1 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={data.defPercentage === 3}
                      onChange={() => onTogglePercentage(month, 3)}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-400 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-1 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={data.defPercentage === 5}
                      onChange={() => onTogglePercentage(month, 5)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-1 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={data.defPercentage === 10}
                      onChange={() => onTogglePercentage(month, 10)}
                      className="h-4 w-4 text-orange-700 focus:ring-orange-600 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td className="px-1 py-2">
                    <input
                      type="date"
                      value={data.date}
                      onChange={(e) => onDateChange(month, e.target.value)}
                      className="block w-32 px-1 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-xs"
                      placeholder={isJanuary ? 'Enter first date' : 'Auto-calculated'}
                    />
                  </td>
                  <td className="px-1 py-2">
                    <input
                      type="text"
                      value={data.mileage}
                      onChange={(e) => onMileageChange(month, e.target.value)}
                      placeholder="e.g., 45000"
                      className="block w-24 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </td>
                  <td className="px-2 py-3 text-center">
                    {data.signature ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-2 py-3 text-center">
                    {data.signature ? (
                      <button
                        type="button"
                        onClick={() => onUnsignMonth(month)}
                        className="px-3 py-1 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Unsign
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSignMonth(month)}
                        disabled={!canSign}
                        className={`px-3 py-1 text-xs rounded-md ${
                          canSign
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Sign
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-green-500 rounded"></span>
          <span>OK = All items passed inspection</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-4 h-4 bg-yellow-500 rounded"></span>
          <span>DEF = Deficiency noted</span>
        </div>
      </div>
    </div>
  );
}
