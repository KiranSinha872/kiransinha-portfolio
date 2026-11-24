export function HeroSkeleton() {
  return (
    <div className="py-12 sm:py-16 animate-pulse space-y-4">
      <div className="h-6 w-36 bg-[#EAEAEA] border border-[#DADADA] rounded-full" />
      <div className="h-16 w-64 bg-[#EAEAEA] border border-[#DADADA] rounded-xl" />
      <div className="h-6 w-48 bg-[#EAEAEA] border border-[#DADADA] rounded-lg" />
      <div className="h-20 w-full max-w-xl bg-[#EAEAEA] border border-[#DADADA] rounded-xl" />
    </div>
  );
}

export function SectionHeaderSkeleton() {
  return (
    <div className="space-y-2 mb-6 animate-pulse">
      <div className="h-4 w-28 bg-[#EAEAEA] rounded-full" />
      <div className="h-7 w-44 bg-[#EAEAEA] rounded-lg" />
    </div>
  );
}

export function AboutSkeleton() {
  return (
    <div className="space-y-3 animate-pulse py-8 border-t border-[#DADADA]">
      <SectionHeaderSkeleton />
      <div className="h-24 w-full bg-[#EAEAEA] border border-[#DADADA] rounded-2xl" />
    </div>
  );
}

export function SkillsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse py-8 border-t border-[#DADADA]">
      <SectionHeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-5 bg-white border border-[#DADADA] rounded-xl space-y-3">
            <div className="h-4 w-28 bg-[#EAEAEA] rounded-md" />
            <div className="flex flex-wrap gap-2 pt-1">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-6 w-16 bg-[#EAEAEA] rounded-lg" />
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
    <div className="space-y-6 animate-pulse py-8 border-t border-[#DADADA]">
      <SectionHeaderSkeleton />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 bg-white border border-[#DADADA] rounded-xl space-y-3">
            <div className="h-5 w-48 bg-[#EAEAEA] rounded-md" />
            <div className="h-4 w-32 bg-[#EAEAEA] rounded-md" />
            <div className="h-12 w-full bg-[#EAEAEA] rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CertificationsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse py-8 border-t border-[#DADADA]">
      <SectionHeaderSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 bg-white border border-[#DADADA] rounded-xl space-y-3">
            <div className="h-5 w-40 bg-[#EAEAEA] rounded-md" />
            <div className="h-4 w-28 bg-[#EAEAEA] rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse py-8 border-t border-[#DADADA]">
      <SectionHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#DADADA] rounded-xl overflow-hidden space-y-3">
            <div className="aspect-[16/10] w-full bg-[#EAEAEA]" />
            <div className="p-5 space-y-2">
              <div className="h-5 w-36 bg-[#EAEAEA] rounded-md" />
              <div className="h-12 w-full bg-[#EAEAEA] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
