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
- Cambiar de lugar el footer, mejorar su visual, que esté estático en la sección inferior de la pantalla


## Backend
- El pdf generado no está mostrando los gráficos centrados en la hoja