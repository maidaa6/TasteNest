export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, message, details);
export const unauthorized = (message = 'Prijava je obvezna.') => new HttpError(401, message);
export const forbidden = (message = 'Nimate pravic za to dejanje.') => new HttpError(403, message);
export const notFound = (message = 'Vir ne obstaja.') => new HttpError(404, message);
export const conflict = (message) => new HttpError(409, message);
