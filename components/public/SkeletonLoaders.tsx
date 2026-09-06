export function HeroSkeleton() {
  return (
    <div className="py-16 animate-pulse space-y-4">
      <div className="h-6 w-36 bg-white/5 border border-white/5 rounded-full" />
      <div className="h-12 w-64 bg-white/5 border border-white/5 rounded-xl" />
      <div className="h-6 w-48 bg-white/5 border border-white/5 rounded-lg" />
      <div className="h-20 w-full max-w-xl bg-white/5 border border-white/5 rounded-xl" />
    </div>
  );
}

export function SectionHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-6 animate-pulse">
      <div className="h-4 w-28 bg-white/5 rounded-full" />
      <div className="h-7 w-44 bg-white/5 rounded-lg" />
    </div>
  );
}

export function AboutSkeleton() {
  return (
    <div className="space-y-3 animate-pulse py-8 border-t border-white/10">
      <SectionHeaderSkeleton />
      <div className="h-24 w-full bg-white/5 border border-white/5 rounded-2xl" />
    </div>
  );
}

export function SkillsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse py-8 border-t border-white/10">
      <SectionHeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-3">
            <div className="h-4 w-28 bg-white/10 rounded-md" />
            <div className="flex flex-wrap gap-2 pt-1">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-6 w-16 bg-white/10 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EducationSkeleton() {
  return (
    <div className="space-y-6 animate-pulse py-8 border-t border-white/10">
      <SectionHeaderSkeleton />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-3">
            <div className="h-5 w-48 bg-white/10 rounded-md" />
            <div className="h-4 w-32 bg-white/10 rounded-md" />
            <div className="h-12 w-full bg-white/10 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CertificationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse py-8 border-t border-white/10">
      <SectionHeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-3">
            <div className="h-5 w-40 bg-white/10 rounded-md" />
            <div className="h-4 w-28 bg-white/10 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse py-8 border-t border-white/10">
      <SectionHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden space-y-3">
            <div className="aspect-video w-full bg-white/10" />
            <div className="p-5 space-y-2">
              <div className="h-5 w-36 bg-white/10 rounded-md" />
              <div className="h-12 w-full bg-white/10 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
