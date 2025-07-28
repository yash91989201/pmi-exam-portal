import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { orpcClient } from '@/utils/orpc';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isRegistrationAllowed, setIsRegistrationAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch the current admin registration setting
    async function fetchAdminRegistrationSetting() {
      try {
        setIsLoading(true);
        const isAllowed = await orpcClient.adminSettings.getAllowRegistration();
        setIsRegistrationAllowed(isAllowed);
      } catch (error) {
        console.error('Failed to fetch admin registration setting:', error);
        toast.error('Failed to fetch admin settings');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdminRegistrationSetting();
  }, []);

  // Handle toggling the admin registration setting
  const handleToggleRegistration = async (checked: boolean) => {
    try {
      setIsLoading(true);
      await orpcClient.adminSettings.updateAllowRegistration({ value: checked });
      setIsRegistrationAllowed(checked);
      toast.success(`Admin registration ${checked ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update admin registration setting:', error);
      toast.error('Failed to update admin settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex items-center space-x-2">
        <Switch
          id="admin-registration-toggle"
          checked={isRegistrationAllowed}
          onCheckedChange={handleToggleRegistration}
          disabled={isLoading}
        />
        <Label htmlFor="admin-registration-toggle">Allow Admin Registration</Label>
      </div>
      {isLoading && <p className="text-muted-foreground mt-2">Updating...</p>}
    </div>
  );
}

