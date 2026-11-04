/**
 * Maps API validation details (`[{ field: 'body.email', message }]`) to
 * `{ email: message }`, keeping the first message per field.
 */
export function fieldErrorsFromApi(details) {
  const errors = {};
  for (const { field, message } of details ?? []) {
    const key = field.split('.').slice(1).join('.');
    if (key && !(key in errors)) errors[key] = message;
  }
  return errors;
}
