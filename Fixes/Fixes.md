# 2025-10-13 Mejoras

## Frontend
- Ajustado el pie chart para usar un naranja mas claro y ocultar etiquetas cuando el porcentaje es menor al umbral definido, evitando colores similares y valores superpuestos.
- Truncado dinamicamente los textos del reporte PDF (tipo de alarma, patente, conductor y comentarios) segun el ancho disponible para cada columna, evitando solapamientos en tablas largas.
- Alineado el contenido de la columna Tipo del PDF con el encabezado correspondiente.
- Forzada la generación de fechas/hora en el fallback de exportaciones (Excel/PDF) a la zona horaria America/Santiago para mantener consistencia con el backend.

## Backend
- Normalizada la fecha/hora del resumen del Excel exportado a la zona horaria America/Santiago para reflejar correctamente la hora local del reporte.
- Ajustado el timestamp del nombre de archivo Excel generado via API para usar la zona America/Santiago.

# 24-09 Todos los fixes OK

## Frontend
- Selectores de fechas en sección de filtros marcan un día menos que el seleccionado
- Agregar modales+spinner para cuando se carga un archivo y se exporta un reporte
- Agregar conteo al final de los eventos filtrados que indique cuantos eventos se están mostrando del total de eventos (ejemplo: "Mostrando 15 de 30 eventos" donde se vean la cantidad de eventos que se muestran luego de aplicar filtros, comparando con la cantidad de eventos totales, sin aplicar filtros)
- Agregar footer estático con logo de marca registrada y luego que diga "Creado con <3 por Rodrigo Yáñez G. - Ninfa Solutions" y justo abajo, en fuente más pequeña el correo "admin@ninfasolutions.com"


## Backend
- Api debe diferenciar las hojas del archivo subido como primera y segunda hoja sin importar el nombre que tengan.
- Mejorar diseño del Excel usando el archivo referenciaReporte.xlsx en la carpeta de referencias
- Corregir interacción con db (errores como Error getting user reports: object QueryResultsList can't be used in 'await' expression o "GET /api/v1/reports?user_id=demo_user HTTP/1.1" 400 Bad Request)


# Proximos fixes planeados

## Frontend
- Refinar filtros y su comportamiento


## Backend
- Refinar comportamiendo de los endpoints y como se están guardando los reportes (por ahora se guardan los reportes de los archivos subidos y de los archivos generados, solo deben guardarse los subidos)

