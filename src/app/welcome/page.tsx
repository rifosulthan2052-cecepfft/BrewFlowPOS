
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CoffeeIcon } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

const welcomeFormSchema = z.object({
  fullName: z.string().min(1, 'Please enter your full name.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof welcomeFormSchema>;

export default function WelcomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(welcomeFormSchema),
    defaultValues: {
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleOnboardingSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ 
      password: values.password,
      data: { 
        full_name: values.fullName,
        password_set: true 
      } 
    });
    
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Setup Failed',
        description: error.message || "An unknown error occurred.",
      });
    } else {
      toast({
        title: 'Account Setup Complete!',
        description: 'Welcome aboard! You will be redirected shortly.',
      });
      // The middleware will handle the redirect after router.refresh()
      router.refresh();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-sm mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <CoffeeIcon className="h-8 w-8 text-primary" />
              <div className="flex flex-col items-start -space-y-1">
                <span className="text-2xl font-bold text-primary">BrewFlow</span>
                <span className="text-xs text-muted-foreground font-medium">by Sakato</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome!</CardTitle>
            <CardDescription>Let's get your account set up. Please choose a name and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleOnboardingSubmit)} className="grid gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Jane Doe"
                          required
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          required
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          required
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting || !user}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save and Continue
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
