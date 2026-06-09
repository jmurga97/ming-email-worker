export function errorResponse(code: string, message: string, status: number): Response {
  return Response.json(
    {
      success: false,
      error: { code, message },
    },
    { status },
  );
}
