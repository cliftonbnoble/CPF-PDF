'use client';

import React from 'react';
import { VehicleInfo, FLEET_VEHICLES } from '@/types/inspection';

interface VehicleInfoFormProps {
  vehicle: VehicleInfo;
  onChange: (vehicle: VehicleInfo) => void;
}

export default function VehicleInfoForm({ vehicle, onChange }: VehicleInfoFormProps) {
  const handleChange = (field: keyof VehicleInfo) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onChange({
      ...vehicle,
      [field]: e.target.value,
    });
  };

  const handleVehicleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUnit = e.target.value;
    if (!selectedUnit) {
      onChange({
        ...vehicle,
        unitNumber: '',
        year: '',
        make: '',
        licenseNumber: '',
        hasAirBrakes: false,
      });
      return;
    }

    const selectedVehicle = FLEET_VEHICLES.find(v => v.unitNumber === selectedUnit);
    if (selectedVehicle) {
      onChange({
        ...vehicle,
        unitNumber: selectedVehicle.unitNumber,
        year: selectedVehicle.year,
        make: `${selectedVehicle.make} ${selectedVehicle.model}`,
        licenseNumber: selectedVehicle.licenseNumber,
        hasAirBrakes: selectedVehicle.hasAirBrakes,
      });
    }
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
            value="California Charter Bus & Tours"
            readOnly
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit Number
          </label>
          <select
            value={vehicle.unitNumber}
            onChange={handleVehicleSelect}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a vehicle...</option>
            {FLEET_VEHICLES.map((v) => (
              <option key={v.unitNumber} value={v.unitNumber}>
                {v.unitNumber}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <input
            type="text"
            value={vehicle.year}
            readOnly
            placeholder="Auto-filled"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Make/Model
          </label>
          <input
            type="text"
            value={vehicle.make}
            readOnly
            placeholder="Auto-filled"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number
          </label>
          <input
            type="text"
            value={vehicle.licenseNumber}
            readOnly
            placeholder="Auto-filled"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Air Brakes
          </label>
          <div className="flex items-center h-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100">
            <span className={`text-sm font-semibold ${vehicle.hasAirBrakes ? 'text-green-700' : 'text-gray-500'}`}>
              {vehicle.hasAirBrakes ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
