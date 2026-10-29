# Predicción de Lactosuero — Android

Aplicación Android sin conexión para estimar el volumen de lactosuero (L) por lote. La interfaz está hecha con HTML/CSS/JavaScript local dentro de un contenedor Android WebView; no requiere permisos de red ni transmite datos.

## Lógica conservada del notebook

1. El CSV se limpia: se quitan duplicados, se normaliza fecha y se descartan filas sin fecha/objetivo y volúmenes negativos.
2. Se crean variables temporales: mes, año, día del año y día de la semana.
3. Se conserva la partición cronológica 60% entrenamiento, 20% validación y 20% prueba.
4. Se comparan regresión lineal y bosque aleatorio con MAPE de validación. El modelo seleccionado es **Bosque aleatorio**.
5. Se muestran las métricas de validación/prueba obtenidas con el procedimiento del notebook.
6. Para despliegue, el modelo elegido se vuelve a entrenar con el primer 80% de los registros y se serializa para predicción local en el móvil.
7. La aplicación presenta una estimación en litros y avisa si el MAPE de prueba excede el umbral de 20%.

## Métricas con el CSV adjunto

- Registros válidos: 80
- Modelo seleccionado: Bosque aleatorio
- MAPE validación: 4.96%
- MAPE prueba: 8.70%
- MAE prueba: 19.83 L
- R² prueba: 0.880

Las métricas corresponden al conjunto sintético y son preliminares; no garantizan precisión en una planta real.

## Abrir y construir en Android Studio

1. Descomprime el proyecto y abre la carpeta `PrediccionLactosueroAndroid` en Android Studio.
2. Usa JDK 17 y deja que Gradle sincronice; permite instalar Android SDK Platform 35 y Build Tools 35 si se solicita.
3. Selecciona **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. El APK debug se generará en `app/build/outputs/apk/debug/app-debug.apk`.
5. Copia el APK a tu teléfono Android y permite la instalación desde esa fuente si el sistema lo solicita.

## Construcción automática en GitHub

El proyecto incluye `.github/workflows/build-apk.yml`. Sube el contenido del proyecto a un repositorio GitHub, abre la pestaña **Actions** y ejecuta **Construir APK Android**. Al finalizar, descarga el artefacto `PrediccionLactosuero-debug-apk`.

## Limitaciones

- El modelo se basa en solo 81 filas sintéticas. Antes de usarlo para inversión o producción, debe reentrenarse y validarse con datos reales.
- La fecha y las variables deben corresponder a condiciones reales del proceso. El modelo puede extrapolar mal fuera de los rangos históricos.
- Se corrigió el parseo de fechas ISO (`AAAA-MM-DD`) para no interpretar día y mes al revés; la partición cronológica se basa en fechas normalizadas.
- La app no realiza un balance de masa de lactosa/proteína ni sustituye mediciones de calidad.
