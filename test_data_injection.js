// Script para inyectar datos de prueba en la aplicación
// Copiar y pegar este código en la consola del navegador cuando estés en la aplicación

// Datos de prueba basados en el archivo generado
const testData = {
  id: "test-report-123",
  user_id: "demo_user",
  file_name: "Reporte StandLite2 - 3 camiones - 20 al 26 de octubre.xlsx",
  vehicle_plate: "YHLE15",
  date_range: {
    start: "20/10/2025",
    end: "26/10/2025"
  },
  summary: {
    totalAlarms: 50,
    alarmTypes: {
      "Conductor distraído": 20,
      "Cruce de carril": 12,
      "Cinturón de seguridad": 6,
      "Infracción de señal de stop": 4,
      "Fatiga": 2,
      "Teléfono Móvil": 5,
      "Distancia de Seguridad": 1
    },
    videosRequested: 0
  },
  events: [
    { timestamp: "20/10/25, 08:30:15", alarmType: "Conductor distraído", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Conductor mirando hacia abajo por más de 3 segundos.", severity: "Moderado" },
    { timestamp: "20/10/25, 09:15:22", alarmType: "Cruce de carril", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Cambio de carril sin señalizar debidamente.", severity: "Leve" },
    { timestamp: "20/10/25, 10:45:33", alarmType: "Cinturón de seguridad", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Conductor sin cinturón de seguridad detectado.", severity: "Grave" },
    { timestamp: "20/10/25, 11:20:44", alarmType: "Conductor distraído", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Detección de distracción visual prolongada.", severity: "Moderado" },
    { timestamp: "20/10/25, 14:30:55", alarmType: "Teléfono Móvil", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Uso de teléfono móvil mientras conduce detectado.", severity: "Grave" },
    { timestamp: "20/10/25, 15:45:12", alarmType: "Cruce de carril", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Vehículo cruzando línea continua de carril.", severity: "Moderado" },
    { timestamp: "20/10/25, 16:10:28", alarmType: "Conductor distraído", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Conductor no mantiene atención en la carretera.", severity: "Leve" },
    { timestamp: "20/10/25, 17:35:41", alarmType: "Infracción de señal de stop", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Vehículo no detuvo completamente en señal de stop.", severity: "Grave" },
    { timestamp: "20/10/25, 18:20:08", alarmType: "Fatiga", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Signos de fatiga detectados en el conductor.", severity: "Crítico" },
    { timestamp: "21/10/25, 07:45:19", alarmType: "Conductor distraído", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Posible uso de dispositivo móvil detectado.", severity: "Moderado" },
    { timestamp: "21/10/25, 09:12:34", alarmType: "Cruce de carril", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Maniobra de cambio de carril peligrosa detectada.", severity: "Moderado" },
    { timestamp: "21/10/25, 10:30:45", alarmType: "Teléfono Móvil", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Conductor manipulando dispositivo electrónico.", severity: "Grave" },
    { timestamp: "21/10/25, 11:45:56", alarmType: "Conductor distraído", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Detección de distracción visual prolongada.", severity: "Leve" },
    { timestamp: "21/10/25, 14:20:12", alarmType: "Cinturón de seguridad", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Sensor de cinturón desactivado durante la conducción.", severity: "Grave" },
    { timestamp: "21/10/25, 15:35:28", alarmType: "Cruce de carril", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Cruce involuntario de carril detectado.", severity: "Leve" },
    { timestamp: "21/10/25, 16:50:41", alarmType: "Conductor distraído", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Conductor mirando hacia abajo por más de 3 segundos.", severity: "Moderado" },
    { timestamp: "21/10/25, 18:15:55", alarmType: "Distancia de Seguridad", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Distancia de seguimiento demasiado corta.", severity: "Crítico" },
    { timestamp: "22/10/25, 08:30:08", alarmType: "Conductor distraído", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Detección de distracción visual prolongada.", severity: "Leve" },
    { timestamp: "22/10/25, 09:45:22", alarmType: "Cruce de carril", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Cambio de carril sin señalizar debidamente.", severity: "Moderado" },
    { timestamp: "22/10/25, 11:10:35", alarmType: "Infracción de señal de stop", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Paso semaforizado sin detención completa.", severity: "Grave" },
    { timestamp: "22/10/25, 14:35:48", alarmType: "Conductor distraído", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Conductor no mantiene atención en la carretera.", severity: "Moderado" },
    { timestamp: "22/10/25, 16:20:12", alarmType: "Teléfono Móvil", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Detección de teléfono en mano durante conducción.", severity: "Grave" },
    { timestamp: "22/10/25, 17:45:25", alarmType: "Cruce de carril", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Vehículo cruzando línea continua de carril.", severity: "Leve" },
    { timestamp: "22/10/25, 19:10:38", alarmType: "Conductor distraído", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Posible uso de dispositivo móvil detectado.", severity: "Moderado" },
    { timestamp: "23/10/25, 07:25:51", alarmType: "Cinturón de seguridad", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Cinturón de seguridad no abrochado al iniciar viaje.", severity: "Grave" },
    { timestamp: "23/10/25, 09:40:14", alarmType: "Conductor distraído", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Detección de distracción visual prolongada.", severity: "Leve" },
    { timestamp: "23/10/25, 11:55:27", alarmType: "Cruce de carril", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Maniobra de cambio de carril peligrosa detectada.", severity: "Moderado" },
    { timestamp: "23/10/25, 14:20:43", alarmType: "Teléfono Móvil", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Uso de celular prohibido detectado por cámara.", severity: "Grave" },
    { timestamp: "23/10/25, 16:35:56", alarmType: "Conductor distraído", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Conductor mirando hacia abajo por más de 3 segundos.", severity: "Moderado" },
    { timestamp: "23/10/25, 18:50:09", alarmType: "Fatiga", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Bostezos frecuentes y somnolencia detectada.", severity: "Crítico" },
    { timestamp: "24/10/25, 08:15:22", alarmType: "Conductor distraído", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Detección de distracción visual prolongada.", severity: "Leve" },
    { timestamp: "24/10/25, 10:30:35", alarmType: "Cruce de carril", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Cruce involuntario de carril detectado.", severity: "Moderado" },
    { timestamp: "24/10/25, 12:45:48", alarmType: "Infracción de señal de stop", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Detención parcial en señal de stop.", severity: "Grave" },
    { timestamp: "24/10/25, 15:10:01", alarmType: "Conductor distraído", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Conductor no mantiene atención en la carretera.", severity: "Moderado" },
    { timestamp: "24/10/25, 17:25:14", alarmType: "Cinturón de seguridad", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Detección de cinturón desabrochado en movimiento.", severity: "Grave" },
    { timestamp: "24/10/25, 19:40:27", alarmType: "Cruce de carril", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Cambio de carril sin señalizar debidamente.", severity: "Leve" },
    { timestamp: "25/10/25, 07:55:40", alarmType: "Conductor distraído", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Posible uso de dispositivo móvil detectado.", severity: "Moderado" },
    { timestamp: "25/10/25, 10:10:53", alarmType: "Teléfono Móvil", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Conductor manipulando dispositivo electrónico.", severity: "Grave" },
    { timestamp: "25/10/25, 12:25:06", alarmType: "Conductor distraído", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Detección de distracción visual prolongada.", severity: "Leve" },
    { timestamp: "25/10/25, 14:40:19", alarmType: "Cruce de carril", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Vehículo cruzando línea continua de carril.", severity: "Moderado" },
    { timestamp: "25/10/25, 16:55:32", alarmType: "Conductor distraído", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Conductor mirando hacia abajo por más de 3 segundos.", severity: "Moderado" },
    { timestamp: "25/10/25, 19:10:45", alarmType: "Infracción de señal de stop", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Infracción de señal de alto detectada.", severity: "Grave" },
    { timestamp: "26/10/25, 08:25:58", alarmType: "Conductor distraído", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Detección de distracción visual prolongada.", severity: "Leve" },
    { timestamp: "26/10/25", alarmType: "Cruce de carril", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Maniobra de cambio de carril peligrosa detectada.", severity: "Moderado" },
    { timestamp: "26/10/25, 11:40:11", alarmType: "Conductor distraído", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Conductor no mantiene atención en la carretera.", severity: "Moderado" },
    { timestamp: "26/10/25, 14:55:24", alarmType: "Teléfono Móvil", vehiclePlate: "YHLE15", driver: "Juan Pérez Silva (StandLite2)", comments: "Uso de teléfono móvil mientras conduce detectado.", severity: "Grave" },
    { timestamp: "26/10/25, 17:10:37", alarmType: "Cruce de carril", vehiclePlate: "MPGJ87", driver: "María González Rodríguez (StandLite2)", comments: "Cruce involuntario de carril detectado.", severity: "Leve" },
    { timestamp: "26/10/25, 19:25:50", alarmType: "Conductor distraído", vehiclePlate: "QRIL76", driver: "Carlos López Muñoz (StandLite2)", comments: "Posible uso de dispositivo móvil detectado.", severity: "Moderado" }
  ],
  charts: {
    alarmTypeDistribution: {
      labels: ["Conductor distraído", "Cruce de carril", "Cinturón de seguridad", "Infracción de señal de stop", "Fatiga", "Teléfono Móvil", "Distancia de Seguridad"],
      data: [20, 12, 6, 4, 2, 5, 1],
      backgroundColor: ["#ffa724ff", "#7c14a5ff", "#b71c1c", "#424242", "#42b4b8ff", "#2e7400ff", "#0d47a1"]
    },
    dailyEvolution: {
      labels: ["20/10", "21/10", "22/10", "23/10", "24/10", "25/10", "26/10"],
      data: [5, 6, 7, 6, 6, 6, 4]
    },
    hourlyDistribution: {
      labels: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
      data: [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 4, 0, 0, 4, 3, 4, 3, 4, 4, 0, 0, 0, 0]
    }
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  status: "processed",
  operation: "upsert"
};

// Función para inyectar los datos en el store de Redux
function injectTestData() {
  // Obtener el store de Redux desde la ventana global
  const store = window.__REDUX_STORE__;
  
  if (!store) {
    console.error('No se encontró el store de Redux. Asegúrate de estar en la aplicación.');
    return;
  }
  
  // Despachar la acción para establecer el reporte actual
  store.dispatch({
    type: 'excel/uploadExcel/fulfilled',
    payload: testData
  });
  
  console.log('Datos de prueba inyectados exitosamente');
  console.log('Ahora puedes navegar a la página de Rankings para probar la generación de PDF');
}

// Ejecutar la inyección de datos
injectTestData();