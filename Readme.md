# Seneca Tutorial

## Client-Server Connection

. Default port for client and server is 10101.
. Both seneca.client and seneca.listen accept the following params..
. => port: optional integer; port number
. => host: optional string; host IP address
. => spec: optional object; full specification object

. <b>On windows machines, if no host is specified, the client will try to connect to host at `0.0.0.0` which won't work. To get around this, set <host> to be `localhost`.</b>

. As long as the client & listen parameters are the same, the two services can communicate.

### Examples

1. `seneca.client(8080)` → `seneca.listen(8080)`
2. `seneca.client(8080, '192.168.0.2')` → `seneca.listen(8080, '192.168.0.2')` 
3. `seneca.client({ port: 8080, host: '192.168.0.2' })` → `seneca.listen({ port: 8080, host: '192.168.0.2' })` 


. Seneca provides transport <b>transport independence</b> because your business logic does not need to know how messages are transported or which service will get them.

. Another transport that you can use (asides HTTP) is TCP connections. Seneca provides both HTTP & TCP options via the built-in transport.

`seneca.client({type: 'tcp})` -> `seneca.listen({type: 'tcp'})`