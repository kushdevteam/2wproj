import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, Shield, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import Header from "@/components/header";

const loginSchema = z.object({
  solanaAddress: z.string()
    .min(32, "Solana address must be at least 32 characters")
    .max(44, "Solana address must be at most 44 characters")
    .regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      solanaAddress: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const res = await apiRequest('POST', '/api/users/login', data);
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome Back! 👋",
        description: "Successfully signed in to your account.",
      });
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      setLocation('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Sign In Failed",
        description: error.message === "User not found" 
          ? "No account found with this Solana address. Please register first."
          : error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="text-white" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-lg">
            Sign in with your Solana address to continue creating meme tokens.
          </p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center">
              <Shield className="mr-3 text-primary" size={24} />
              Secure Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Enter the same Solana address you used during registration. No wallet connection required.
              </AlertDescription>
            </Alert>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="solanaAddress" className="text-sm font-semibold text-foreground">
                  Your Solana Wallet Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="solanaAddress"
                  placeholder="e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
                  {...form.register("solanaAddress")}
                  className="mt-2"
                  data-testid="input-solana-address-login"
                />
                {form.formState.errors.solanaAddress && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.solanaAddress.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  The same address you used to register your account.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-white py-4 px-6 text-lg font-bold hover:scale-105 transition-all shadow-2xl"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  <>Signing In...</>
                ) : (
                  <>
                    <LogIn className="mr-3" size={20} />
                    Sign In Safely
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </div>

              <div className="bg-muted rounded-xl p-4">
                <h4 className="font-semibold text-foreground mb-2">Safe & Secure</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• No private keys needed</li>
                  <li>• No wallet connection required</li>
                  <li>• Your funds remain completely safe</li>
                  <li>• Just address-based identification</li>
                </ul>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}