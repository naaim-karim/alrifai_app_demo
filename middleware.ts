import { NextRequest, NextResponse } from "next/server";

export const middleware = async (request: NextRequest) => {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const isCheckEmail = pathname === "/check-email";

  if (isCheckEmail) {
    const fromAuth = request.cookies.get("fromAuth")?.value;
    if (fromAuth) {
      response.cookies.set("fromAuth", "", {
        maxAge: 0,
        path: "/",
      });
      return response;
    } else {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
};
