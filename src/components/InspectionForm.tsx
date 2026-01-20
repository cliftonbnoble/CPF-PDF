'use client';

import React, { useState, useCallback } from 'react';
import {
  InspectionFormData,
  Month,
  MONTHS,
  createEmptyFormData,
} from '@/types/inspection';
import { calculateInspectionDates } from '@/lib/dateUtils';
import { generatePDF } from '@/lib/pdfGenerator';
import VehicleInfoForm from '@/components/VehicleInfoForm';
import MonthControls from '@/components/MonthControls';
import SignaturePad from '@/components/SignaturePad';

export default function InspectionForm() {
  const [formData, setFormData] = useState<InspectionFormData>(createEmptyFormData);
  const [currentSignature, setCurrentSignature] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Show notification
  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 5000);
    },
    []
  );

  // Handle vehicle info change
  const handleVehicleChange = useCallback(
    (vehicle: InspectionFormData['vehicle']) => {
      setFormData((prev) => ({ ...prev, vehicle }));
    },
    []
  );

  // Toggle OK for a month
  const handleToggleOk = useCallback((month: Month) => {
    setFormData((prev) => ({
      ...prev,
      months: {
        ...prev.months,
        [month]: {
          ...prev.months[month],
          ok: !prev.months[month].ok,
          def: false, // Uncheck DEF if OK is checked
        },
      },
    }));
  }, []);

  // Toggle DEF for a month
  const handleToggleDef = useCallback((month: Month) => {
    setFormData((prev) => ({
      ...prev,
      months: {
        ...prev.months,
        [month]: {
          ...prev.months[month],
          def: !prev.months[month].def,
          ok: false, // Uncheck OK if DEF is checked
        },
      },
    }));
  }, []);

  // Set all months to OK
  const handleSetAllOk = useCallback(() => {
    setFormData((prev) => {
      const newMonths = { ...prev.months };
      for (const month of MONTHS) {
        newMonths[month] = {
          ...newMonths[month],
          ok: true,
          def: false,
        };
      }
      return { ...prev, months: newMonths };
    });
    showNotification('success', 'All months set to OK');
  }, [showNotification]);

  // Set all months to DEF
  const handleSetAllDef = useCallback(() => {
    setFormData((prev) => {
      const newMonths = { ...prev.months };
      for (const month of MONTHS) {
        newMonths[month] = {
          ...newMonths[month],
          ok: false,
          def: true,
        };
      }
      return { ...prev, months: newMonths };
    });
    showNotification('info', 'All months set to DEF');
  }, [showNotification]);

  // Handle date change - auto-calculate from January, allow manual edits for all months
  const handleDateChange = useCallback(
    (month: Month, date: string) => {
      if (month === 'JAN') {
        // Calculate all subsequent dates (+45 days each) when January changes
        const calculatedDates = calculateInspectionDates(date);

        setFormData((prev) => {
          const newMonths = { ...prev.months };
          for (const m of MONTHS) {
            newMonths[m] = {
              ...newMonths[m],
              date: calculatedDates[m],
            };
          }
          return { ...prev, months: newMonths };
        });

        if (date) {
          showNotification(
            'info',
            `Dates auto-calculated: Each month +45 days from January`
          );
        }
      } else {
        // Allow manual override for any month
        setFormData((prev) => ({
          ...prev,
          months: {
            ...prev.months,
            [month]: {
              ...prev.months[month],
              date,
            },
          },
        }));
      }
    },
    [showNotification]
  );

  // Handle mileage change
  const handleMileageChange = useCallback((month: Month, mileage: string) => {
    setFormData((prev) => ({
      ...prev,
      months: {
        ...prev.months,
        [month]: {
          ...prev.months[month],
          mileage,
        },
      },
    }));
  }, []);

  // Handle signature capture
  const handleSignature = useCallback((dataUrl: string) => {
    setCurrentSignature(dataUrl);
  }, []);

  // Clear signature
  const handleClearSignature = useCallback(() => {
    setCurrentSignature('');
  }, []);

  // Sign a specific month
  const handleSignMonth = useCallback(
    (month: Month) => {
      if (!currentSignature) {
        showNotification('error', 'Please add your signature first');
        return;
      }

      setFormData((prev) => ({
        ...prev,
        months: {
          ...prev.months,
          [month]: {
            ...prev.months[month],
            signature: currentSignature,
          },
        },
      }));
      showNotification('success', `${month} signed successfully`);
    },
    [currentSignature, showNotification]
  );

  // Sign all months that have OK or DEF checked
  const handleSignAll = useCallback(() => {
    if (!currentSignature) {
      showNotification('error', 'Please add your signature first');
      return;
    }

    let signedCount = 0;
    setFormData((prev) => {
      const newMonths = { ...prev.months };
      for (const month of MONTHS) {
        if (
          (newMonths[month].ok || newMonths[month].def) &&
          !newMonths[month].signature
        ) {
          newMonths[month] = {
            ...newMonths[month],
            signature: currentSignature,
          };
          signedCount++;
        }
      }
      return { ...prev, months: newMonths };
    });

    if (signedCount > 0) {
      showNotification('success', `Signed ${signedCount} month(s) successfully`);
    } else {
      showNotification('info', 'No months to sign (all already signed or no OK/DEF checked)');
    }
  }, [currentSignature, showNotification]);

  // Unsign a specific month
  const handleUnsignMonth = useCallback(
    (month: Month) => {
      setFormData((prev) => ({
        ...prev,
        months: {
          ...prev.months,
          [month]: {
            ...prev.months[month],
            signature: '',
          },
        },
      }));
      showNotification('info', `${month} unsigned successfully`);
    },
    [showNotification]
  );

  // Generate and download PDF
  const handleGeneratePDF = useCallback(async () => {
    setIsGenerating(true);
    try {
      const pdfBytes = await generatePDF(formData);
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `CHP108A_${formData.vehicle.unitNumber || 'inspection'}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      showNotification('success', 'PDF generated and downloaded!');
    } catch (error) {
      console.error('PDF generation error:', error);
      showNotification('error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [formData, showNotification]);

  // Reset form
  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the form? All data will be lost.')) {
      setFormData(createEmptyFormData());
      setCurrentSignature('');
      showNotification('info', 'Form has been reset');
    }
  }, [showNotification]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">CHP 108A Inspector</h1>
          <p className="text-blue-200 text-sm mt-1">
            Bus Maintenance & Safety Inspection Form Automation
          </p>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : notification.type === 'error'
              ? 'bg-red-500 text-white'
              : 'bg-blue-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Instructions Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              📋 How to Use
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Enter vehicle information</li>
              <li>
                Use &quot;Set All OK&quot; or &quot;Set All DEF&quot; to quickly mark all months
              </li>
              <li>
                Enter the <strong>January inspection date</strong> - subsequent months
                will auto-calculate (+45 days each)
              </li>
              <li>
                <strong>Edit any date or mileage</strong> as needed - all fields are editable
              </li>
              <li>Draw your signature in the signature pad</li>
              <li>
                Click &quot;Sign All&quot; to apply signature to all months with OK/DEF checked, or sign
                individual months
              </li>
              <li>
                Use &quot;Unsign&quot; button to remove a signature from any month if needed
              </li>
              <li>Generate and download the filled PDF with your current data</li>
            </ol>
          </div>

          {/* Vehicle Info Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <VehicleInfoForm
              vehicle={formData.vehicle}
              onChange={handleVehicleChange}
            />
          </div>

          {/* Month Controls Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Monthly Inspection Status
            </h2>
            <MonthControls
              monthsData={formData.months}
              onToggleOk={handleToggleOk}
              onToggleDef={handleToggleDef}
              onSetAllOk={handleSetAllOk}
              onSetAllDef={handleSetAllDef}
              onDateChange={handleDateChange}
              onMileageChange={handleMileageChange}
              currentSignature={currentSignature}
              onSignMonth={handleSignMonth}
              onSignAll={handleSignAll}
              onUnsignMonth={handleUnsignMonth}
            />
          </div>

          {/* Signature Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <SignaturePad
              onSignature={handleSignature}
              currentSignature={currentSignature}
              onClear={handleClearSignature}
            />
          </div>

          {/* Actions Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className={`px-6 py-3 rounded-lg font-semibold text-white shadow-md ${
                  isGenerating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⏳</span>
                    Generating...
                  </>
                ) : (
                  '📄 Generate & Download PDF'
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 shadow-md"
              >
                🔄 Reset Form
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center text-sm text-gray-500 py-4">
            <p>
              This tool generates a CHP 108A compliant inspection form.
              <br />
              Form reference:{' '}
              <a
                href="https://www.chp.ca.gov/siteassets/forms/b-chp108a-1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Official CHP 108A Form
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
