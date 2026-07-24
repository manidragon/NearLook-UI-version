const ReportCard = ({value, title, icon}: any) => {
  return (
    <div className="flex gap-4 md:gap-5 items-center p-4 md:p-5 w-full bg-white border border-gray-100 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden relative">
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-orange-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

      <div className="rounded-full p-3 bg-orange-50 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 z-10 shrink-0 shadow-sm border border-orange-100 group-hover:border-orange-500">
        {icon}
      </div>
      <div className="z-10 relative">
        <p className="font-bold text-xl md:text-2xl text-gray-800 truncate">{value}</p>
        <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  )
}

export default ReportCard