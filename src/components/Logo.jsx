export default function Logo({ className = "h-10 w-auto", glow = false }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${glow ? 'shadow-xl shadow-accent-blue/50 rounded-2xl' : ''}`}>
      <img 
        src="/logo.png" 
        alt="SkillEctEd Support Logo" 
        className={`object-contain rounded-xl ${className}`} 
      />
    </div>
  );
}
