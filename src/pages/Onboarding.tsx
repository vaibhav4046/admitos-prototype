import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else navigate('/dashboard');
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-calm-surface-2 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <Progress value={(step / totalSteps) * 100} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-calm-text-muted font-medium uppercase tracking-wider">
            <span>Step {step} of {totalSteps}</span>
            <span>Profile Setup</span>
          </div>
        </div>

        <Card className="border-calm-border shadow-md overflow-hidden">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Current Age</Label>
                      <Input type="number" placeholder="16" />
                    </div>
                    <div className="space-y-2">
                      <Label>School Year</Label>
                      <Input placeholder="Year 12 / Grade 11" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Curriculum</Label>
                    <select className="flex h-10 w-full rounded-md border border-calm-border bg-calm-surface px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950">
                      <option>A-Levels</option>
                      <option>IB Diploma</option>
                      <option>AP / US High School</option>
                      <option>Other</option>
                    </select>
                  </div>
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Academic Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current/Predicted Grades</Label>
                    <Input placeholder="e.g. A*AA or 38 IB points" />
                  </div>
                  <div className="space-y-2">
                    <Label>Standardised Tests (if any)</Label>
                    <Input placeholder="e.g. SAT 1450, ACT 32" />
                  </div>
                  <div className="space-y-2">
                    <Label>Intended Major / Course</Label>
                    <Input placeholder="e.g. Computer Science, Economics" />
                  </div>
                </CardContent>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">Extracurriculars & Interests</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Top 3 Activities or Awards</Label>
                    <Textarea placeholder="1. Debate Team Captain&#10;2. Gold in Math Olympiad&#10;3. Volunteer at local shelter" className="h-32" />
                  </div>
                  <div className="space-y-2">
                    <Label>Personal Interests</Label>
                    <Input placeholder="e.g. AI, Climate Tech, History" />
                  </div>
                </CardContent>
              </>
            )}

            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle className="text-2xl">University Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target Countries</Label>
                    <div className="flex gap-2 flex-wrap">
                      {['UK', 'US', 'Europe', 'Canada', 'Australia'].map(c => (
                        <label key={c} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-calm-surface-2">
                          <input type="checkbox" className="rounded border-calm-border" />
                          <span className="text-sm font-medium">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred University Style</Label>
                    <select className="flex h-10 w-full rounded-md border border-calm-border bg-calm-surface px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950">
                      <option>Campus / Collegiate</option>
                      <option>City / Urban</option>
                      <option>No Preference</option>
                    </select>
                  </div>
                </CardContent>
              </>
            )}

            <CardFooter className="flex justify-between pt-6 border-t border-calm-border">
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                Back
              </Button>
              <Button onClick={handleNext}>
                {step === totalSteps ? 'Complete Profile' : 'Continue'}
              </Button>
            </CardFooter>
          </motion.div>
        </Card>
      </div>
    </div>
  );
}
