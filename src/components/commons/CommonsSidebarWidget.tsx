import { Link } from 'react-router-dom';

export default function CommonsSidebarWidget() {
  return (
    <div className="bg-calm-surface border border-calm-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-[#15803D] flex items-center justify-center text-white font-bold text-xs">
          C
        </div>
        <h3 className="text-[14px] font-medium text-calm-text">Commons — what students are discussing</h3>
      </div>

      <div className="space-y-3 mb-4">
        <div className="group cursor-pointer">
          <p className="text-[12px] text-calm-text-muted line-clamp-2 leading-snug group-hover:text-[#15803D] transition-colors">
            "Has anyone done the MAT this year? How was Section B?"
          </p>
        </div>
        <div className="border-t border-calm-border"></div>
        <div className="group cursor-pointer">
          <p className="text-[12px] text-calm-text-muted line-clamp-2 leading-snug group-hover:text-[#15803D] transition-colors">
            "Common App activities — how are people ordering their 10 slots?"
          </p>
        </div>
        <div className="border-t border-calm-border"></div>
        <div className="group cursor-pointer">
          <p className="text-[12px] text-calm-text-muted line-clamp-2 leading-snug group-hover:text-[#15803D] transition-colors">
            "Is it normal to feel like everyone else is more prepared?"
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Link to="/dashboard/commons" className="text-[12px] font-medium text-[#15803D] hover:underline">
          View all in Commons →
        </Link>
        <span className="text-[10px] text-calm-text-muted">847 posts this month</span>
      </div>
    </div>
  );
}
