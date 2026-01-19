'use client';

import React from 'react';
import { VehicleInfo } from '@/types/inspection';

interface VehicleInfoFormProps {
  vehicle: VehicleInfo;
  onChange: (vehicle: VehicleInfo) => void;
}

export default function VehicleInfoForm({ vehicle, onChange }: VehicleInfoFormProps) {
  const handleChange = (field: keyof VehicleInfo) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange({
      ...vehicle,
      [field]: e.target.value,
    });
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Vehicle Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Carrier Name
          </label>
          <input
            type="text"
            value={vehicle.carrierName}
            onChange={handleChange('carrierName')}
            placeholder="e.g., ABC Transit Co."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Number
          </label>
          <input
            type="text"
            value={vehicle.unitNumber}
            onChange={handleChange('unitNumber')}
            placeholder="e.g., BUS-001"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="text"
            value={vehicle.year}
            onChange={handleChange('year')}
            placeholder="e.g., 2023"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make
          </label>
          <input
            type="text"
            value={vehicle.make}
            onChange={handleChange('make')}
            placeholder="e.g., Blue Bird"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number
          </label>
          <input
            type="text"
            value={vehicle.licenseNumber}
            onChange={handleChange('licenseNumber')}
            placeholder="e.g., 1ABC234"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
