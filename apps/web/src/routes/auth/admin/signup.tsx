import { createFileRoute, redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { orpcClient } from '@/utils/orpc';
import { AuthCard, AuthCardContent, AuthCardFooter, AuthCardHeader } from '@/components/auth-card';
import { Button } from '@/components/ui/button';
import { SignUpForm } from '@/components/auth/signup-form';
import { toast } from 'sonner';

export const Route = createFileRoute('/auth/admin/signup')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistrationAllowed, setIsRegistrationAllowed] = useState(false);

  useEffect(() => {
    // Check if admin registration is allowed
    async function checkAdminRegistration() {
      try {
        setIsLoading(true);
        const isAllowed = await orpcClient.adminSettings.getAllowRegistration();
        setIsRegistrationAllowed(isAllowed);
        
        // If not allowed, show error toast and redirect to login
        if (!isAllowed) {
          toast.error('Admin registration is currently disabled');
          throw redirect({ to: '/auth/admin/login' });
        }
      } catch (error) {
        console.error('Failed to check admin registration permission:', error);
        if (!(error instanceof redirect)) {
          toast.error('Something went wrong');
          throw redirect({ to: '/auth/admin/login' });
        }
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminRegistration();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Checking registration permission...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <AuthCard className="mx-auto max-w-[350px]">
        <AuthCardHeader
          heading="Create an admin account"
          description="Enter your information below to create your admin account"
        />
        <AuthCardContent>
          <SignUpForm adminSignup={true} />
        </AuthCardContent>
        <AuthCardFooter
          description="Already have an account?"
          linkText="Sign in"
          linkHref="/auth/admin/login"
        />
      </AuthCard>
    </div>
  );
}
