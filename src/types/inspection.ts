// Types for CHP 108A Bus Maintenance & Safety Inspection Form

export type Month = 'JAN' | 'FEB' | 'MAR' | 'APR' | 'MAY' | 'JUN' | 'JUL' | 'AUG' | 'SEP' | 'OCT' | 'NOV' | 'DEC';

export const MONTHS: Month[] = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export const MONTH_FULL_NAMES: Record<Month, string> = {
  JAN: 'January',
  FEB: 'February',
  MAR: 'March',
  APR: 'April',
  MAY: 'May',
  JUN: 'June',
  JUL: 'July',
  AUG: 'August',
  SEP: 'September',
  OCT: 'October',
  NOV: 'November',
  DEC: 'December',
};

export interface MonthInspection {
  ok: boolean;
  def: boolean;
  date: string; // ISO date string
  mileage: string;
  signature: string; // Base64 PNG or empty
}

export interface VehicleInfo {
  carrierName: string;
  unitNumber: string;
  year: string;
  make: string;
  licenseNumber: string;
  hasAirBrakes: boolean;
}

export interface InspectionFormData {
  vehicle: VehicleInfo;
  months: Record<Month, MonthInspection>;
}

// Vehicle fleet data
export interface FleetVehicle {
  unitNumber: string;
  licenseNumber: string;
  make: string;
  model: string;
  hasAirBrakes: boolean;
  year: string;
}

export const FLEET_VEHICLES: FleetVehicle[] = [
  { unitNumber: 'Sprinter 5', licenseNumber: '52295R3', make: 'Merz', model: '3500', hasAirBrakes: false, year: '2023' },
  { unitNumber: 'Sprinter 6', licenseNumber: '52293R3', make: 'Merz', model: '3500', hasAirBrakes: false, year: '2023' },
  { unitNumber: 'Tiffany 6', licenseNumber: '96689D2', make: 'Ford', model: 'F-750', hasAirBrakes: true, year: '2012' },
  { unitNumber: 'Tiffany 8', licenseNumber: '15191D2', make: 'Ford', model: 'E-450', hasAirBrakes: false, year: '2017' },
  { unitNumber: 'Tiffany 9', licenseNumber: '14709D2', make: 'Ford', model: 'F-650', hasAirBrakes: false, year: '2015' },
  { unitNumber: 'Tiffany 10', licenseNumber: '87355G2', make: 'Ford', model: 'E-450', hasAirBrakes: false, year: '2017' },
  { unitNumber: 'Tiffany 11', licenseNumber: '26513P2', make: 'Ford', model: 'F-550', hasAirBrakes: false, year: '2017' },
  { unitNumber: 'Tiffany 12', licenseNumber: '26512P2', make: 'Ford', model: 'F-550', hasAirBrakes: false, year: '2017' },
  { unitNumber: 'Tiffany 14', licenseNumber: '26810P2', make: 'Ford', model: 'F-550', hasAirBrakes: false, year: '2018' },
  { unitNumber: 'Tiffany 15', licenseNumber: '32612W2', make: 'Ford', model: 'E-450', hasAirBrakes: false, year: '2019' },
  { unitNumber: 'Tiffany 16', licenseNumber: '18533B3', make: 'Ford', model: 'F-750', hasAirBrakes: true, year: '2015' },
  { unitNumber: 'Tiffany 17', licenseNumber: '14343G3', make: 'Ford', model: 'F-650', hasAirBrakes: true, year: '2016' },
  { unitNumber: 'Tiffany 18', licenseNumber: '53825P3', make: 'Ford', model: 'F-650', hasAirBrakes: true, year: '2016' },
  { unitNumber: 'Tiffany 20', licenseNumber: '53740G4', make: 'Freightliner', model: 'M2', hasAirBrakes: true, year: '2020' },
];

// Air brake related inspection items (0-indexed) - inactive when hasAirBrakes = false
export const AIR_BRAKE_ITEMS = [22, 23, 24, 25, 26, 31] as const; // Items 23, 24, 25, 26, 27, 32

// Hydraulic brake related inspection items (0-indexed) - inactive when hasAirBrakes = true
export const HYDRAULIC_BRAKE_ITEMS = [19, 20] as const; // Items 20, 21

// The 40 inspection items from CHP 108A Page 1
export const INSPECTION_ITEMS = [
  'Fire extinguisher, first aid kit, and reflective warning devices',
  'Horn, defroster, gauges, odometer, and speedometer',
  'Driver seat, passenger seats, padding, interior, and floor condition',
  'Windshield wipers, windows, mirrors, and supports',
  'All interior and exterior lights, signals, reflectors',
  'Electrical wiring-condition and protection',
  'Batteries-water level, terminals, and cables',
  'Warning devices-air, oil, temperature, exit, and/or vacuum',
  'Heaters, defrosters, switches, and vents',
  'Doors, exterior, paint, and marking',
  'Radiator and water hoses-coolant level, condition, and/or leaks',
  'Belts-compressor, fan, water, and/or alternator',
  'Air hoses and tubing-leaks, condition, and/or protection',
  'Fuel system-tank, hoses, tubing, and/or pump-leaks',
  'Exhaust system, manifolds, piping, muffler-leaks and/or condition',
  'Engine-mounting, excessive grease and/or oil',
  'Clutch adjustment-free play',
  'Air filter, throttle linkage',
  'Starting and charging system',
  'Hydraulic brake system-adjustment, components, and/or condition',
  'Hydraulic master cylinder-level, leaks, and/or condition',
  'Hoses and tubing-condition, protection',
  'Air brake system-adjustment, compartments, and/or condition',
  '1 minute air or vacuum loss test',
  'Air compressor governor-cut in and cut out pressure (85-130)',
  'Primary air tank-drain and test function of check valve',
  'Other air tanks-drain and check for contamination',
  'Tires-tread depth, inflation, condition',
  'Wheels, lug nuts, and studs-cracks, looseness, and/or condition',
  'Parking brake-able to hold the vehicle',
  'Emergency stopping system-labeled, operative',
  'Brakes do not release after complete loss of service air',
  'Steering system-mounting, free lash and components',
  'Steering arms, drag links, and/or tie rod ends',
  'Suspension system-springs, shackles, u-bolts, and/or torque rods',
  'Frame and cross members-cracks and/or condition',
  'Drive shaft, universal joints, and/or guards',
  'Transmission and differential-mounting, leaks, and/or condition',
  'Wheel seals-leaks and/or condition',
  'Under carriage-clean and secure',
] as const;

// Items marked with * meet minimum requirements of 34505 CVC
export const CVC_REQUIRED_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] as const;

// Initialize empty form data
export function createEmptyFormData(): InspectionFormData {
  const months: Record<Month, MonthInspection> = {} as Record<Month, MonthInspection>;
  
  for (const month of MONTHS) {
    months[month] = {
      ok: false,
      def: false,
      date: '',
      mileage: '',
      signature: '',
    };
  }

  return {
    vehicle: {
      carrierName: 'California Charter Bus & Tours',
      unitNumber: '',
      year: '',
      make: '',
      licenseNumber: '',
      hasAirBrakes: false,
    },
    months,
  };
}
