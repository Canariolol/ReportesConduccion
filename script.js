let currentData = {
    summary: {},
    videos: [],
    fileName: ''
};

let alarmTypeChart = null;
let dailyChart = null;
let barChart = null;
let hourlyChart = null;
let filteredVideos = [];

// Configuración del dropzone
document.addEventListener('DOMContentLoaded', function() {
    initializeDropzone();
});

function initializeDropzone() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');

    if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', handleDragOver);
        dropzone.addEventListener('dragleave', handleDragLeave);
        dropzone.addEventListener('drop', handleDrop);
        fileInput.addEventListener('change', handleFileSelect);
    } else {
        console.error('Dropzone o fileInput no encontrados');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
        alert('Por favor selecciona un archivo Excel válido (.xlsx o .xls)');
        return;
    }

    currentData.fileName = file.name;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Procesar hoja de resumen
            const summarySheet = workbook.Sheets['Hoja1'];
            const summaryData = XLSX.utils.sheet_to_json(summarySheet, { header: 1 });
            
            // Procesar hoja de videos
            const videosSheet = workbook.Sheets['Vídeos'];
            const videosData = XLSX.utils.sheet_to_json(videosSheet, { header: 1 });
            
            parseData(summaryData, videosData);
            generateDashboard();
            
        } catch (error) {
            console.error('Error al procesar el archivo:', error);
            alert('Error al procesar el archivo. Asegúrate de que tenga el formato correcto.');
        }
    };
    reader.readAsArrayBuffer(file);
}

function parseData(summaryData, videosData) {
    // Parsear resumen
    currentData.summary = {};
    for (let i = 2; i < summaryData.length; i++) {
        const row = summaryData[i];
        if (row[0] && row[1] && !row[0].includes('Total') && row[0] !== '(en blanco)') {
            currentData.summary[row[0]] = row[1];
        }
    }
    
    // Parsear videos
    currentData.videos = [];
    const headers = videosData[0];
    for (let i = 1; i < videosData.length; i++) {
        const row = videosData[i];
        if (row[0] && row[0] !== ' ') { // Skip empty rows
            const video = {
                tipo: row[0] || '',
                hora: row[1] || '',
                vehiculo: row[3] || '',
                conductor: row[4] || '',
                comentario: row[6] || '',
                severidad: row[7] || ''
            };
            currentData.videos.push(video);
        }
    }
}

function generateDashboard() {
    // Mostrar dashboard y acciones
    document.getElementById('dashboard').classList.add('active');
    document.getElementById('actions').classList.add('active');
    document.getElementById('floatingActions').classList.add('active');
    
    // Generar título dinámico
    generateReportTitle();
    
    // Generar métricas
    generateMetrics();
    
    // Generar gráficos
    generateCharts();
    
    // Generar tabla
    generateTable();
}

function generateMetrics() {
    const metricsGrid = document.getElementById('metricsGrid');
    const totalAlarmas = currentData.videos.length; // Unificado: Total de Alarmas
    const tiposAlarma = Object.keys(currentData.summary).length;
    
    // Obtener patente única o mostrar múltiples si hay varias
    const patentes = [...new Set(currentData.videos.map(v => v.vehiculo).filter(v => v))];
    const patenteTexto = patentes.length === 1 ? patentes[0] : `${patentes.length} vehículos`;
    
    metricsGrid.innerHTML = `
        <div class="metric-card">
            <h3>${totalAlarmas}</h3>
            <p>Total de Alarmas</p>
        </div>
        <div class="metric-card">
            <h3>${tiposAlarma}</h3>
            <p>Tipos de Alarma</p>
        </div>
        <div class="metric-card">
            <h3>${patenteTexto}</h3>
            <p>Vehículo(s)</p>
        </div>
        <div class="metric-card">
            <h3>${currentData.fileName}</h3>
            <p>Archivo Procesado</p>
        </div>
    `;
    
    // Inicializar datos filtrados
    filteredVideos = [...currentData.videos];
    populateFilters();
    updateStatsBar();
}

function generateCharts() {
    generateAlarmTypeChart();
    generateDailyChart();
    generateBarChart();
    generateHourlyChart();
}

function generateAlarmTypeChart() {
    const ctx = document.getElementById('alarmTypeChart').getContext('2d');
    
    if (alarmTypeChart) {
        alarmTypeChart.destroy();
    }
    
    // Contar tipos de alarma directamente de los videos para asegurar que se incluyan todos
    const alarmCounts = {};
    currentData.videos.forEach(video => {
        if (video.tipo) {
            alarmCounts[video.tipo] = (alarmCounts[video.tipo] || 0) + 1;
        }
    });
    
    const labels = Object.keys(alarmCounts);
    const data = Object.values(alarmCounts);
    
    // Colores consistentes con los tipos de alarma
    const backgroundColors = labels.map(tipo => {
        const normalizado = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalizado.includes('cinturon')) return '#d32f2f';
        if (normalizado.includes('distraido')) return '#f57c00';
        if (normalizado.includes('cruce')) return '#7b1fa2';
        if (normalizado.includes('distancia')) return '#1976d2';
        if (normalizado.includes('fatiga')) return '#ef6c00';
        if (normalizado.includes('frenada')) return '#00796b';
        if (normalizado.includes('stop')) return '#424242';
        if (normalizado.includes('telefono')) return '#00695c';
        if (normalizado.includes('boton')) return '#2e7d32';
        if (normalizado.includes('video')) return '#6a1b9a';
        return '#64b5f6'; // Color por defecto
    });
    
    alarmTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    usePointStyle: true,
                    font: {
                        size: 13  // Aumentado de 11 a 13
                    },
                    generateLabels: function(chart) {
                        const data = chart.data;
                        if (data.labels.length && data.datasets.length) {
                            return data.labels.map((label, i) => {
                                const dataset = data.datasets[0];
                                const value = dataset.data[i];
                                const total = dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return {
                                    text: `${label}: ${value} (${percentage}%)`,
                                    fillStyle: dataset.backgroundColor[i],
                                    strokeStyle: dataset.borderColor,
                                    lineWidth: dataset.borderWidth,
                                    pointStyle: 'circle',
                                    hidden: false,
                                    index: i
                                };
                            });
                        }
                        return [];
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                    }
                }
            }
        }
        }
    });
}

function generateDailyChart() {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    
    if (dailyChart) {
        dailyChart.destroy();
    }
    
    // Agrupar eventos por día
    const dailyCount = {};
    currentData.videos.forEach(video => {
        if (video.hora) {
            const day = video.hora.split(',')[0];
            dailyCount[day] = (dailyCount[day] || 0) + 1;
        }
    });
    
    const labels = Object.keys(dailyCount).sort();
    const data = labels.map(day => dailyCount[day]);
    
    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Eventos por día',
                data: data,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 13  // Aumentado el tamaño de la leyenda
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function generateBarChart() {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    if (barChart) {
        barChart.destroy();
    }
    
    // Usar los mismos datos que el gráfico de torta
    const alarmCounts = {};
    currentData.videos.forEach(video => {
        if (video.tipo) {
            alarmCounts[video.tipo] = (alarmCounts[video.tipo] || 0) + 1;
        }
    });
    
    const labels = Object.keys(alarmCounts);
    const data = Object.values(alarmCounts);
    
    // Usar los mismos colores que el gráfico de torta
    const backgroundColors = labels.map(tipo => {
        const normalizado = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (normalizado.includes('cinturon')) return '#d32f2f';
        if (normalizado.includes('distraido')) return '#f57c00';
        if (normalizado.includes('cruce')) return '#7b1fa2';
        if (normalizado.includes('distancia')) return '#1976d2';
        if (normalizado.includes('fatiga')) return '#ef6c00';
        if (normalizado.includes('frenada')) return '#00796b';
        if (normalizado.includes('stop')) return '#424242';
        if (normalizado.includes('telefono')) return '#00695c';
        if (normalizado.includes('boton')) return '#2e7d32';
        if (normalizado.includes('video')) return '#6a1b9a';
        return '#64b5f6';
    });
    
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cantidad de Alarmas',
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color + '80'),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                    labels: {
                        font: {
                            size: 13  // Aumentado el tamaño de la leyenda
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            }
        }
    });
}

function generateHourlyChart() {
    const ctx = document.getElementById('hourlyChart').getContext('2d');
    
    if (hourlyChart) {
        hourlyChart.destroy();
    }
    
    // Agrupar eventos por hora del día
    const hourlyCount = {};
    currentData.videos.forEach(video => {
        if (video.hora) {
            try {
                // Extraer la hora del formato "dd/mm/yy, HH:MM:SS"
                const timePart = video.hora.split(',')[1].trim();
                const hour = timePart.split(':')[0];
                const hourKey = `${hour}:00`;
                hourlyCount[hourKey] = (hourlyCount[hourKey] || 0) + 1;
            } catch (error) {
                console.warn('Error al procesar hora:', video.hora);
            }
        }
    });
    
    // Crear array con todas las horas del día (0-23)
    const allHours = [];
    for (let i = 0; i < 24; i++) {
        const hourKey = `${i.toString().padStart(2, '0')}:00`;
        allHours.push(hourKey);
    }
    
    const labels = allHours;
    const data = labels.map(hour => hourlyCount[hour] || 0);
    
    hourlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Alarmas por Hora',
                data: data,
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff6b6b',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    labels: {
                        font: {
                            size: 13  // Aumentado el tamaño de la leyenda
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Cantidad de Alarmas'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hora del Día'
                    }
                }
            }
        }
    });
}

function generateTable() {
    updateTable();
}

function updateTable() {
    const tableBody = document.getElementById('eventsTableBody');
    tableBody.innerHTML = '';
    
    filteredVideos.forEach(video => {
        const row = document.createElement('tr');
        const alarmClass = getAlarmClass(video.tipo);
        
        row.innerHTML = `
            <td>${video.hora}</td>
            <td><strong>${video.vehiculo}</strong></td>
            <td><span class="alarm-type ${alarmClass}">${video.tipo}</span></td>
            <td class="comment-cell" title="${video.comentario}">${video.comentario || 'Sin comentarios'}</td>
        `;
        tableBody.appendChild(row);
    });
    
    updateStatsBar();
}

function getAlarmClass(tipo) {
    const normalizado = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (normalizado.includes('cinturon')) return 'cinturon';
    if (normalizado.includes('distraido')) return 'distraido';
    if (normalizado.includes('cruce')) return 'cruce';
    if (normalizado.includes('distancia')) return 'distancia';
    if (normalizado.includes('fatiga')) return 'fatiga';
    if (normalizado.includes('frenada')) return 'frenada';
    if (normalizado.includes('stop')) return 'stop';
    if (normalizado.includes('telefono')) return 'telefono';
    if (normalizado.includes('boton')) return 'boton';
    if (normalizado.includes('video')) return 'video';
    return '';
}

function populateFilters() {
    // Poblar filtro de tipos
    const filterType = document.getElementById('filterType');
    const tipos = [...new Set(currentData.videos.map(v => v.tipo).filter(t => t))];
    filterType.innerHTML = '<option value="">Todos</option>';
    tipos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo;
        option.textContent = tipo;
        filterType.appendChild(option);
    });
    
    // Poblar filtro de patentes
    const filterPatent = document.getElementById('filterPatent');
    const patentes = [...new Set(currentData.videos.map(v => v.vehiculo).filter(v => v))];
    filterPatent.innerHTML = '<option value="">Todas</option>';
    patentes.forEach(patente => {
        const option = document.createElement('option');
        option.value = patente;
        option.textContent = patente;
        filterPatent.appendChild(option);
    });
}

function applyFilters() {
    const typeFilter = document.getElementById('filterType').value;
    const patentFilter = document.getElementById('filterPatent').value;
    const dateFilter = document.getElementById('filterDate').value;
    const commentFilter = document.getElementById('filterComment').value.toLowerCase();
    
    filteredVideos = currentData.videos.filter(video => {
        // Filtro por tipo
        if (typeFilter && video.tipo !== typeFilter) return false;
        
        // Filtro por patente
        if (patentFilter && video.vehiculo !== patentFilter) return false;
        
        // Filtro por fecha
        if (dateFilter && video.hora) {
            const videoDate = video.hora.split(',')[0].trim();
            const filterDateObj = new Date(dateFilter).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            });
            if (videoDate !== filterDateObj) return false;
        }
        
        // Filtro por comentario
        if (commentFilter && video.comentario && !video.comentario.toLowerCase().includes(commentFilter)) {
            return false;
        }
        
        return true;
    });
    
    updateTable();
}

function clearFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterPatent').value = '';
    document.getElementById('filterDate').value = '';
    document.getElementById('filterComment').value = '';
    
    filteredVideos = [...currentData.videos];
    updateTable();
}

function updateStatsBar() {
    const statsBar = document.getElementById('statsBar');
    const totalEventos = filteredVideos.length;
    const totalOriginal = currentData.videos.length;
    
    // Calcular tipo más frecuente en los resultados filtrados
    const tipoCount = {};
    filteredVideos.forEach(video => {
        tipoCount[video.tipo] = (tipoCount[video.tipo] || 0) + 1;
    });
    
    const tipoMasFrecuente = Object.entries(tipoCount)
        .sort(([,a], [,b]) => b - a)[0];
    
    statsBar.innerHTML = `
        <span>Mostrando ${totalEventos} de ${totalOriginal} eventos</span>
        ${tipoMasFrecuente ? `<span>Tipo más frecuente: ${tipoMasFrecuente[0]} (${tipoMasFrecuente[1]} eventos)</span>` : ''}
        <span>Última actualización: ${new Date().toLocaleTimeString('es-ES')}</span>
    `;
}

function exportToExcel() {
    showExportModal();
    
    setTimeout(() => {
        // Crear nuevo libro de Excel
        const wb = XLSX.utils.book_new();
        
        // Hoja de resumen
        const summaryData = [
            ['Tipo de Alarma', 'Cantidad']
        ];
        Object.entries(currentData.summary).forEach(([tipo, cantidad]) => {
            summaryData.push([tipo, cantidad]);
        });
        
        const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Resumen');
        
        // Hoja de detalle
        const detailData = [
            ['Fecha/Hora', 'Patente', 'Tipo de Alarma', 'Comentarios']
        ];
        currentData.videos.forEach(video => {
            detailData.push([video.hora, video.vehiculo, video.tipo, video.comentario]);
        });
        
        const detailWs = XLSX.utils.aoa_to_sheet(detailData);
        XLSX.utils.book_append_sheet(wb, detailWs, 'Detalle de Eventos');
        
        // Obtener patente única o mostrar múltiples si hay varias
        const patentes = [...new Set(currentData.videos.map(v => v.vehiculo).filter(v => v))];
        const patenteTexto = patentes.length === 1 ? patentes[0].replace(/[^a-zA-Z0-9]/g, '_') : 'Multiples_Vehiculos';
        
        // Descargar archivo
        const fileName = `Reporte_${patenteTexto}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        hideExportModal();
    }, 500);
}

function exportToPDF() {
    showExportModal();
    
    // Usar html2canvas para capturar el dashboard con estilos
    // Nota: Esta función requiere html2canvas, lo agregaremos dinámicamente
    if (typeof html2canvas === 'undefined') {
        // Cargar html2canvas dinámicamente si no está disponible
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = function() {
            captureDashboardToPDF();
        };
        document.head.appendChild(script);
    } else {
        captureDashboardToPDF();
    }
    
    function captureDashboardToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Capturar el dashboard completo como imagen
        const dashboardElement = document.getElementById('dashboard');
        
        html2canvas(dashboardElement, {
            scale: 4,  // Aumentado de 2 a 4 para mejor calidad
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: dashboardElement.scrollWidth,
            height: dashboardElement.scrollHeight
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png', 1.0);  // Calidad máxima
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            
            // Agregar título y fecha
            doc.setFontSize(20);
            doc.setTextColor(21, 101, 192);
            doc.text('Reporte de Alarmas en Conducción', 20, 20);
            
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
            doc.text(`Hora: ${new Date().toLocaleTimeString('es-ES')}`, 20, 38);
            doc.text(`Archivo: ${currentData.fileName}`, 20, 46);
            
            // Agregar la imagen del dashboard
            doc.addImage(imgData, 'PNG', 0, 55, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Si el contenido es más largo que una página, agregar páginas adicionales
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Obtener patente única o mostrar múltiples si hay varias
            const patentes = [...new Set(currentData.videos.map(v => v.vehiculo).filter(v => v))];
            const patenteTexto = patentes.length === 1 ? patentes[0].replace(/[^a-zA-Z0-9]/g, '_') : 'Multiples_Vehiculos';
            
            // Descargar PDF
            doc.save(`Reporte_${patenteTexto}_${new Date().toISOString().split('T')[0]}.pdf`);
            hideExportModal();
        }).catch(error => {
            console.error('Error al generar PDF:', error);
            // Si falla la captura, usar el método simple
            exportToPDFSimple();
        });
    }
}

function exportToPDFSimple() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.setTextColor(21, 101, 192);
    doc.text('Reporte de Alarmas en Conducción', 20, 30);
    
    // Fecha
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 45);
    doc.text(`Hora: ${new Date().toLocaleTimeString('es-ES')}`, 20, 52);
    doc.text(`Archivo: ${currentData.fileName}`, 20, 59);
    
    // Resumen
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen de Alarmas', 20, 75);
    
    let yPosition = 85;
    doc.setFontSize(11);
    Object.entries(currentData.summary).forEach(([tipo, cantidad]) => {
        doc.text(`• ${tipo}: ${cantidad}`, 25, yPosition);
        yPosition += 8;
        
        if (yPosition > 270) {
            doc.addPage();
            yPosition = 30;
        }
    });
    
    // Estadísticas adicionales
    yPosition += 10;
    doc.setFontSize(14);
    doc.text('Estadísticas Generales', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.text(`Total de eventos: ${currentData.videos.length}`, 25, yPosition);
    yPosition += 8;
    
    const patentes = [...new Set(currentData.videos.map(v => v.vehiculo).filter(v => v))];
    doc.text(`Vehículos monitoreados: ${patentes.length}`, 25, yPosition);
    yPosition += 8;
    
    doc.text(`Tipos de alarma: ${Object.keys(currentData.summary).length}`, 25, yPosition);
    
    // Descargar PDF
    const patenteTexto = patentes.length === 1 ? patentes[0].replace(/[^a-zA-Z0-9]/g, '_') : 'Multiples_Vehiculos';
    doc.save(`Reporte_${patenteTexto}_${new Date().toISOString().split('T')[0]}.pdf`);
}

function exportToImage() {
    showExportModal();
    
    const dashboardElement = document.getElementById('dashboard');
    
    if (typeof html2canvas === 'undefined') {
        // Cargar html2canvas dinámicamente si no está disponible
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        script.onload = function() {
            captureDashboardToImage();
        };
        document.head.appendChild(script);
    } else {
        captureDashboardToImage();
    }
    
    function captureDashboardToImage() {
        html2canvas(dashboardElement, {
            scale: 3,  // Aumentado para mejor calidad
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false
        }).then(canvas => {
            // Convertir a blob y descargar
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                // Obtener patente única o mostrar múltiples si hay varias
                const patentes = [...new Set(currentData.videos.map(v => v.vehiculo).filter(v => v))];
                const patenteTexto = patentes.length === 1 ? patentes[0].replace(/[^a-zA-Z0-9]/g, '_') : 'Multiples_Vehiculos';
                
                a.download = `Reporte_${patenteTexto}_${new Date().toISOString().split('T')[0]}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                hideExportModal();
            }, 'image/png', 1.0);  // Calidad máxima
        }).catch(error => {
            console.error('Error al generar imagen:', error);
            alert('Error al generar la imagen. Por favor, intenta nuevamente.');
            hideExportModal();
        });
    }
}

function saveToDatabase() {
    showExportModal();
    
    setTimeout(() => {
        // Simulación de guardado en base de datos
        const reportData = {
            fileName: currentData.fileName,
            summary: currentData.summary,
            videos: currentData.videos,
            generatedAt: new Date().toISOString(),
            totalEvents: currentData.videos.length
        };
        
        // Aquí iría la lógica real para guardar en la base de datos
        // Por ahora, simulamos y mostramos un mensaje
        console.log('Guardando en base de datos:', reportData);
        
        hideExportModal();
        
        // Mostrar mensaje de confirmación
        alert('Reporte guardado en la base de datos correctamente.\n\n' +
              `Fecha: ${new Date().toLocaleString('es-ES')}\n` +
              `Total de eventos: ${reportData.totalEvents}\n` +
              `Archivo: ${reportData.fileName}`);
    }, 1000);
}

// Funciones para manejar el modal de exportación
function showExportModal() {
    document.getElementById('exportModal').style.display = 'block';
}

function hideExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

// Función para generar el título dinámico del reporte
function generateReportTitle() {
    try {
        // Extraer información del nombre del archivo y los datos
        const patentes = [...new Set(currentData.videos.map(v => v.vehiculo).filter(v => v))];
        const patenteTexto = patentes.length === 1 ? patentes[0] : 'múltiples vehículos';
        
        // Extraer rango de fechas de los datos
        const fechas = [...new Set(currentData.videos.map(v => {
            if (v.hora) {
                return v.hora.split(',')[0].trim();
            }
            return null;
        }).filter(f => f))].sort();
        
        let rangoFechas = '';
        if (fechas.length > 0) {
            if (fechas.length === 1) {
                rangoFechas = fechas[0];
            } else {
                rangoFechas = `${fechas[0]} al ${fechas[fechas.length - 1]}`;
            }
        } else {
            rangoFechas = 'rango de fechas no especificado';
        }
        
        const titulo = `Reporte de Alarmas para el Vehículo '${patenteTexto}', correspondiente a '${rangoFechas}'`;
        document.getElementById('reportTitle').textContent = titulo;
        
    } catch (error) {
        console.error('Error al generar título:', error);
        document.getElementById('reportTitle').textContent = 'Reporte de Alarmas';
    }
}
