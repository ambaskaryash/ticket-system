export default function Logo({ className = "w-10 h-10", glow = false }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${glow ? 'shadow-xl shadow-accent-blue/50 rounded-2xl' : ''}`}>
      <img 
        src="/logo.png" 
        alt="Skillected Logo" 
        className={`object-cover rounded-xl ${className}`} 
      />
    </div>
  );
}
