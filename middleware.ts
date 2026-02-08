// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // 1. 보호할 경로인지 확인 (여기서는 /admin 으로 시작하는 모든 경로)
  if (req.nextUrl.pathname.startsWith('/admin')) {
    
    // 2. Authorization 헤더 확인 (Basic Auth)
    const authHeader = req.headers.get('authorization');

    if (authHeader) {
      // Basic authentication 값 파싱 (Basic base64(user:pass))
      const authValue = authHeader.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // 3. 환경변수와 대조 (서버 사이드 검증)
      if (user === process.env.ADMIN_USERNAME && pwd === process.env.ADMIN_PASSWORD) {
        return NextResponse.next(); // 통과
      }
    }

    // 4. 인증 실패 시 401 응답 및 로그인 창 팝업 유도
    return new NextResponse('Authentication Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
      },
    });
  }

  // 다른 경로는 그냥 통과
  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  matcher: '/admin/:path*',
};