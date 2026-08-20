// Esta función se ejecuta cuando alguien envía el formulario (POST a /api/guardar)
// Guarda los datos en un KV (base de datos clave-valor de Cloudflare) llamado MENSAJES

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Leemos los datos que envió el formulario
        const datos = await request.json();

        // Validación básica: que no venga vacío
        if (!datos.nombre || !datos.mensaje) {
            return new Response(JSON.stringify({ error: 'Faltan datos' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Creamos una clave única usando la fecha y un identificador aleatorio
        const clave = 'mensaje:' + Date.now() + '-' + crypto.randomUUID().slice(0, 8);

        // Guardamos en el KV (env.MENSAJES es el "binding" que configuras en Cloudflare)
        await env.MENSAJES.put(clave, JSON.stringify({
            nombre: datos.nombre,
            mensaje: datos.mensaje,
            fecha: new Date().toISOString()
        }));

        // Respondemos que todo salió bien
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
