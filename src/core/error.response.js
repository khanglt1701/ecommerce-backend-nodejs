'use strict'

const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409,
    UNAUTHORIZED: 403,
    NOT_FOUND: 401,
}

const ReasonStatusCode = {
    FORBIDDEN: 'Bad request error',
    CONFLICT: 'Conflict error',
    UNAUTHORIZED: 'UNAUTHORIZED',
    NOT_FOUND: 'NOT FOUND',
}

// const { StatusCode, ReasonPhrases } = require('../utils/httpStatusCode')

class ErrorReponse extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

class ConflictRequestError extends ErrorReponse {
    constructor(
        message = ReasonStatusCode.CONFLICT,
        statusCode = StatusCode.CONFLICT
    ) {
        super(message, statusCode)
    }
}

class BadRequestError extends ErrorReponse {
    constructor(
        message = ReasonStatusCode.FORBIDDEN,
        statusCode = StatusCode.FORBIDDEN
    ) {
        super(message, statusCode)
    }
}

class AuthFailureError extends ErrorReponse {
    constructor(
        message = ReasonStatusCode.UNAUTHORIZED,
        statusCode = StatusCode.UNAUTHORIZED
    ) {
        super(message, statusCode)
    }
}

class NotFoundError extends ErrorReponse {
    constructor(
        message = ReasonStatusCode.NOT_FOUND,
        statusCode = StatusCode.NOT_FOUND
    ) {
        super(message, statusCode)
    }
}

module.exports = {
    ConflictRequestError,
    BadRequestError,
    AuthFailureError,
    NotFoundError,
}
