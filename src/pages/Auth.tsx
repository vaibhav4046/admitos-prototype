import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function Auth() {
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock auth, redirect to onboarding
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-calm-surface-2 flex flex-col items-center justify-center p-4 font-sans relative">
      <Button 
        variant="ghost" 
        className="absolute top-4 left-4 gap-2 text-calm-text-muted hover:text-calm-text"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Button>

      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-calm-primary text-white p-2 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-tight">AdmitOS.ai</span>
          </button>
        </div>
        
        <Card className="border-calm-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your details to start your admissions journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Alex Chen" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="alex@example.com" required />
              </div>
              <Button type="submit" className="w-full h-11 text-base">
                Continue
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-center text-sm text-calm-text-muted">
            <div>
              Already have an account? <button onClick={() => navigate('/dashboard')} className="text-calm-text underline underline-offset-4 hover:text-calm-text-muted">Sign in</button>
            </div>
            <div className="text-xs leading-relaxed">
              By continuing, you agree to our{" "}
              <Link to="/terms" className="text-calm-text underline underline-offset-4 hover:text-calm-text-muted">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-calm-text underline underline-offset-4 hover:text-calm-text-muted">
                Privacy Policy
              </Link>
              .
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
