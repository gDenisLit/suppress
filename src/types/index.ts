import { IncomingMessage, ServerResponse } from 'node:http'

export type HttpMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type ServerRouteHandlerType = (
    req: IncomingMessage,
    res: ServerResponse
) => void | Promise<void>

export interface ServerRoutesMap {
    GET: {
        [key: string]: ServerRouteHandlerType
    }
    POST: {
        [key: string]: ServerRouteHandlerType
    }
    PUT: {
        [key: string]: ServerRouteHandlerType
    }
    DELETE: {
        [key: string]: ServerRouteHandlerType
    }
}

export enum HttpStatusCode {
    // Success
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,

    // Redirection
    MOVED_PERMANENTLY = 301,
    FOUND = 302,
    SEE_OTHER = 303,
    NOT_MODIFIED = 304,
    TEMPORARY_REDIRECT = 307,
    PERMANENT_REDIRECT = 308,

    // Client Errors
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    NOT_ACCEPTABLE = 406,
    CONFLICT = 409,
    GONE = 410,
    UNSUPPORTED_MEDIA_TYPE = 415,
    TOO_MANY_REQUESTS = 429,

    // Server Errors
    INTERNAL_SERVER_ERROR = 500,
    NOT_IMPLEMENTED = 501,
    BAD_GATEWAY = 502,
    SERVICE_UNAVAILABLE = 503,
    GATEWAY_TIMEOUT = 504,
}

export interface ISupressController {
    get: (path: string, handler: ServerRouteHandlerType) => void
    post: (path: string, handler: ServerRouteHandlerType) => void
    put: (path: string, handler: ServerRouteHandlerType) => void
    delete: (path: string, handler: ServerRouteHandlerType) => void
    handleRequest: (
        req: IncomingMessage,
        res: ServerResponse,
        basePath: string
    ) => void
}
