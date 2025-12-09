import { useState, useEffect } from 'react';
import { AlertSettings } from '../types';
import { settingsAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Settings, Save } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function SettingsView() {
  const [settings, setSettings] = useState<AlertSettings>({
    lowStockThreshold: 3,
    borrowingPeriodDays: 14,
    finePerDay: 1
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await settingsAPI.get();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    const defaultSettings: AlertSettings = {
      lowStockThreshold: 3,
      borrowingPeriodDays: 14,
      finePerDay: 1
    };
    setSettings(defaultSettings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2">Settings</h2>
        <p className="text-gray-600">Configure library system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Settings className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Library Settings</CardTitle>
                  <CardDescription>Manage system-wide configurations</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="mb-4">Inventory Alerts</h4>
                    <div className="space-y-2">
                      <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        min="0"
                        value={settings.lowStockThreshold}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            lowStockThreshold: parseInt(e.target.value) || 0
                          })
                        }
                      />
                      <p className="text-sm text-gray-500">
                        Alert when available copies fall to or below this number
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4">Borrowing Rules</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="borrowingPeriodDays">Borrowing Period (Days)</Label>
                        <Input
                          id="borrowingPeriodDays"
                          type="number"
                          min="1"
                          value={settings.borrowingPeriodDays}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              borrowingPeriodDays: parseInt(e.target.value) || 1
                            })
                          }
                        />
                        <p className="text-sm text-gray-500">
                          Default number of days a book can be borrowed
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="finePerDay">Fine Per Day ($)</Label>
                        <Input
                          id="finePerDay"
                          type="number"
                          min="0"
                          step="0.01"
                          value={settings.finePerDay}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              finePerDay: parseFloat(e.target.value) || 0
                            })
                          }
                        />
                        <p className="text-sm text-gray-500">
                          Fine charged per day for overdue books
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1" disabled={isSaving}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset}>
                    Reset to Defaults
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Current Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Low Stock Alert</p>
                <p className="text-lg">≤ {settings.lowStockThreshold} copies</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Borrowing Period</p>
                <p className="text-lg">{settings.borrowingPeriodDays} days</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Overdue Fine</p>
                <p className="text-lg">${settings.finePerDay.toFixed(2)}/day</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h4 className="text-blue-900">Settings Information</h4>
                <p className="text-sm text-blue-800">
                  Changes to these settings take effect immediately and apply to all new transactions.
                  Existing borrows will retain their original due dates.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}