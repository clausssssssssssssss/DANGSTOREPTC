// src/utils/errors.js

export class NotFoundError extends Error {
  constructor(message = 'Recurso no encontrado') {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
  }
}

export class BadRequestError extends Error {
  constructor(message = 'Solicitud incorrecta') {
    super(message);
    this.name = 'BadRequestError';
    this.status = 400;
  }
}
