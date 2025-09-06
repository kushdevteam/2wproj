import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle, AlertCircle, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import Header from "@/components/header";

const registrationSchema = z.object({
  solanaAddress: z.string()
    .min(32, "Solana address must be at least 32 characters")
    .max(44, "Solana address must be at most 44 characters")
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const [isChecking, setIsChecking] = useState(false);
  const [addressAvailable, setAddressAvailable] = useState<boolean | null>(null);
  const { toast } = useToast();

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      solanaAddress: "",
    },
  });

  const watchedAddress = form.watch("solanaAddress");

  // Check address availability on input change
  const checkAddressMutation = useMutation({
    mutationFn: async (address: string) => {
      const res = await fetch(`/api/users/check-address/${address}`);
      if (!res.ok) throw new Error('Failed to check address');
      return res.json();
    },
    onSuccess: (data) => {
      setAddressAvailable(data.available);
      setIsChecking(false);
    },
    onError: () => {
      setAddressAvailable(null);
      setIsChecking(false);
    }
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const res = await apiRequest('POST', '/api/users/register', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful! 🎉",
        description: "Your account has been created. You can now start creating meme tokens!",
      });
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check address when it changes
  useEffect(() => {
    if (watchedAddress && watchedAddress.length >= 32) {
      setIsChecking(true);
      setAddressAvailable(null);
      const timeoutId = setTimeout(() => {
        checkAddressMutation.mutate(watchedAddress);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setAddressAvailable(null);
    }
  }, [watchedAddress, checkAddressMutation]);

  const onSubmit = (data: RegistrationFormData) => {
    if (!addressAvailable) {
      toast({
        title: "Address Unavailable",
        description: "This Solana address is already registered or invalid.",
        variant: "destructive",
      });
      return;
    }
    registerMutation.mutate(data);
  };

  const getAddressStatus = () => {
    if (!watchedAddress || watchedAddress.length < 32) return null;
    if (isChecking) return { icon: AlertCircle, color: "text-yellow-500", message: "Checking availability..." };
    if (addressAvailable === true) return { icon: CheckCircle, color: "text-green-500", message: "Address available" };
    if (addressAvailable === false) return { icon: AlertCircle, color: "text-red-500", message: "Address already registered" };
    return null;
  };

  const addressStatus = getAddressStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Create Your Account
          </h1>
          <p className="text-muted-foreground text-lg">
            Join DrawYourMeme with just your Solana address. No wallet connection required.
          </p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center">
              <Wallet className="mr-3 text-primary" size={24} />
              Safe Registration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>This is NOT a wallet drainer!</strong> We only collect your Solana address for identification. 
                No private keys, no wallet connection required. Your funds are completely safe.
              </AlertDescription>
            </Alert>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="solanaAddress" className="text-sm font-semibold text-foreground">
                  Solana Wallet Address <span className="text-destructive">*</span>
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="solanaAddress"
                    placeholder="e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                    {...form.register("solanaAddress")}
                    className="pr-10"
                    data-testid="input-solana-address"
                  />
                  {addressStatus && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <addressStatus.icon size={16} className={addressStatus.color} />
                    </div>
                  )}
                </div>
                {form.formState.errors.solanaAddress && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.solanaAddress.message}
                  </p>
                )}
                {addressStatus && (
                  <p className={`text-xs mt-1 ${addressStatus.color}`}>
                    {addressStatus.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your Solana wallet address. Only 1 address per account allowed.
                </p>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2">Why We Need This</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Unique identification without wallet connection</li>
                  <li>• Track your created meme tokens</li>
                  <li>• Prevent spam and duplicate accounts</li>
                  <li>• Future rewards and airdrops</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-white py-4 px-6 text-lg font-bold hover:scale-105 transition-all shadow-2xl"
                disabled={registerMutation.isPending || !addressAvailable || isChecking}
                data-testid="button-register"
              >
                {registerMutation.isPending ? (
                  <>Creating Account...</>
                ) : (
                  <>
                    <Shield className="mr-3" size={20} />
                    Create Safe Account
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline font-medium">
                  Sign in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}