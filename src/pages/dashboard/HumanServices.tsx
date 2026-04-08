import { Badge } from "@/components/ui/badge";
import { Users, GraduationCap, PenTool, Calendar, ArrowRight, Star } from "lucide-react";

export default function HumanServices() {
  const services = [
    {
      title: "Private Admissions Counsellor",
      description: "1-on-1 strategic guidance from former admissions officers.",
      icon: Users,
      features: ["Profile building", "University selection", "Application review"],
      price: "From £150/hr",
      popular: true
    },
    {
      title: "Expert Essay Editor",
      description: "Detailed feedback on structure, tone, and grammar.",
      icon: PenTool,
      features: ["Line-by-line edits", "Narrative coaching", "Multiple revisions"],
      price: "From £90/essay",
      popular: false
    },
    {
      title: "Subject Specialist Tutor",
      description: "Targeted support for A-Levels, IB, or AP exams.",
      icon: GraduationCap,
      features: ["Personalized lesson plans", "Mock exams", "Progress tracking"],
      price: "From £60/hr",
      popular: false
    }
  ];

  return (
    <div className="max-w-5xl mx-auto w-full pt-12 pb-24 px-6 space-y-12">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-calm-text mb-2">Human Expertise</h1>
        <p className="text-calm-text-muted text-lg">Escalate to premium human support when you need it.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {services.map((service, i) => (
          <div key={i} className={`group flex flex-col bg-calm-surface border rounded-2xl p-6 transition-all hover:shadow-sm relative ${service.popular ? 'border-calm-border shadow-sm' : 'border-calm-border hover:border-calm-border'}`}>
            {service.popular && (
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-calm-primary text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <Star className="w-3 h-3 fill-white" /> Popular
              </div>
            )}
            
            <div className="w-12 h-12 rounded-xl bg-calm-surface-2 border border-calm-border flex items-center justify-center mb-6">
              <service.icon className="w-6 h-6 text-calm-text" />
            </div>
            
            <h3 className="text-xl font-semibold text-calm-text mb-2">{service.title}</h3>
            <p className="text-sm text-calm-text-muted mb-6 leading-relaxed">{service.description}</p>
            
            <div className="flex-1">
              <div className="text-xs font-medium text-calm-text-muted uppercase tracking-wider mb-3">Includes</div>
              <ul className="space-y-2.5 mb-8">
                {service.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2.5 text-sm text-calm-text-muted">
                    <div className="w-1.5 h-1.5 rounded-full bg-calm-border" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mt-auto pt-6 border-t border-calm-border">
              <div className="text-lg font-semibold text-calm-text mb-4">{service.price}</div>
              <button className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${service.popular ? 'bg-calm-primary text-white hover:bg-calm-primary-hover' : 'bg-calm-surface-2 text-calm-text border border-calm-border hover:bg-calm-surface-2'}`}>
                Book Consultation <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-calm-surface-2 border border-calm-border rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <div className="w-16 h-16 rounded-2xl bg-calm-surface border border-calm-border flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-8 h-8 text-calm-text" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-calm-text mb-2">Not sure what you need?</h3>
            <p className="text-calm-text-muted leading-relaxed max-w-xl">
              Schedule a free 15-minute discovery call with our student success team to find the right support.
            </p>
          </div>
        </div>
        <button className="bg-calm-primary text-white hover:bg-calm-primary-hover rounded-full px-6 py-3 font-medium whitespace-nowrap shadow-sm transition-colors shrink-0">
          Schedule Free Call
        </button>
      </div>
    </div>
  );
}
