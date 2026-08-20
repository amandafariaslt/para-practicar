// Función extra: te permite VER los mensajes guardados
// Solo abre en tu navegador: https://tu-sitio.pages.dev/api/mensajes

export async function onRequestGet(context) {
    const { env } = context;

    try {
        // Listamos todas las claves que empiecen con "mensaje:"
        const lista = await env.MENSAJES.list({ prefix: 'mensaje:' });

        // Recuperamos el contenido de cada una
        const mensajes = [];
        for (const clave of lista.keys) {
            const valor = await env.MENSAJES.get(clave.name);
            if (valor) {
                mensajes.push(JSON.parse(valor));
            }
        }

        // Devolvemos todos los mensajes como JSON
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
