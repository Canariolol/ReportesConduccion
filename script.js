let currentData = {
    summary: {},
    videos: [],
    videosSolicitados: [],
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
    
    // Parsear hoja videos
    currentData.videos = [];
    currentData.videosSolicitados = []; // Array separado para videos solicitados
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
            
            // Separar videos solicitados del resto de alarmas
            if (video.tipo.toLowerCase().includes('video solicitado') || video.tipo.toLowerCase().includes('vídeo solicitado')) {
                currentData.videosSolicitados.push(video);
            } else {
                currentData.videos.push(video);
            }
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
    const totalAlarmas = currentData.videos.length; // Total de Alarmas (excluyendo videos solicitados)
    const videosSolicitados = currentData.videosSolicitados.length; // Total de Videos Solicitados
    
    // Contar tipos de alarma reales de los datos (excluyendo videos solicitados)
    const tiposAlarmaSet = new Set();
    currentData.videos.forEach(video => {
        if (video.tipo && !video.tipo.toLowerCase().includes('video solicitado') && !video.tipo.toLowerCase().includes('vídeo solicitado')) {
            tiposAlarmaSet.add(video.tipo);
        }
    });
    const tiposAlarma = tiposAlarmaSet.size;
    
    // Obtener patente única o mostrar múltiples si hay varias
    const todasLasPatentes = [...new Set([
        ...currentData.videos.map(v => v.vehiculo),
        ...currentData.videosSolicitados.map(v => v.vehiculo)
    ].filter(v => v))];
    const patenteTexto = todasLasPatentes.length === 1 ? todasLasPatentes[0] : `${todasLasPatentes.length} vehículos`;
    
    metricsGrid.innerHTML = `
        <div class="metric-card">
            <h3>${totalAlarmas}</h3>
            <p>Total de Alarmas</p>
        </div>
        <div class="metric-card">
            <h3>${videosSolicitados}</h3>
            <p>Videos Solicitados</p>
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
    
    // Contar tipos de alarma usando los datos filtrados
    const alarmCounts = {};
    filteredVideos.forEach(video => {
        if (video.tipo && !video.tipo.toLowerCase().includes('video solicitado') && !video.tipo.toLowerCase().includes('vídeo solicitado')) {
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
    
    // Agrupar eventos por día usando datos filtrados
    const dailyCount = {};
    filteredVideos.forEach(video => {
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
    
    // Usar los mismos datos que el gráfico de torta (datos filtrados)
    const alarmCounts = {};
    filteredVideos.forEach(video => {
        if (video.tipo && !video.tipo.toLowerCase().includes('video solicitado') && !video.tipo.toLowerCase().includes('vídeo solicitado')) {
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
    
    // Agrupar eventos por hora del día usando datos filtrados
    const hourlyCount = {};
    filteredVideos.forEach(video => {
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
    
    // Actualizar tabla y gráficos
    updateTable();
    updateChartsWithFilters();
}

function updateChartsWithFilters() {
    // Actualizar gráficos con los datos filtrados
    generateAlarmTypeChart();
    generateDailyChart();
    generateBarChart();
    generateHourlyChart();
}

function clearFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterPatent').value = '';
    document.getElementById('filterDate').value = '';
    document.getElementById('filterComment').value = '';
    
    filteredVideos = [...currentData.videos];
    updateTable();
    updateChartsWithFilters();
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
    
    // Verificar si jsPDF está disponible
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF === 'undefined') {
        console.error('jsPDF no está disponible');
        alert('Error: La biblioteca jsPDF no está cargada correctamente. Por favor, recarga la página e intenta nuevamente.');
        hideExportModal();
        return;
    }
    
    // Usar el método híbrido que captura la visualización completa
    exportToPDFHybrid();
}

function exportToPDFHybrid() {
    // Verificar si html2canvas está disponible
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
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Configuración de la página
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        
        // Cargar logo para agregarlo a cada página
        const logoImg = new Image();
        logoImg.onload = function() {
            // Función para agregar logo a una página específica
            function addLogoToPage(pageNumber) {
                if (pageNumber > 0) {
                    pdf.setPage(pageNumber);
                    const logoWidth = 25;
                    const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
                    pdf.addImage(logoImg, 'PNG', margin, margin, logoWidth, logoHeight);
                }
            }
            
            // Función para agregar pie de página a una página específica
            function addFooterToPage(pageNumber) {
                if (pageNumber > 0) {
                    pdf.setPage(pageNumber);
                    pdf.setFontSize(8);
                    pdf.setTextColor(150, 150, 150);
                    const footerText = `Generado por West Fleet Solutions - Página ${pageNumber}`;
                    pdf.text(footerText, pageWidth - margin, pageHeight - 10, { align: 'right' });
                }
            }
            
            // Capturar diferentes secciones del dashboard por separado
            const dashboardElement = document.getElementById('dashboard');
            const sections = [
                { element: document.querySelector('#reportTitle'), name: 'Título' },
                { element: document.querySelector('.metrics-grid'), name: 'Métricas' },
                { element: document.querySelector('.filters'), name: 'Filtros' },
                { element: document.querySelector('.charts-grid'), name: 'Gráficos' },
                { element: document.querySelector('.table-container'), name: 'Tabla' }
            ];
            
            let currentPage = 1;
            let yPosition = margin + 30; // Espacio para el logo
            
            // Agregar logo a la primera página
            addLogoToPage(currentPage);
            
            // Procesar cada sección
            const sectionPromises = sections.map((section, index) => {
                return new Promise((resolve) => {
                    if (!section.element) {
                        resolve();
                        return;
                    }
                    
                    html2canvas(section.element, {
                        scale: 1.5,  // Calidad moderada para reducir tamaño
                        useCORS: true,
                        backgroundColor: '#ffffff',
                        logging: false,
                        width: section.element.scrollWidth,
                        height: section.element.scrollHeight
                    }).then(canvas => {
                        const imgData = canvas.toDataURL('image/jpeg', 0.7); // JPEG con compresión
                        
                        const maxWidth = pageWidth - 2 * margin;
                        const imgHeight = (canvas.height * maxWidth) / canvas.width;
                        
                        // Verificar si necesitamos una nueva página
                        if (yPosition + imgHeight > pageHeight - margin - 20) {
                            currentPage++;
                            pdf.addPage();
                            addLogoToPage(currentPage);
                            yPosition = margin + 30;
                        }
                        
                        // Agregar la sección
                        pdf.addImage(imgData, 'JPEG', margin, yPosition, maxWidth, imgHeight);
                        yPosition += imgHeight + 10;
                        
                        resolve();
                    }).catch(() => {
                        resolve();
                    });
                });
            });
            
            // Esperar a que todas las secciones se procesen
            Promise.all(sectionPromises).then(() => {
                // Agregar pie de página a todas las páginas
                for (let i = 1; i <= currentPage; i++) {
                    addFooterToPage(i);
                }
                
                // Obtener patente única o mostrar múltiples si hay varias
                const patentes = [...new Set(currentData.videos.map(v => v.vehiculo).filter(v => v))];
                const patenteTexto = patentes.length === 1 ? patentes[0].replace(/[^a-zA-Z0-9]/g, '_') : 'Multiples_Vehiculos';
                
                // Descargar PDF
                pdf.save(`Reporte_${patenteTexto}_${new Date().toISOString().split('T')[0]}.pdf`);
                hideExportModal();
            }).catch(error => {
                console.error('Error al generar PDF:', error);
                alert('Error al generar el PDF. Por favor, intenta nuevamente.');
                hideExportModal();
            });
        };
        
        logoImg.onerror = function() {
            console.warn('No se pudo cargar el logo. Continuando sin logo.');
            // Si no se puede cargar el logo, generar PDF sin él
            generatePDFWithoutLogo();
        };
        
        logoImg.src = 'west_logo.png';
    }
    
    function generatePDFWithoutLogo() {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Configuración de la página
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        
        // Capturar diferentes secciones del dashboard por separado
        const sections = [
            { element: document.querySelector('#reportTitle'), name: 'Título' },
            { element: document.querySelector('.metrics-grid'), name: 'Métricas' },
            { element: document.querySelector('.filters'), name: 'Filtros' },
            { element: document.querySelector('.charts-grid'), name: 'Gráficos' },
            { element: document.querySelector('.table-container'), name: 'Tabla' }
        ];
        
        let currentPage = 1;
        let yPosition = margin;
        
        // Procesar cada sección
        const sectionPromises = sections.map((section, index) => {
            return new Promise((resolve) => {
                if (!section.element) {
                    resolve();
                    return;
                }
                
                html2canvas(section.element, {
                    scale: 1.5,  // Calidad moderada para reducir tamaño
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false,
                    width: section.element.scrollWidth,
                    height: section.element.scrollHeight
                }).then(canvas => {
                    const imgData = canvas.toDataURL('image/jpeg', 0.7); // JPEG con compresión
                    
                    const maxWidth = pageWidth - 2 * margin;
                    const imgHeight = (canvas.height * maxWidth) / canvas.width;
                    
                    // Verificar si necesitamos una nueva página
                    if (yPosition + imgHeight > pageHeight - margin - 20) {
                        currentPage++;
                        pdf.addPage();
                        yPosition = margin;
                    }
                    
                    // Agregar la sección
                    pdf.addImage(imgData, 'JPEG', margin, yPosition, maxWidth, imgHeight);
                    yPosition += imgHeight + 10;
                    
                    resolve();
                }).catch(() => {
                    resolve();
                });
            });
        });
        
        // Esperar a que todas las secciones se procesen
        Promise.all(sectionPromises).then(() => {
            // Agregar pie de página a todas las páginas
            for (let i = 1; i <= currentPage; i++) {
                pdf.setPage(i);
                pdf.setFontSize(8);
                pdf.setTextColor(150, 150, 150);
                const footerText = `Generado por West Fleet Solutions - Página ${i}`;
                pdf.text(footerText, pageWidth - margin, pageHeight - 10, { align: 'right' });
            }
            
            // Obtener patente única o mostrar múltiples si hay varias
            const patentes = [...new Set(currentData.videos.map(v => v.vehiculo).filter(v => v))];
            const patenteTexto = patentes.length === 1 ? patentes[0].replace(/[^a-zA-Z0-9]/g, '_') : 'Multiples_Vehiculos';
            
            // Descargar PDF
            pdf.save(`Reporte_${patenteTexto}_${new Date().toISOString().split('T')[0]}.pdf`);
            hideExportModal();
        }).catch(error => {
            console.error('Error al generar PDF:', error);
            alert('Error al generar el PDF. Por favor, intenta nuevamente.');
            hideExportModal();
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
        
        // Extraer rango de fechas desde el nombre del archivo
        // Busca patrones tipo "04 al 16 de septiembre"
        let fechas = [];
        const fileName = currentData.fileName || '';
        // Busca patrón "dd al dd de mes" (ej: "04 al 16 de septiembre")
        const rangoMatch = fileName.match(/(\d{2})\s*al\s*(\d{2})\s*de\s*([a-zA-Záéíóúñ]+)/i);
        if (rangoMatch) {
            // Ejemplo: ["04 al 16 de septiembre", "04", "16", "septiembre"]
            fechas = [`${rangoMatch[1]} de ${rangoMatch[3]}`, `${rangoMatch[2]} de ${rangoMatch[3]}`];
        } else {
            // Busca patrón "dd de mes" (ej: "16 de septiembre")
            const fechaMatch = fileName.match(/(\d{2})\s*de\s*([a-zA-Záéíóúñ]+)/i);
            if (fechaMatch) {
            fechas = [`${fechaMatch[1]} de ${fechaMatch[2]}`];
            }
        }
        
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
