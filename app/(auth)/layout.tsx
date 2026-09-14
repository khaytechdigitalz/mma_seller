export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-center items-center lg:p-10 p-5 min-h-screen bg-[#ede9fe]">
      {/* Pure transparent glassmorphic card container */}
      <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/80 shadow-2xl rounded-3xl lg:p-10 p-5 w-full max-w-[672px] mx-auto">
        {children}
      </div>
    </div>
  );
}