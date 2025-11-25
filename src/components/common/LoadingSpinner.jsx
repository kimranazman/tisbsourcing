export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="relative">
        {/* Outer glass ring */}
        <div className="w-20 h-20 rounded-full glass border-2 border-white/30"></div>
        {/* Spinning gradient ring */}
        <div className="absolute top-0 left-0 w-20 h-20 rounded-full border-4 border-transparent border-t-indigo-500 border-r-purple-500 animate-spin"></div>
        {/* Inner glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 opacity-30 blur-md animate-pulse"></div>
      </div>
    </div>
  )
}
