import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090A0F',
          borderRadius: 8,
          border: '2px solid #E11D48',
          boxShadow: '0 0 10px rgba(225, 29, 72, 0.4)',
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 900,
            fontFamily: 'system-ui, sans-serif',
            color: '#FFFFFF',
            background: 'linear-gradient(135deg, #FF4D6D 0%, #E11D48 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: -1,
          }}
        >
          R
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
