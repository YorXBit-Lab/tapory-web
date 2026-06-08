import { ImageResponse } from 'next/og';

export const alt = 'Góc Chạm - Móc khóa NFC in ảnh theo yêu cầu';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#f8f4ee',
          color: '#2c2118',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 18% 20%, rgba(139,107,82,.28), transparent 34%), radial-gradient(circle at 86% 76%, rgba(196,92,138,.22), transparent 34%)',
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '68%',
            height: '100%',
            padding: '72px 0 72px 86px',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div
            style={{
              display: 'flex',
              color: '#8b6b52',
              fontSize: 26,
              fontWeight: 700,
              marginBottom: 30,
              letterSpacing: 2,
            }}
          >
            GOC CHAM
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 800,
              maxWidth: 720,
            }}
          >
            Moc khoa NFC in anh theo yeu cau
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              lineHeight: 1.35,
              color: '#6e5a4a',
              marginTop: 28,
              maxWidth: 760,
            }}
          >
            Cham dien thoai de mo trang ky niem ca nhan, khong can cai app.
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            right: 78,
            top: 96,
            width: 292,
            height: 292,
            borderRadius: 48,
            background: 'linear-gradient(145deg, #8b6b52, #d8c3ae)',
            boxShadow: '0 34px 70px rgba(70,47,31,.28)',
            transform: 'rotate(10deg)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 144,
            top: 168,
            width: 160,
            height: 160,
            borderRadius: 999,
            border: '18px solid rgba(255,255,255,.68)',
            transform: 'rotate(10deg)',
          }}
        />
      </div>
    ),
    size,
  );
}
