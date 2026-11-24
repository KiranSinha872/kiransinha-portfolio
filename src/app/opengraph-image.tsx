import { ImageResponse } from 'next/og';

export const alt = 'Kiran Sinha — B.Tech AI/ML Student | Aspiring Software Engineer';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0C0C0C',
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(100, 105, 115, 0.3) 0%, transparent 70%), radial-gradient(circle at 90% 90%, rgba(40, 50, 65, 0.25) 0%, transparent 55%)',
          padding: '60px 70px',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#EDEDED',
        }}
      >
        {/* Top bar: Badge & Brand Monogram */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          {/* Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 18px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#BBCCD7',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
              }}
            />
            <span>Available for Opportunities</span>
          </div>

          {/* Monogram / Domain */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#141414',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8E9BAE',
                fontSize: '18px',
                fontWeight: 700,
              }}
            >
              KS
            </div>
            <span
              style={{
                fontSize: '18px',
                color: '#8E9BAE',
                letterSpacing: '0.04em',
                fontWeight: 500,
              }}
            >
              kiransinha.dev
            </span>
          </div>
        </div>

        {/* Main Content: Heading & Tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginTop: '20px',
            marginBottom: '20px',
          }}
        >
          {/* Name with metallic gradient effect */}
          <div
            style={{
              fontSize: '84px',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              backgroundImage: 'linear-gradient(180deg, #FFFFFF 20%, #8E9BAE 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'flex',
            }}
          >
            Kiran Sinha
          </div>

          {/* Subheading / Tagline */}
          <div
            style={{
              fontSize: '30px',
              fontWeight: 400,
              color: '#EDEDED',
              letterSpacing: '-0.01em',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span>B.Tech AI/ML Student</span>
            <span style={{ color: '#4B5563' }}>|</span>
            <span style={{ color: '#BBCCD7' }}>Aspiring Software Engineer</span>
          </div>

          {/* Bio description */}
          <div
            style={{
              fontSize: '20px',
              fontWeight: 300,
              color: '#8E9BAE',
              lineHeight: 1.5,
              marginTop: '16px',
              maxWidth: '880px',
            }}
          >
            Designing & engineering high-performance web applications, intelligent systems, and scalable cloud solutions.
          </div>
        </div>

        {/* Bottom Bar / Pill Highlights */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          {['Next.js & TypeScript', 'Artificial Intelligence & ML', 'Full-Stack Architecture', 'Cloud & PostgreSQL'].map(
            (tag) => (
              <div
                key={tag}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(20, 20, 20, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#9CA3AF',
                  fontSize: '15px',
                  fontWeight: 500,
                  display: 'flex',
                }}
              >
                {tag}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
