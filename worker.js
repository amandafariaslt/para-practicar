// worker.js - Script principal del Worker
// Maneja las rutas /api/* y sirve los archivos HTML para todo lo demás

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // RUTA 1: Guardar un mensaje (cuando el formulario envía datos)
        if (url.pathname === '/api/guardar' && request.method === 'POST') {
            try {
                const datos = await request.json();

                // Validación básica
                if (!datos.nombre || !datos.mensaje) {
                    return new Response(JSON.stringify({ error: 'Faltan datos' }), {
                        status: 400,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }

                // Clave única con fecha + identificador aleatorio
                const clave = 'mensaje:' + Date.now() + '-' + crypto.randomUUID().slice(0, 8);

                // Guardamos en el KV (el binding MENSAJES)
                await env.MENSAJES.put(clave, JSON.stringify({
                    nombre: datos.nombre,
                    mensaje: datos.mensaje,
                    fecha: new Date().toISOString()
                }));

                return new Response(JSON.stringify({ ok: true }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: 'Error del servidor' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // RUTA 2: Ver todos los mensajes guardados
        if (url.pathname === '/api/mensajes' && request.method === 'GET') {
            try {
                const lista = await env.MENSAJES.list({ prefix: 'mensaje:' });

                const mensajes = [];
                for (const clave of lista.keys) {
                    const valor = await env.MENSAJES.get(clave.name);
                    if (valor) {
                        mensajes.push(JSON.parse(valor));
                    }
                }

                return new Response(JSON.stringify(mensajes, null, 2), {
                    headers: { 'Content-Type': 'application/json; charset=utf-8' }
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: 'Error del servidor' }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // TODO LO DEMÁS: servir los archivos HTML de la carpeta public
        return env.ASSETS.fetch(request);
    }
};
