const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Malformed ids in the path are treated as "not found" rather than as validation errors.
export const isUuid = (value) => typeof value === 'string' && UUID.test(value);
