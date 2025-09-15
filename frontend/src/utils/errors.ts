export function extractErrorMessage(err: unknown, fallback = 'An error occurred') {
  // Try to extract axios-like error message safely without using `any`
  try {
    const e = err as { response?: { data?: { message?: string } }; message?: string };
    return e.response?.data?.message || e.message || fallback;
  } catch {
    return fallback;
  }
}