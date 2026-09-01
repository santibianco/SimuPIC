/* SimuPIC — in-app user manual. GENERATED FILE — DO NOT EDIT.
 * Source: docs/manual.md · rebuild with: node build-help.js
 * 12 sections, generated 2026-09-01.
 */
(function (root) {
  const HELP = {
    source: "docs/manual.md",
    intro: "<p>Simulador de PIC16F628A para el navegador. Funciona en cualquier navegador, en la computadora o en el celular: <a href=\"https://santibianco.github.io/SimuPIC/\" target=\"_blank\" rel=\"noopener\">https://santibianco.github.io/SimuPIC/</a></p>",
    sections: [
 {
  "id": "s-1-que-es-simupic",
  "n": "1",
  "t": "Qué es SimuPIC",
  "h": "<p>SimuPIC es un simulador del microcontrolador PIC16F628A que corre dentro del navegador. Sirve para probar tus programas sin necesidad de tener el integrado, la protoboard ni el grabador: cargás tu programa, elegís la placa del trabajo práctico y ves cómo se encienden los LEDs, cómo cuenta el display de 7 segmentos y cómo responde a los pulsadores.</p>\n<p>No hay que instalar nada. Se abre como una página web y funciona igual en Windows, macOS, Linux, Android o iPhone.</p>\n<h3 id=\"h-por-que-podes-confiar-en-lo-que-ves\">Por qué podés confiar en lo que ves</h3>\n<p>SimuPIC cuenta los ciclos de instrucción exactamente igual que el chip real: cada instrucción dura 1 ciclo (2 si es un salto o un salto condicional que se toma), y a 4 MHz un ciclo son 1 µs. Esto importa porque las dos técnicas que más usan en los trabajos prácticos dependen del tiempo:</p>\n<ul><li><strong>Multiplexado de displays</strong> — se apoya en la persistencia de la visión. Si el simulador contara mal los ciclos, verías parpadeos donde no los hay.</li><li><strong>Antirrebote de pulsadores</strong> — mide una ventana de milisegundos para descartar el ruido del contacto.</li></ul>\n<p>Si el simulador se desviara en el conteo de ciclos, terminarías depurando código que en realidad está bien. Por eso la precisión de tiempo es el objetivo central de SimuPIC.</p>\n<aside class=\"hnote\"><div class=\"hnoteT\">Lo que SimuPIC simula</div><p>Un único chip: el PIC16F628A, con sus 35 instrucciones, bancos de memoria, TMR0 con preescalador, interrupciones y EEPROM.</p><p>Entradas y salidas digitales: cada pin vale 0 o 1.</p><p>Componentes en la placa: LEDs, displays de 7 segmentos y pulsadores.</p></aside>\n<aside class=\"hnote\"><div class=\"hnoteT\">Lo que NO simula</div><p>Nada analógico: no hay tensiones intermedias, resistencias ni osciloscopio.</p><p>Otros microcontroladores, displays LCD de caracteres, ni cableado libre entre componentes.</p><p>Las resistencias de pull-up internas de PORTB (RBPU). En su lugar, la placa ya define el nivel de reposo de cada pulsador.</p><p>El conteo externo del TMR0 por T0CKI: TMR0 siempre cuenta el reloj interno.</p></aside>",
  "subs": [
   {
    "id": "h-por-que-podes-confiar-en-lo-que-ves",
    "t": "Por qué podés confiar en lo que ves"
   }
  ]
 },
 {
  "id": "s-2-un-vistazo-a-la-pantalla",
  "n": "2",
  "t": "Un vistazo a la pantalla",
  "h": "<p>En la computadora, la pantalla se divide en cuatro zonas. Vas a usar siempre las tres primeras; el panel de la derecha se puede abrir y cerrar.</p>\n<div class=\"htableWrap\"><table class=\"htable\">\n<thead><tr><th><strong>Zona</strong></th><th><strong>Para qué sirve</strong></th></tr></thead>\n<tbody><tr><td><strong>Barra superior</strong></td><td>Cargar un .hex, abrir el editor de código, abrir el debugger y cambiar entre tema claro y oscuro.</td></tr><tr><td><strong>Columna izquierda</strong></td><td>Elegir la placa, ejecutar / pausar / detener, y ajustar la velocidad del reloj. Abajo aparece el mensaje de estado.</td></tr><tr><td><strong>Centro</strong></td><td>La placa: el PIC dibujado como un DIP-18 con los componentes conectados a sus pines. Acá se ve todo lo que hace tu programa.</td></tr><tr><td><strong>Columna derecha</strong></td><td>El debugger y el editor de código. Se abren y se cierran desde la barra superior.</td></tr></tbody>\n</table></div>\n<p>Al abrirlo por primera vez la placa está vacía, con el mensaje «Elegí una placa para empezar». Es normal: falta elegir el trabajo práctico.</p>",
  "subs": []
 },
 {
  "id": "s-3-primeros-pasos",
  "n": "3",
  "t": "Primeros pasos",
  "h": "<p>En cuatro pasos tenés tu programa corriendo.</p>\n<h3 id=\"h-paso-1-elegi-la-placa\">Paso 1 — Elegí la placa</h3>\n<p>Abrí el menú «Placa» de la columna izquierda y elegí el trabajo práctico correspondiente. Las opciones están agrupadas:</p>\n<div class=\"htableWrap\"><table class=\"htable\">\n<thead><tr><th><strong>Grupo</strong></th><th><strong>Qué contiene</strong></th></tr></thead>\n<tbody><tr><td><strong>Ejercitación</strong></td><td>El PIC solo, sin componentes: sirve para probar código y mirar registros en el debugger.</td></tr><tr><td><strong>TP Grupal</strong></td><td>Ejercicio 1, Ejercicio 2 y Ejercicio 3.</td></tr><tr><td><strong>TP Individual</strong></td><td>1 Display y 4 Displays.</td></tr><tr><td><strong>Ejemplos</strong></td><td>Programas ya hechos y funcionando: parpadeo, contador de 7 segmentos, contador multiplexado de 2 dígitos y contador con EEPROM.</td></tr></tbody>\n</table></div>\n<aside class=\"hnote\"><div class=\"hnoteT\">Consejo para arrancar</div><p>Antes de cargar tu propio programa, elegí uno de los «Ejemplos». Se cargan solos, con su código y su placa, y arrancan a andar enseguida. Es la forma más rápida de entender cómo se maneja la herramienta.</p></aside>\n<h3 id=\"h-paso-2-carga-tu-programa\">Paso 2 — Cargá tu programa</h3>\n<p>Hay dos caminos, y los dos son igual de válidos. Elegí el que te resulte más cómodo.</p>\n<h4>Opción A — Escribir el código en SimuPIC</h4>\n<p>Abrí «Código» en la barra superior, escribí o pegá tu assembler y tocá «Compilar y cargar». El ensamblador está incorporado: no necesitás instalar nada ni salir del navegador. Está explicado en detalle en el capítulo 7.</p>\n<h4>Opción B — Cargar un .hex ya compilado</h4>\n<p>Si preferís compilar con una herramienta externa (MPLAB, por ejemplo) o ya tenés el proyecto armado ahí, traé el .hex de dos maneras:</p>\n<ul><li><strong>Botón «Cargar .hex»</strong> en la barra superior: se abre el explorador de archivos y elegís el .hex.</li><li><strong>Arrastrando el archivo</strong> .hex y soltándolo sobre la ventana.</li></ul>\n<p>En cualquiera de los dos casos, si el programa se cargó bien el mensaje de estado de la izquierda se pone verde y te lo confirma.</p>\n<h3 id=\"h-paso-3-ejecutalo\">Paso 3 — Ejecutalo</h3>\n<p>En el panel «Simulación» tenés los dos botones de siempre:</p>\n<div class=\"htableWrap\"><table class=\"htable\">\n<thead><tr><th><strong>Botón</strong></th><th><strong>Qué hace</strong></th></tr></thead>\n<tbody><tr><td><strong>Triángulo / dos barras</strong></td><td>Ejecutar o pausar. También funciona la barra espaciadora.</td></tr><tr><td><strong>Cuadrado</strong></td><td>Detener y reiniciar: es como cortarle la alimentación al PIC. La RAM se borra y el programa vuelve a arrancar de cero. La EEPROM, en cambio, sobrevive (igual que en el chip real).</td></tr><tr><td><strong>Cronómetro</strong></td><td>Tiempo real que lleva ejecutando, en minutos:segundos:milisegundos.</td></tr></tbody>\n</table></div>\n<p>Al elegir una placa o cargar un .hex, el programa arranca solo.</p>\n<h3 id=\"h-paso-4-interactua-con-la-placa\">Paso 4 — Interactuá con la placa</h3>\n<p>Hacé clic (o tocá, en el celular) sobre un pulsador de la placa para presionarlo. Se mantiene presionado mientras dejes apretado el botón del mouse y se suelta al soltarlo.</p>",
  "subs": [
   {
    "id": "h-paso-1-elegi-la-placa",
    "t": "Paso 1 — Elegí la placa"
   },
   {
    "id": "h-paso-2-carga-tu-programa",
    "t": "Paso 2 — Cargá tu programa"
   },
   {
    "id": "h-paso-3-ejecutalo",
    "t": "Paso 3 — Ejecutalo"
   },
   {
    "id": "h-paso-4-interactua-con-la-placa",
    "t": "Paso 4 — Interactuá con la placa"
   }
  ]
 },
 {
  "id": "s-4-la-barra-superior",
  "n": "4",
  "t": "La barra superior",
  "h": "<div class=\"htableWrap\"><table class=\"htable\">\n<thead><tr><th><strong>Control</strong></th><th><strong>Qué hace</strong></th></tr></thead>\n<tbody><tr><td><strong>Cargar .hex</strong></td><td>Abre el explorador de archivos para elegir un .hex ya compilado.</td></tr><tr><td><strong>Código</strong></td><td>Muestra u oculta el editor de código assembler.</td></tr><tr><td><strong>Debugger</strong></td><td>Muestra u oculta el debugger.</td></tr><tr><td><strong>Luna / sol</strong></td><td>Cambia entre el tema claro y el oscuro. Es sólo estético; no afecta a la simulación.</td></tr></tbody>\n</table></div>\n<p>En el celular los mismos botones aparecen sólo con su ícono, para que entren en la pantalla.</p>",
  "subs": []
 },
 {
  "id": "s-5-placa-simulacion-y-estado",
  "n": "5",
  "t": "Placa, simulación y estado",
  "h": "<h3 id=\"h-reloj\">Reloj</h3>\n<p>El campo «Reloj» fija la frecuencia del oscilador del PIC. Podés escribirla a mano (por ejemplo 4 MHz, 500 kHz o 32 Hz) o moverla con la barra deslizante, que va de 1 Hz a 8 MHz.</p>\n<p><strong>A 4 MHz, un ciclo de instrucción dura 1 µs</strong> — es el valor que se usa en la cátedra y el que viene puesto por defecto.</p>\n<aside class=\"hnote\"><div class=\"hnoteT\">Para qué bajar el reloj</div><p>Bajar la frecuencia a unos pocos Hz hace que el programa avance lentísimo, y podés ver instrucción por instrucción cómo cambian los LEDs. Es muy útil para entender un lazo que a 4 MHz pasa demasiado rápido para el ojo.</p><p>Ojo: si tu programa depende de tiempos (antirrebote, multiplexado), cambiar el reloj cambia esos tiempos. Para probar el comportamiento definitivo, volvé a 4 MHz.</p></aside>\n<h3 id=\"h-mensaje-de-estado\">Mensaje de estado</h3>\n<p>El recuadro de abajo te dice qué pasó con lo último que hiciste. En verde, que salió bien; en rojo, que hubo un problema (por ejemplo, un archivo que no es .hex o un error de compilación).</p>",
  "subs": [
   {
    "id": "h-reloj",
    "t": "Reloj"
   },
   {
    "id": "h-mensaje-de-estado",
    "t": "Mensaje de estado"
   }
  ]
 },
 {
  "id": "s-6-la-placa",
  "n": "6",
  "t": "La placa",
  "h": "<p>En el centro se dibuja el PIC16F628A como un encapsulado DIP-18, con los 18 pines numerados y etiquetados. Alrededor se ubican los componentes que definió la cátedra para ese trabajo práctico, y una etiqueta indica a qué pin está conectado cada uno.</p>\n<h3 id=\"h-como-leer-la-placa\">Cómo leer la placa</h3>\n<div class=\"htableWrap\"><table class=\"htable\">\n<thead><tr><th><strong>Elemento</strong></th><th><strong>Qué significa</strong></th></tr></thead>\n<tbody><tr><td><strong>Cuadradito del pin</strong></td><td>Rojo = el pin está en 1 · azul = está en 0 · gris = todavía no está definido (es una entrada y nadie la maneja) · ámbar = conflicto: hay un pulsador apretado sobre un pin configurado como salida, revisá TRIS.</td></tr><tr><td><strong>LED</strong></td><td>Se enciende cuando el pin al que está conectado pasa a 1.</td></tr><tr><td><strong>Display de 7 segmentos</strong></td><td>Cada segmento se dibuja según el pin que le corresponde. La referencia de abajo (a RB0, b RB1, …) te dice el orden.</td></tr><tr><td><strong>Pulsador</strong></td><td>El número que aparece arriba es el nivel que le está entregando al pin. Hacé clic para presionarlo.</td></tr></tbody>\n</table></div>\n<h3 id=\"h-zoom-y-desplazamiento\">Zoom y desplazamiento</h3>\n<ul><li>Rueda del mouse (o pellizco en el celular) para acercar y alejar.</li><li>Arrastrando con el mouse (o el dedo) se desplaza la vista.</li><li><strong>Botón de la lupa</strong> arriba a la derecha: abre los controles de zoom, con «−», «+», el porcentaje actual y «Ajustar» para volver a encuadrar la placa entera.</li></ul>\n<aside class=\"hnote\"><div class=\"hnoteT\">Multiplexado: qué vas a ver</div><p>En las placas de varios displays, los dígitos se encienden por turnos a gran velocidad. SimuPIC calcula cuánto tiempo estuvo encendido cada segmento y lo dibuja con esa intensidad, igual que lo vería el ojo. Por eso un dígito multiplexado se ve más tenue que uno fijo: eso es correcto, no es un defecto.</p></aside>",
  "subs": [
   {
    "id": "h-como-leer-la-placa",
    "t": "Cómo leer la placa"
   },
   {
    "id": "h-zoom-y-desplazamiento",
    "t": "Zoom y desplazamiento"
   }
  ]
 },
 {
  "id": "s-7-el-editor-de-codigo",
  "n": "7",
  "t": "El editor de código",
  "h": "<p>SimuPIC trae un editor con un ensamblador incorporado: podés escribir el assembler directamente acá y compilarlo sin salir del navegador. Se abre con el botón «Código» de la barra superior.</p>\n<div class=\"htableWrap\"><table class=\"htable\">\n<thead><tr><th><strong>Control</strong></th><th><strong>Qué hace</strong></th></tr></thead>\n<tbody><tr><td><strong>Compilar y cargar</strong></td><td>Ensambla el código y lo carga en la placa, listo para ejecutar. Está deshabilitado hasta que elijas una placa.</td></tr><tr><td><strong>Ícono de carpeta</strong></td><td>Abre un archivo .asm de tu computadora y lo trae al editor.</td></tr><tr><td><strong>Ícono de descarga</strong></td><td>Guarda en tu computadora el código que tenés escrito.</td></tr><tr><td><strong>Ícono de tacho</strong></td><td>Borra todo el contenido del editor.</td></tr></tbody>\n</table></div>\n<p>Si la compilación sale bien, abajo aparece en verde cuántas instrucciones generó. Si hay un error, te dice el número de línea y qué encontró.</p>\n<h3 id=\"h-que-acepta-el-ensamblador\">Qué acepta el ensamblador</h3>\n<p>Entiende el assembler estándar de Microchip (MPASM) para este chip, así que el mismo código funciona acá y en cualquier otra herramienta:</p>\n<ul><li>Las 35 instrucciones del PIC16F628A, etiquetas y comentarios con «;».</li><li>Directivas EQU, SET, ORG, END, __CONFIG, BANKSEL, PAGESEL, RES, FILL, DW, DT, DE, DA, LIST y RADIX.</li><li>Bloques CBLOCK / ENDC, macros MACRO / ENDM y #define.</li><li>La línea #include &lt;p16f628a.inc&gt; se acepta y se ignora: los nombres de registros y de bits ya están definidos internamente.</li></ul>\n<aside class=\"hnote\"><div class=\"hnoteT\">Podés trabajar enteramente acá</div><p>No hace falta ninguna herramienta externa: escribís el assembler en el editor, compilás y probás, todo dentro de SimuPIC. También funciona desde el celular.</p><p>Si preferís compilar afuera, no hay problema: cargá el .hex y listo. El resultado es el mismo, porque el ensamblador de SimuPIC está verificado contra MPASM y produce el mismo código máquina.</p><p>Un detalle: cuando cargás un .hex, el editor se vacía, porque ese código fuente no corresponde al programa que estás simulando.</p></aside>",
  "subs": [
   {
    "id": "h-que-acepta-el-ensamblador",
    "t": "Qué acepta el ensamblador"
   }
  ]
 },
 {
  "id": "s-8-el-debugger",
  "n": "8",
  "t": "El debugger",
  "h": "<p>El debugger es la parte más potente de SimuPIC: te deja frenar el programa, avanzarlo instrucción por instrucción y mirar por dentro todos los registros del PIC mientras corre. Se abre y se cierra con el botón «Debugger» de la barra superior.</p>\n<h3 id=\"h-8-1-el-encabezado\">8.1 El encabezado</h3>\n<div class=\"htableWrap\"><table class=\"htable\">\n<thead><tr><th><strong>Dato</strong></th><th><strong>Qué es</strong></th></tr></thead>\n<tbody><tr><td><strong>Ciclos</strong></td><td>Cuántos ciclos de instrucción lleva ejecutados el programa desde el último reinicio. A 4 MHz, cada ciclo son 1 µs.</td></tr><tr><td><strong>PC</strong></td><td>Program Counter: la dirección de la instrucción que está por ejecutarse.</td></tr><tr><td><strong>W</strong></td><td>El registro de trabajo.</td></tr><tr><td><strong>STATUS</strong></td><td>El registro STATUS en hexadecimal, y al lado los bits C, DC, Z y RP0. El bit se resalta cuando vale 1.</td></tr></tbody>\n</table></div>\n<h4>Paso, ×10 y ×100</h4>\n<p>Con el programa pausado, «Paso ▸» ejecuta una sola instrucción y actualiza todo. «×10» y «×100» avanzan de a diez y de a cien instrucciones, para cruzar rápido un lazo de demora sin perder el hilo.</p>\n<h3 id=\"h-8-2-cambiar-de-vista\">8.2 Cambiar de vista</h3>\n<p>Cada panel tiene arriba un menú desplegable con cinco vistas: Programa, Datos, SFR, Pila y Watch. El botón ⊞ abre un segundo panel al lado, así podés mirar dos cosas a la vez (por ejemplo, el programa y los registros). Los dos paneles a la vez sólo están disponibles en la computadora.</p>\n<h3 id=\"h-8-3-vista-programa\">8.3 Vista Programa</h3>\n<p>Es la memoria de programa desensamblada. Cada fila muestra la dirección, la palabra de 14 bits tal cual está en memoria y la instrucción correspondiente.</p>\n<ul><li><strong>Fila resaltada en verde</strong> — es donde está parado el PC en este momento.</li><li><strong>Círculo de la izquierda</strong> — hacé clic para poner o sacar un breakpoint. Cuando la ejecución llega a esa instrucción, el programa se pausa solo y podés mirar cómo quedó todo.</li></ul>\n<aside class=\"hnote\"><div class=\"hnoteT\">El breakpoint es tu mejor herramienta</div><p>En vez de ir apretando «Paso» cientos de veces hasta llegar a la parte que te interesa, poné un breakpoint ahí, dale ▶ y dejá que el programa corra hasta frenarse solo en ese punto.</p></aside>\n<h3 id=\"h-8-4-vista-datos\">8.4 Vista Datos</h3>\n<p>Es la memoria RAM completa, en hexadecimal, con las direcciones a la izquierda. Arriba, junto a la palabra «Banco», los botones 0 y 1 cambian entre los dos bancos de memoria. Las direcciones bajas, en violeta, son los registros especiales (SFR); a partir de 0x20 empieza tu memoria de uso general.</p>\n<p><strong>Podés editar cualquier valor</strong> : hacé clic en la celda, escribí el nuevo valor y presioná Enter (Escape cancela). Sirve para forzar una situación difícil de alcanzar y ver cómo reacciona tu programa.</p>\n<h3 id=\"h-8-5-vista-sfr\">8.5 Vista SFR</h3>\n<p>Los registros especiales, con nombre, valor en hexadecimal y en binario. Los bits con nombre propio (los de STATUS, OPTION e INTCON) se listan al lado y se resaltan cuando valen 1.</p>\n<p>Es la vista que más ayuda cuando «no me enciende el LED»: mirá TRISB (¿configuraste el pin como salida?) y PORTB (¿escribiste el valor que creías?). Estos valores también se pueden editar haciendo clic.</p>\n<h3 id=\"h-8-6-vista-pila\">8.6 Vista Pila</h3>\n<p>La pila de retorno del PIC, que tiene 8 niveles. Cada CALL apila la dirección de retorno y cada RETURN la desapila. Arriba se indica la profundidad actual.</p>\n<aside class=\"hnote\"><div class=\"hnoteT\">Un error clásico</div><p>El PIC16F628A tiene sólo 8 niveles de pila. Si anidás más de 8 CALL, o si hacés un CALL sin su RETURN dentro de un lazo, la pila se desborda y el programa se va a cualquier lado. Esta vista te lo muestra al instante.</p></aside>\n<h3 id=\"h-8-7-vista-watch\">8.7 Vista Watch</h3>\n<p>Una lista de valores para vigilar. Escribí una dirección (por ejemplo 0x20) o el nombre de un registro (PORTB, TMR0, STATUS) y tocá «Agregar»: queda fijo en la lista y se actualiza en vivo mientras el programa corre.</p>\n<p>Es más cómoda que la vista Datos cuando sólo te interesan dos o tres variables: en vez de buscarlas en la grilla, las tenés siempre a la vista. Con la «×» de la derecha las sacás de la lista.</p>",
  "subs": [
   {
    "id": "h-8-1-el-encabezado",
    "t": "8.1 El encabezado"
   },
   {
    "id": "h-8-2-cambiar-de-vista",
    "t": "8.2 Cambiar de vista"
   },
   {
    "id": "h-8-3-vista-programa",
    "t": "8.3 Vista Programa"
   },
   {
    "id": "h-8-4-vista-datos",
    "t": "8.4 Vista Datos"
   },
   {
    "id": "h-8-5-vista-sfr",
    "t": "8.5 Vista SFR"
   },
   {
    "id": "h-8-6-vista-pila",
    "t": "8.6 Vista Pila"
   },
   {
    "id": "h-8-7-vista-watch",
    "t": "8.7 Vista Watch"
   }
  ]
 },
 {
  "id": "s-9-en-el-celular",
  "n": "9",
  "t": "En el celular",
  "h": "<p>SimuPIC funciona igual en el teléfono. La diferencia es que las zonas, en vez de estar una al lado de la otra, se apilan una debajo de la otra: primero la placa, después los controles de simulación y por último el debugger o el editor si los abriste. Se navega desplazándose hacia abajo.</p>\n<h3 id=\"h-diferencias-respecto-de-la-computadora\">Diferencias respecto de la computadora</h3>\n<ul><li>Los botones de la barra superior muestran sólo el ícono.</li><li>El debugger tiene un único panel: no está el botón ⊞ para dividir en dos.</li><li>Los controles de zoom vienen plegados detrás del botón de la lupa; también funciona el pellizco con dos dedos.</li><li>Para presionar un pulsador, mantenelo tocado con el dedo.</li></ul>",
  "subs": [
   {
    "id": "h-diferencias-respecto-de-la-computadora",
    "t": "Diferencias respecto de la computadora"
   }
  ]
 },
 {
  "id": "s-10-instalarlo-y-usarlo-sin-internet",
  "n": "10",
  "t": "Instalarlo y usarlo sin internet",
  "h": "<p>SimuPIC es una aplicación web instalable. La primera vez que la abrís con conexión, el navegador guarda una copia completa; a partir de ahí funciona sin internet.</p>\n<h3 id=\"h-como-instalarla\">Cómo instalarla</h3>\n<ul><li>Abrí la dirección del simulador con conexión a internet.</li><li><strong>En la computadora</strong> : en la barra de direcciones de Chrome o Edge aparece un ícono de instalación. También está en el menú del navegador, como «Instalar SimuPIC».</li><li><strong>En Android</strong> : menú de Chrome → «Agregar a la pantalla principal».</li><li><strong>En iPhone</strong> : botón Compartir de Safari → «Agregar a inicio».</li></ul>\n<p>Queda como una aplicación más, con su ícono, y abre en su propia ventana sin la barra del navegador.</p>\n<aside class=\"hnote\"><div class=\"hnoteT\">Sirve para rendir y para trabajar sin conexión</div><p>Una vez instalada, no necesitás internet para nada: ni para cargar tu .hex, ni para compilar, ni para depurar. Todo el simulador corre en tu dispositivo.</p></aside>",
  "subs": [
   {
    "id": "h-como-instalarla",
    "t": "Cómo instalarla"
   }
  ]
 },
 {
  "id": "s-11-el-set-de-instrucciones",
  "n": "11",
  "t": "El set de instrucciones",
  "h": "<p>El PIC16F628A tiene <strong>35 instrucciones</strong>. El botón <strong>«Instrucciones»</strong> de la barra superior abre la tabla completa: mnemónico y operandos, qué hace, cuántos ciclos tarda y qué flags del registro STATUS modifica. El buscador de arriba filtra por cualquiera de esas columnas, así que podés escribir <code>BTFSS</code>, <code>salto</code> o <code>Z</code> y quedarte con lo que te interesa.</p>\n<p>Los datos salen de la tabla 15-2 del datasheet de Microchip (DS40044F) y coinciden con lo que ensambla SimuPIC.</p>\n<aside class=\"hnote\"><div class=\"hnoteT\">Atajo mientras escribís código</div><p>No hace falta abrir la tabla: en el editor y en la vista Programa del debugger,\npasando el mouse por encima de un mnemónico aparece un cartelito con la descripción,\nlos ciclos y los flags de esa instrucción.</p></aside>",
  "subs": []
 },
 {
  "id": "s-12-si-algo-no-anda",
  "n": "12",
  "t": "Si algo no anda",
  "h": "<div class=\"htableWrap\"><table class=\"htable\">\n<thead><tr><th><strong>Qué te pasa</strong></th><th><strong>Qué mirar</strong></th></tr></thead>\n<tbody><tr><td><strong>El botón «Compilar y cargar» está gris</strong></td><td>Todavía no elegiste una placa. Elegila en el menú «Placa» y se habilita.</td></tr><tr><td><strong>Cargué el .hex pero no pasa nada</strong></td><td>Fijate que el mensaje de estado esté en verde. Después revisá en la vista SFR si TRISB quedó configurado como salida: si el pin es entrada, el LED nunca va a encender.</td></tr><tr><td><strong>El LED no enciende</strong></td><td>Casi siempre es el banco de memoria. TRISB está en el banco 1 y PORTB en el banco 0. Usá BANKSEL o revisá el bit RP0 en la vista SFR.</td></tr><tr><td><strong>El display muestra segmentos raros</strong></td><td>Verificá el orden de los pines: la referencia debajo del display te dice qué pin corresponde a cada segmento (a, b, c, …).</td></tr><tr><td><strong>El programa se va a una dirección extraña</strong></td><td>Mirá la vista Pila. Un CALL sin RETURN, o más de 8 llamadas anidadas, desbordan la pila de 8 niveles.</td></tr><tr><td><strong>El pulsador no responde</strong></td><td>Revisá que el pin esté configurado como entrada en TRIS, y acordate de que SimuPIC no simula las pull-up internas (RBPU): la placa ya define el nivel de reposo.</td></tr><tr><td><strong>Todo va demasiado rápido para verlo</strong></td><td>Bajá el reloj a unos pocos Hz, o pausá y usá «Paso».</td></tr><tr><td><strong>«Arrastrá un archivo .hex»</strong></td><td>Soltaste un archivo que no termina en .hex. Si compilaste afuera, el .hex queda junto al .asm en la carpeta del proyecto. También podés pegar el código en el editor y evitar el archivo.</td></tr></tbody>\n</table></div>\n<p>Si el problema persiste, detené la simulación con el botón cuadrado (que reinicia el chip) y volvé a cargar el programa. Recordá que el reinicio borra la RAM pero conserva la EEPROM, igual que el chip real.</p>",
  "subs": []
 }
]
  };
  if (typeof module === "object" && module.exports) module.exports = HELP;
  root.NP_HELP = HELP;
})(typeof globalThis !== "undefined" ? globalThis : this);
