# Suppress Framework Documentation

## Overview
Suppress is a lightweight HTTP server framework built in TypeScript, inspired by Express.js. It provides routing capabilities through `RouteController` instances and allows for organized route management.

## Classes

### RouteController
The `RouteController` class is responsible for managing routes and handling HTTP requests.

#### Properties
- `private routes: ServerRoutesMap`
    - A map containing routes categorized by HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).

#### Methods
- `get(path: string, handler: ServerRouteHandlerType): void`
    - Registers a `GET` route handler.
- `post(path: string, handler: ServerRouteHandlerType): void`
    - Registers a `POST` route handler.
- `put(path: string, handler: ServerRouteHandlerType): void`
    - Registers a `PUT` route handler.
- `delete(path: string, handler: ServerRouteHandlerType): void`
    - Registers a `DELETE` route handler.
- `handleRequest(req: IncomingMessage, res: ServerResponse, basePath: string): void`
    - Handles incoming HTTP requests by checking if a registered route matches the request method and path.
    - If a handler is found, it is executed; otherwise, a `404 Route not found` response is returned.

### Suppress
The `Suppress` class extends `RouteController` and acts as the main HTTP server.

#### Properties
- `private server: Server`
    - The HTTP server instance.
- `private controllers: Map<string, RouteController>`
    - A map storing registered route controllers based on their base path.

#### Methods
- `handleRequest(req: IncomingMessage, res: ServerResponse): void`
    - Overrides `handleRequest` to delegate requests to appropriate `RouteController` instances.
    - Extracts the first segment of the request path to determine the responsible controller.
- `addController(basePath: string, controller: RouteController): void`
    - Registers a `RouteController` at a specified base path.
- `listen(port: number = 3000): void`
    - Starts the HTTP server and listens on the specified port.

## Example Usage
```typescript
const app = new Suppress()

const userController = new RouteController()
userController.get('/profile', (req, res) => {
    res.end(JSON.stringify({ message: 'User Profile' }))
})

app.addController('/user', userController)
app.listen(3000)
```

## Response Codes
- `200 OK`: Successful request.
- `404 NOT_FOUND`: Route not found.
- `405 METHOD_NOT_ALLOWED`: Unsupported HTTP method.

## Notes
- Ensure that all routes are registered under a controller.
- The root path (`/`) should be handled explicitly by a controller if needed.

## Future Enhancements
- Middleware support.
- Parameterized routes.
- Error handling middleware.

This documentation provides an overview of the Suppress framework and its capabilities.

