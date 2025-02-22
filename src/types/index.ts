import { IncomingMessage, ServerResponse } from 'node:http'

export type HttpMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'

export type ServerRouteHandlerType = (
    req: IncomingMessage,
    res: ServerResponse,
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
    OK = 200,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500
}
