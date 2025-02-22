import {
    createServer,
    IncomingMessage,
    Server,
    ServerResponse,
} from 'node:http'

import {
    HttpMethods,
    HttpStatusCode,
    ServerRouteHandlerType,
    ServerRoutesMap,
} from './types'

export class RouteController {
    private routes: ServerRoutesMap

    public get(path: string, handler: ServerRouteHandlerType): void {
        this.routes['GET'][path] = handler
    }

    public handleRequest(req: IncomingMessage, res: ServerResponse) {
        const path = req.url
        const method = req.method

        const routeHandler = this.routes[method as HttpMethods][path as string]

        if (routeHandler) {
            routeHandler(req, res)
        } else {
            res.statusCode = HttpStatusCode.NOT_FOUND
            res.end(JSON.stringify('Route not found'))
        }
    }

    constructor() {
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {},
        }
    }
}

export class Suppress {
    private server: Server
    private routes: ServerRoutesMap
    private controllers: Map<string, RouteController>

    constructor() {
        this.server = createServer((req, res) => {
            this.handleRequest(req, res)
        })
        this.routes = {
            GET: {},
            POST: {},
            PUT: {},
            DELETE: {},
        }
        this.controllers = new Map()
    }

    private handleRequest(req: IncomingMessage, res: ServerResponse) {
        const path = req.url
        const method = req.method

        // TODO: validate the method is valid and exists in the map
        const routeHandler = this.routes[method as HttpMethods][path as string]

        if (routeHandler) {
            routeHandler(req, res)
        } else {
            res.statusCode = HttpStatusCode.NOT_FOUND
            res.end(JSON.stringify('Route not found'))
        }
    }

    public get(path: string, handler: ServerRouteHandlerType): void {
        this.routes['GET'][path] = handler
    }

    public listen(port = 3000) {
        this.server.listen(port)
        console.log(`Server listens on port: ${port}`)
    }

    public addController(path: string, controller: RouteController) {
        this.controllers.set(path, controller)
    }
}
