import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, UploadCloud, Monitor, HardDrive, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Settings() {
  return (
    <div className="max-w-4xl mx-auto w-full pt-12 pb-24 px-6 space-y-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-calm-text mb-2">Candidacy Evaluation Form</h1>
        <p className="text-calm-text-muted text-lg">Please fill out and update your profile information below.</p>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {/* Student Information */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-8 shadow-sm">
          <div className="mb-6 border-b border-calm-border pb-4">
            <h2 className="text-xl font-medium text-calm-text">Student Information</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Student First Name *</Label>
                <Input required className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Student Last Name *</Label>
                <Input required className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Student Preferred Name</Label>
                <Input placeholder="N/A" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
                <p className="text-xs text-calm-text-muted">If you have a preferred name, then please write it here.</p>
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Student Date of Birth *</Label>
                <div className="flex gap-3">
                  <select required className="w-1/3 h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                  </select>
                  <select required className="w-1/3 h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                    <option value="">Month</option>
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select required className="w-1/3 h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                    <option value="">Year</option>
                    {Array.from({ length: 30 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return <option key={year} value={year}>{year}</option>;
                    })}
                  </select>
                </div>
                <p className="text-xs text-calm-text-muted">(Day Month Year Format)</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">School *</Label>
                <Input required className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Current Year/Grade Level *</Label>
                <Input required className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Year of University Application *</Label>
                <Input required placeholder="YYYY" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
                <p className="text-xs text-calm-text-muted">In which year will you apply for university?</p>
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">School Leaving Year *</Label>
                <Input required placeholder="YYYY" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
                <p className="text-xs text-calm-text-muted">This is typically the same year that you will enter university.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Student Phone Number *</Label>
                <Input required type="tel" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Student Email *</Label>
                <Input required type="email" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Student Residential Address</Label>
              <textarea className="w-full min-h-[80px] p-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text" />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Student Country/Territory *</Label>
                <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                  <option value="">Select Country</option>
                  {COUNTRIES.map(country => <option key={`student-${country}`} value={country}>{country}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Country of Citizenship *</Label>
                <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                  <option value="">Select Country</option>
                  {COUNTRIES.map(country => <option key={`citizen-${country}`} value={country}>{country}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Add Another Country of Citizenship?</Label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm text-calm-text">
                  <input type="radio" name="anotherCitizenship" value="yes" className="text-calm-primary focus:ring-calm-primary" /> Yes
                </label>
                <label className="flex items-center gap-2 text-sm text-calm-text">
                  <input type="radio" name="anotherCitizenship" value="no" defaultChecked className="text-calm-primary focus:ring-calm-primary" /> No
                </label>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">How did you hear about ADMITOS? *</Label>
                <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                  <option value="">Select an option</option>
                  <option value="Search Engine (Google/Bing)">Search Engine (Google/Bing)</option>
                  <option value="Social Media (Facebook/Instagram/TikTok/LinkedIn)">Social Media (Facebook/Instagram/TikTok/LinkedIn)</option>
                  <option value="Friend/Family/Colleague">Friend/Family/Colleague</option>
                  <option value="School Counselor/Teacher">School Counselor/Teacher</option>
                  <option value="Event/Webinar">Event/Webinar</option>
                  <option value="News/PR">News/PR</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Where did you first hear about ADMITOS? *</Label>
                <Input required placeholder="e.g. Specific Facebook group, name of friend, etc." className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">What motivated you to reach out to ADMITOS? *</Label>
              <textarea required className="w-full min-h-[80px] p-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text" />
            </div>
          </div>
        </div>

        {/* Parent/Guardian Details */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-8 shadow-sm">
          <div className="mb-6 border-b border-calm-border pb-4">
            <h2 className="text-xl font-medium text-calm-text">Parent/Guardian Details</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">First Name *</Label>
                <Input required className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Last Name *</Label>
                <Input required className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Relationship to Student *</Label>
                <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                  <option value="">Select Relationship</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian/Caregiver</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Phone Number *</Label>
                <Input required type="tel" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Email *</Label>
                <Input required type="email" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">City *</Label>
                <Input required className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Country/Territory *</Label>
              <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                <option value="">Select Country</option>
                {COUNTRIES.map(country => <option key={`parent-${country}`} value={country}>{country}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* University Information */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-8 shadow-sm">
          <div className="mb-6 border-b border-calm-border pb-4">
            <h2 className="text-xl font-medium text-calm-text">University Information</h2>
          </div>
          
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Where do you intend to apply? *</Label>
                <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                  <option value="">Select Country</option>
                  {COUNTRIES.map(country => <option key={`apply-${country}`} value={country}>{country}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Target University *</Label>
                <Input required placeholder="Write 'Unsure' if you don't know" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Add Another Target University?</Label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm text-calm-text">
                  <input type="radio" name="anotherUni" value="yes" className="text-calm-primary focus:ring-calm-primary" /> Yes
                </label>
                <label className="flex items-center gap-2 text-sm text-calm-text">
                  <input type="radio" name="anotherUni" value="no" defaultChecked className="text-calm-primary focus:ring-calm-primary" /> No
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Intended courses of study (Select All That Apply) *</Label>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                {['Medicine/Pre-med', 'Law and related fields', 'Business/Economics', 'Engineering', 'Humanities/Social Sciences', 'Computer Science', 'Unsure', 'Other'].map(course => (
                  <label key={course} className="flex items-center gap-2 text-sm text-calm-text">
                    <input type="checkbox" className="rounded border-calm-border text-calm-primary focus:ring-calm-primary" />
                    {course}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Estimated yearly budget for university education *</Label>
              <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                <option value="">Select Budget</option>
                <option value="Under £10,000">Under £10,000</option>
                <option value="£10,000 – £25,000">£10,000 – £25,000</option>
                <option value="£25,000 – £40,000">£25,000 – £40,000</option>
                <option value="£40,000 – £70,000">£40,000 – £70,000</option>
                <option value="Over £70,000">Over £70,000</option>
              </select>
              <p className="text-xs text-calm-text-muted">US university fees are £45,000+ per year. UK university fees are £20,000+ per year for UK residents, £30,000+ for non-UK residents.</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Planning to apply for financial aid from US universities? *</Label>
                <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                  <option value="">Select Option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Unsure">Unsure</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Estimated budget for expert university admissions support *</Label>
                <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                  <option value="">Select Budget</option>
                  <option value="Under £5,000">Under £5,000</option>
                  <option value="£5,000 – £10,000">£5,000 – £10,000</option>
                  <option value="£10,000 – £20,000">£10,000 – £20,000</option>
                  <option value="Over £20,000">Over £20,000</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Are you/is your child receiving additional support?</Label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 text-sm text-calm-text">
                  <input type="radio" name="additionalSupport" value="yes" className="text-calm-primary focus:ring-calm-primary" /> Yes
                </label>
                <label className="flex items-center gap-2 text-sm text-calm-text">
                  <input type="radio" name="additionalSupport" value="no" defaultChecked className="text-calm-primary focus:ring-calm-primary" /> No
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Knowledge of US/UK application process (1-5) *</Label>
              <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                <option value="">Select Level</option>
                <option value="1">1 (No Knowledge)</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 (Very Knowledgeable)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-8 shadow-sm">
          <div className="mb-6 border-b border-calm-border pb-4">
            <h2 className="text-xl font-medium text-calm-text">Academic & Testing Information</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">School Curriculum (Select All That Apply) *</Label>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                {['Advanced Placement (AP)', 'GCSE/A-Levels', 'International Baccalaureate (IB)', 'Local national curriculum', 'Other'].map(curr => (
                  <label key={curr} className="flex items-center gap-2 text-sm text-calm-text">
                    <input type="checkbox" className="rounded border-calm-border text-calm-primary focus:ring-calm-primary" />
                    {curr}
                  </label>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Academic Ranking *</Label>
                <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                  <option value="">Select Ranking</option>
                  <option value="Top 1%">Top 1%</option>
                  <option value="Top 5%">Top 5%</option>
                  <option value="Top 10%">Top 10%</option>
                  <option value="Top 25%">Top 25%</option>
                  <option value="Unsure">Unsure</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Predicted Results *</Label>
                <Input required placeholder="e.g. A Levels, IB, AP" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Standardised Tests Taken</Label>
              <div className="flex flex-wrap gap-4 mt-2">
                {['TOEFL', 'IELTS', 'SAT', 'ACT', 'PSAT', 'AP'].map(test => (
                  <label key={test} className="flex items-center gap-2 text-sm text-calm-text">
                    <input type="checkbox" className="rounded border-calm-border text-calm-primary focus:ring-calm-primary" />
                    {test}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Upload examination results / List subjects *</Label>
              <div className="mt-2 flex justify-center rounded-xl border border-dashed border-calm-border px-6 py-10 bg-calm-surface-2 hover:bg-calm-surface transition-colors cursor-pointer group">
                <div className="text-center">
                  <div className="flex justify-center gap-4 mb-4 text-calm-text-muted group-hover:text-calm-primary transition-colors">
                    <UploadCloud className="h-8 w-8" />
                    <Monitor className="h-8 w-8" />
                    <HardDrive className="h-8 w-8" />
                  </div>
                  <div className="mt-4 flex text-sm leading-6 text-calm-text-muted justify-center">
                    <label className="relative cursor-pointer rounded-md font-semibold text-calm-primary focus-within:outline-none hover:text-calm-primary-hover">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" multiple />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-calm-text-muted">PDF, DOCX, PNG, JPG up to 10MB</p>
                  <p className="text-xs leading-5 text-calm-text-muted mt-2">Supports Computer, Google Drive, Dropbox</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Extracurricular & Additional */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-8 shadow-sm">
          <div className="mb-6 border-b border-calm-border pb-4">
            <h2 className="text-xl font-medium text-calm-text">Extracurricular & Additional Information</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Extracurricular Activities *</Label>
              <textarea required placeholder="List your extracurricular and work engagements" className="w-full min-h-[120px] p-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text" />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">English Level *</Label>
                <select required className="w-full h-11 px-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text">
                  <option value="">Select Level</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-calm-text-muted font-medium">Other Language(s) Spoken *</Label>
                <Input required placeholder="Write 'N/A' if none" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Languages Spoken by Parent/Guardian *</Label>
              <Input required placeholder="e.g. English, Mandarin" className="h-11 rounded-xl border-calm-border bg-calm-surface-2 focus-visible:ring-zinc-200" />
            </div>

            <div className="space-y-2">
              <Label className="text-calm-text-muted font-medium">Specific questions or concerns *</Label>
              <textarea required placeholder="List any concerns or areas of help you would like from us" className="w-full min-h-[100px] p-3 rounded-xl border border-calm-border bg-calm-surface-2 focus:outline-none focus:ring-2 focus:ring-zinc-200 text-sm text-calm-text" />
            </div>
          </div>
        </div>

        {/* Legal & Compliance Checklist (Pre-Launch) */}
        <div className="bg-calm-surface border border-calm-border rounded-2xl p-8 shadow-sm">
          <div className="mb-6 border-b border-calm-border pb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-calm-accent" />
            <h2 className="text-xl font-medium text-calm-text">Legal & Compliance Checklist</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-sm text-calm-text-muted mb-4">
              The following compliance measures are active to ensure data privacy, security, and regulatory adherence.
            </p>

            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-calm-border bg-calm-surface-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-calm-text">Hume AI Biometric Compliance</h4>
                  <p className="text-xs text-calm-text-muted mt-1">Explicit opt-in required for emotion AI and facial/vocal analysis. Data is not used to identify individuals.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border border-calm-border bg-calm-surface-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-calm-text">Turnitin Institutional License</h4>
                  <p className="text-xs text-calm-text-muted mt-1">Plagiarism and AI-generation checks are performed under authorized institutional API agreements.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border border-calm-border bg-calm-surface-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-calm-text">LangSmith PII Scrubbing</h4>
                  <p className="text-xs text-calm-text-muted mt-1">All LLM traces and logs are automatically scrubbed of Personally Identifiable Information (PII) before storage.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border border-calm-border bg-calm-surface-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-calm-text">Mem0 EU Data Residency</h4>
                  <p className="text-xs text-calm-text-muted mt-1">User memory and context vectors for EU citizens are strictly stored and processed within EU data centers.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border border-calm-border bg-calm-surface-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-calm-text">Stripe Consumer Credit Compliance</h4>
                  <p className="text-xs text-calm-text-muted mt-1">Payment processing and installment plans adhere to local consumer credit and lending regulations.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-xl border border-calm-border bg-calm-surface-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-calm-text">Writing Style Vector Consent</h4>
                  <p className="text-xs text-calm-text-muted mt-1">Users must explicitly consent before their writing samples are processed to generate a personalized Writing Style Vector.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-calm-primary text-white hover:bg-calm-primary-hover rounded-xl px-8 h-12 text-sm font-medium shadow-sm transition-all duration-300 flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save & Submit
          </Button>
        </div>
      </form>
    </div>
  );
}
