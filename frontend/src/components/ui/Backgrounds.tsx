import React from 'react';
import { cn } from '../../lib/utils';

interface BackgroundVariant {
  id: string;
  name: string;
  component: React.ComponentType<{ children?: React.ReactNode; className?: string }>;
}

export const AuroraBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-background w-full fixed inset-0 -z-10", className)}>
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/40"></div>
        </div>
        
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-60"
            style={{
              background: 'radial-gradient(ellipse 800px 600px at 50% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              animation: 'aurora1 8s ease-in-out infinite alternate'
            }}
          />
          
          <div 
            className="absolute inset-0 opacity-50"
            style={{
              background: 'radial-gradient(ellipse 600px 400px at 80% 30%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)',
              animation: 'aurora2 6s ease-in-out infinite alternate-reverse'
            }}
          />
          
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'radial-gradient(ellipse 700px 500px at 20% 60%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
              animation: 'aurora3 10s ease-in-out infinite alternate'
            }}
          />
          
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'radial-gradient(ellipse 900px 300px at 60% 80%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)',
              animation: 'aurora4 7s ease-in-out infinite alternate-reverse'
            }}
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-background/10"></div>
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
};

export const GlowBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={cn("min-h-screen w-full relative bg-background", className)}>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 25%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 25% 75%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
            radial-gradient(circle at center, rgba(255, 249, 145, 0.15) 0%, transparent 70%)
          `,
          opacity: 0.8,
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const GridBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={cn("min-h-screen w-full bg-background relative", className)}>
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "hsl(var(--background))",
          backgroundImage: `
            linear-gradient(to right, rgba(71,85,105,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(71,85,105,0.1) 1px, transparent 1px),
            radial-gradient(circle at 33% 33%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 66% 33%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 33% 66%, rgba(236, 72, 153, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 66% 66%, rgba(34, 197, 94, 0.08) 0%, transparent 50%)
          `,
          backgroundSize: "60px 60px, 60px 60px, 100% 100%, 100% 100%, 100% 100%, 100% 100%",
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const GeometricBackground: React.FC<{ children?: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={cn("min-h-screen w-full bg-background relative overflow-hidden", className)}>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-10 left-10 w-32 h-32 border border-border/20 rotate-45 animate-pulse"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border border-primary/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 border border-secondary/20 rotate-12 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 border border-accent/20 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-muted/20 rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
        
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.05) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, rgba(34, 197, 94, 0.05) 0%, transparent 40%)
            `,
          }}
        />
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export const backgrounds: BackgroundVariant[] = [
  { id: 'aurora', name: 'Aurora', component: AuroraBackground },
  { id: 'glow', name: 'Symmetric Glow', component: GlowBackground },
  { id: 'grid', name: 'Grid Pattern', component: GridBackground },
  { id: 'geometric', name: 'Geometric', component: GeometricBackground },
];
