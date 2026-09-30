// Builds a consistent error payload for service responses.
export function makeError(code, message) {
  return { error: { code, message } };
}

// Wraps successful service data.
export function ok(data) {
  return { data };
}
