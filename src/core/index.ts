import {
    createServer,
    IncomingMessage,
    Server,
    ServerResponse,
} from 'node:http'

import {
    HttpMethods,
    HttpStatusCode,
    ISupressController,
    ServerRouteHandlerType,
    ServerRoutesMap,
} from '../types'

/**
 * Controller class for handling HTTP routes and their corresponding handlers.
 * Implements the ISupressController interface.
 *
 * This class provides a routing system that maps HTTP methods and paths to handler functions.
 * It supports GET, POST, PUT, and DELETE methods, allowing you to define specific behavior
 * for each route.
 *
 * @example
 * ```typescript
 * const controller = new SuppressController();
 * controller.get('/users', (req, res) => {
 *   res.end(JSON.stringify({ users: [] }));
 * });
 * ```
 */
export class SuppressController implements ISupressController {
    private routes: ServerRoutesMap = {
        GET: {},
        POST: {},
        PUT: {},
        DELETE: {},
    }

    constructor() {}

    /**
     * Registers a GET route handler for the specified path.
     * Used for retrieving resources from the server.
     *
     * @param path - The URL path to handle (e.g., '/users', '/products')
     * @param handler - The function to handle the request. Receives request and response objects
     *
     * @example
     * ```typescript
     * controller.get('/users', (req, res) => {
     *   res.writeHead(200, { 'Content-Type': 'application/json' });
     *   res.end(JSON.stringify({ users: [] }));
     * });
     * ```
     */
    public get(path: string, handler: ServerRouteHandlerType): void {
        this.routes.GET[path] = handler
    }

    /**
     * Registers a POST route handler for the specified path.
     * Used for creating new resources on the server.
     *
     * @param path - The URL path to handle (e.g., '/users', '/products')
     * @param handler - The function to handle the request. Receives request and response objects
     *
     * @example
     * ```typescript
     * controller.post('/users', (req, res) => {
     *   let body = '';
     *   req.on('data', chunk => { body += chunk.toString() });
     *   req.on('end', () => {
     *     const user = JSON.parse(body);
     *     // Handle user creation
     *     res.end(JSON.stringify({ success: true }));
     *   });
     * });
     * ```
     */
    public post(path: string, handler: ServerRouteHandlerType): void {
        this.routes.POST[path] = handler
    }

    /**
     * Registers a PUT route handler for the specified path.
     * Used for updating existing resources on the server.
     *
     * @param path - The URL path to handle (e.g., '/users/123', '/products/456')
     * @param handler - The function to handle the request. Receives request and response objects
     *
     * @example
     * ```typescript
     * controller.put('/users/:id', (req, res) => {
     *   let body = '';
     *   req.on('data', chunk => { body += chunk.toString() });
     *   req.on('end', () => {
     *     const updates = JSON.parse(body);
     *     // Handle user update
     *     res.end(JSON.stringify({ success: true }));
     *   });
     * });
     * ```
     */
    public put(path: string, handler: ServerRouteHandlerType): void {
        this.routes.PUT[path] = handler
    }

    /**
     * Registers a DELETE route handler for the specified path.
     * Used for removing resources from the server.
     *
     * @param path - The URL path to handle (e.g., '/users/123', '/products/456')
     * @param handler - The function to handle the request. Receives request and response objects
     *
     * @example
     * ```typescript
     * controller.delete('/users/:id', (req, res) => {
     *   // Handle user deletion
     *   res.end(JSON.stringify({ success: true }));
     * });
     * ```
     */
    public delete(path: string, handler: ServerRouteHandlerType): void {
        this.routes.DELETE[path] = handler
    }

    /**
     * Handles incoming HTTP requests by matching them to registered route handlers.
     * This method is called internally to process incoming requests and route them
     * to the appropriate handler based on the HTTP method and path.
     *
     * @param req - The incoming HTTP request object containing method, headers, url, etc.
     * @param res - The HTTP response object used to send back the response
     * @param basePath - The base path to strip from the request URL for proper routing
     *
     * @throws {Error} If the route handler throws an error during execution
     */
    public handleRequest(
        req: IncomingMessage,
        res: ServerResponse,
        basePath: string
    ) {
        const method = req.method as HttpMethods
        let path = req.url?.replace(basePath, '') || '/'

        // Ensure path starts with a slash
        if (!path.startsWith('/')) {
            path = '/' + path
        }

        const routeHandler = this.routes[method]?.[path]

        if (routeHandler) {
            routeHandler(req, res)
        } else {
            res.statusCode = HttpStatusCode.NOT_FOUND
            res.end(JSON.stringify({ error: 'Route not found' }))
        }
    }
}

/**
 * Main server class that manages HTTP server instance and route controllers.
 * Extends SuppressController to provide base routing capabilities.
 *
 * This class serves as the main entry point for creating an HTTP server with
 * modular routing capabilities. It allows you to organize routes into separate
 * controllers and handles the routing of requests to the appropriate controller.
 *
 * @example
 * ```typescript
 * const app = new Suppress();
 *
 * // Add routes directly to the main app
 * app.get('/', (req, res) => {
 *   res.end('Hello World!');
 * });
 *
 * // Create and add a controller for user-related routes
 * const userController = new SuppressController();
 * userController.get('/profile', (req, res) => {
 *   res.end('User Profile');
 * });
 * app.addController('/users', userController);
 *
 * // Start the server
 * app.listen(3000);
 * ```
 */
export class Suppress extends SuppressController {
    private server: Server
    private controllers: Map<string, SuppressController> = new Map()

    /**
     * Initializes a new Suppress server instance.
     */
    constructor() {
        super()
        this.server = createServer((req, res) => {
            this.handleRootRequest(req, res)
        })
    }

    /**
     * Handles incoming HTTP requests by routing them to the appropriate controller.
     * @param req - The incoming HTTP request
     * @param res - The HTTP response object
     */
    private handleRootRequest(req: IncomingMessage, res: ServerResponse) {
        const method = req.method as HttpMethods
        let path = req.url || '/'

        if (!['GET', 'POST', 'PUT', 'DELETE'].includes(method)) {
            res.statusCode = HttpStatusCode.METHOD_NOT_ALLOWED
            return res.end(JSON.stringify({ error: 'Method not allowed' }))
        }

        // Extract the first segment of the path (e.g., "/user/profile" → "user")
        const segments = path.split('/').filter(Boolean)
        const basePath = segments.length > 0 ? `/${segments[0]}` : '/'

        // Check if a controller exists for this base path
        const controller = this.controllers.get(basePath)
        if (controller) {
            return controller.handleRequest(req, res, basePath)
        } else {
            return this.handleRequest(req, res, '/')
        }
    }

    /**
     * Registers a controller for a specific base path.
     * This allows you to organize related routes under a common path prefix
     * and handle them with a dedicated controller instance.
     *
     * @param basePath - The base URL path for the controller (e.g., '/users', '/products')
     * @param controller - The SuppressController instance to handle requests for this path
     *
     * @example
     * ```typescript
     * const app = new Suppress();
     * const userController = new SuppressController();
     *
     * userController.get('/profile', (req, res) => {
     *   // This will handle GET /users/profile
     *   res.end('User Profile');
     * });
     *
     * app.addController('/users', userController);
     * ```
     */
    public addController(
        basePath: string,
        controller: SuppressController
    ): void {
        this.controllers.set(basePath, controller)
    }

    /**
     * Starts the HTTP server on the specified port.
     * Once started, the server will listen for incoming HTTP requests and
     * route them to the appropriate handlers.
     *
     * @param port - The port number to listen on (defaults to 3000)
     *
     * @example
     * ```typescript
     * const app = new Suppress();
     *
     * // Configure routes and controllers...
     *
     * // Start the server on port 8080
     * app.listen(8080);
     * ```
     */
    public listen(port = 3000): void {
        this.server.listen(port, () => {
            console.log(`Server is listening on port ${port}`)
        })
    }
}
