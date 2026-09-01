# SimuPIC — Manual de usuario

Simulador de PIC16F628A para el navegador.
Funciona en cualquier navegador, en la computadora o en el celular:
<https://santibianco.github.io/SimuPIC/>

## 1. Qué es SimuPIC

SimuPIC es un simulador del microcontrolador PIC16F628A que corre dentro del navegador. Sirve para probar tus programas sin necesidad de tener el integrado, la protoboard ni el grabador: cargás tu programa, elegís la placa del trabajo práctico y ves cómo se encienden los LEDs, cómo cuenta el display de 7 segmentos y cómo responde a los pulsadores.

No hay que instalar nada. Se abre como una página web y funciona igual en Windows, macOS, Linux, Android o iPhone.

### Por qué podés confiar en lo que ves

SimuPIC cuenta los ciclos de instrucción exactamente igual que el chip real: cada instrucción dura 1 ciclo (2 si es un salto o un salto condicional que se toma), y a 4 MHz un ciclo son 1 µs. Esto importa porque las dos técnicas que más usan en los trabajos prácticos dependen del tiempo:

- **Multiplexado de displays** — se apoya en la persistencia de la visión. Si el simulador contara mal los ciclos, verías parpadeos donde no los hay.
- **Antirrebote de pulsadores** — mide una ventana de milisegundos para descartar el ruido del contacto.

Si el simulador se desviara en el conteo de ciclos, terminarías depurando código que en realidad está bien. Por eso la precisión de tiempo es el objetivo central de SimuPIC.

> **Lo que SimuPIC simula**
>
> Un único chip: el PIC16F628A, con sus 35 instrucciones, bancos de memoria, TMR0 con preescalador, interrupciones y EEPROM.
>
> Entradas y salidas digitales: cada pin vale 0 o 1.
>
> Componentes en la placa: LEDs, displays de 7 segmentos y pulsadores.

> **Lo que NO simula**
>
> Nada analógico: no hay tensiones intermedias, resistencias ni osciloscopio.
>
> Otros microcontroladores, displays LCD de caracteres, ni cableado libre entre componentes.
>
> Las resistencias de pull-up internas de PORTB (RBPU). En su lugar, la placa ya define el nivel de reposo de cada pulsador.
>
> El conteo externo del TMR0 por T0CKI: TMR0 siempre cuenta el reloj interno.

## 2. Un vistazo a la pantalla

En la computadora, la pantalla se divide en cuatro zonas. Vas a usar siempre las tres primeras; el panel de la derecha se puede abrir y cerrar.

<!-- figura 2 · Vista completa en la computadora, con un programa cargado y corriendo. -->

| **Zona** | **Para qué sirve** |
|---|---|
| **Barra superior** | Cargar un .hex, abrir el editor de código, abrir el debugger y cambiar entre tema claro y oscuro. |
| **Columna izquierda** | Elegir la placa, ejecutar / pausar / detener, y ajustar la velocidad del reloj. Abajo aparece el mensaje de estado. |
| **Centro** | La placa: el PIC dibujado como un DIP-18 con los componentes conectados a sus pines. Acá se ve todo lo que hace tu programa. |
| **Columna derecha** | El debugger y el editor de código. Se abren y se cierran desde la barra superior. |

Al abrirlo por primera vez la placa está vacía, con el mensaje «Elegí una placa para empezar». Es normal: falta elegir el trabajo práctico.

<!-- figura 3 · Pantalla inicial, antes de elegir una placa. -->

## 3. Primeros pasos

En cuatro pasos tenés tu programa corriendo.

### Paso 1 — Elegí la placa

Abrí el menú «Placa» de la columna izquierda y elegí el trabajo práctico correspondiente. Las opciones están agrupadas:

| **Grupo** | **Qué contiene** |
|---|---|
| **Ejercitación** | El PIC solo, sin componentes: sirve para probar código y mirar registros en el debugger. |
| **TP Grupal** | Ejercicio 1, Ejercicio 2 y Ejercicio 3. |
| **TP Individual** | 1 Display y 4 Displays. |
| **Ejemplos** | Programas ya hechos y funcionando: parpadeo, contador de 7 segmentos, contador multiplexado de 2 dígitos y contador con EEPROM. |

> **Consejo para arrancar**
>
> Antes de cargar tu propio programa, elegí uno de los «Ejemplos». Se cargan solos, con su código y su placa, y arrancan a andar enseguida. Es la forma más rápida de entender cómo se maneja la herramienta.

### Paso 2 — Cargá tu programa

Hay dos caminos, y los dos son igual de válidos. Elegí el que te resulte más cómodo.

#### Opción A — Escribir el código en SimuPIC

Abrí «Código» en la barra superior, escribí o pegá tu assembler y tocá «Compilar y cargar». El ensamblador está incorporado: no necesitás instalar nada ni salir del navegador. Está explicado en detalle en el capítulo 7.

#### Opción B — Cargar un .hex ya compilado

Si preferís compilar con una herramienta externa (MPLAB, por ejemplo) o ya tenés el proyecto armado ahí, traé el .hex de dos maneras:

- **Botón «Cargar .hex»** en la barra superior: se abre el explorador de archivos y elegís el .hex.
- **Arrastrando el archivo** .hex y soltándolo sobre la ventana.

En cualquiera de los dos casos, si el programa se cargó bien el mensaje de estado de la izquierda se pone verde y te lo confirma.

### Paso 3 — Ejecutalo

En el panel «Simulación» tenés los dos botones de siempre:

| **Botón** | **Qué hace** |
|---|---|
| **Triángulo / dos barras** | Ejecutar o pausar. También funciona la barra espaciadora. |
| **Cuadrado** | Detener y reiniciar: es como cortarle la alimentación al PIC. La RAM se borra y el programa vuelve a arrancar de cero. La EEPROM, en cambio, sobrevive (igual que en el chip real). |
| **Cronómetro** | Tiempo real que lleva ejecutando, en minutos:segundos:milisegundos. |

Al elegir una placa o cargar un .hex, el programa arranca solo.

### Paso 4 — Interactuá con la placa

Hacé clic (o tocá, en el celular) sobre un pulsador de la placa para presionarlo. Se mantiene presionado mientras dejes apretado el botón del mouse y se suelta al soltarlo.

<!-- figura 4 · Un pulsador conectado a RB0. El número sobre el símbolo indica el nivel lógico que está entregando al pin. -->

## 4. La barra superior

<!-- figura 5 · Barra superior en la computadora. -->

| **Control** | **Qué hace** |
|---|---|
| **Cargar .hex** | Abre el explorador de archivos para elegir un .hex ya compilado. |
| **Código** | Muestra u oculta el editor de código assembler. |
| **Debugger** | Muestra u oculta el debugger. |
| **Luna / sol** | Cambia entre el tema claro y el oscuro. Es sólo estético; no afecta a la simulación. |

En el celular los mismos botones aparecen sólo con su ícono, para que entren en la pantalla.

<!-- figura 6 · El mismo simulador con el tema oscuro activado. -->

## 5. Placa, simulación y estado

<!-- figura 7 · La columna izquierda con un programa cargado. -->

### Reloj

El campo «Reloj» fija la frecuencia del oscilador del PIC. Podés escribirla a mano (por ejemplo 4 MHz, 500 kHz o 32 Hz) o moverla con la barra deslizante, que va de 1 Hz a 8 MHz.

**A 4 MHz, un ciclo de instrucción dura 1 µs** — es el valor que se usa en la cátedra y el que viene puesto por defecto.

> **Para qué bajar el reloj**
>
> Bajar la frecuencia a unos pocos Hz hace que el programa avance lentísimo, y podés ver instrucción por instrucción cómo cambian los LEDs. Es muy útil para entender un lazo que a 4 MHz pasa demasiado rápido para el ojo.
>
> Ojo: si tu programa depende de tiempos (antirrebote, multiplexado), cambiar el reloj cambia esos tiempos. Para probar el comportamiento definitivo, volvé a 4 MHz.

### Mensaje de estado

El recuadro de abajo te dice qué pasó con lo último que hiciste. En verde, que salió bien; en rojo, que hubo un problema (por ejemplo, un archivo que no es .hex o un error de compilación).

## 6. La placa

En el centro se dibuja el PIC16F628A como un encapsulado DIP-18, con los 18 pines numerados y etiquetados. Alrededor se ubican los componentes que definió la cátedra para ese trabajo práctico, y una etiqueta indica a qué pin está conectado cada uno.

<!-- figura 8 · Placa del Ejercicio 1: cuatro LEDs conectados a RB0…RB3, todos encendidos. -->

### Cómo leer la placa

| **Elemento** | **Qué significa** |
|---|---|
| **Cuadradito del pin** | Rojo = el pin está en 1 · azul = está en 0 · gris = todavía no está definido (es una entrada y nadie la maneja) · ámbar = conflicto: hay un pulsador apretado sobre un pin configurado como salida, revisá TRIS. |
| **LED** | Se enciende cuando el pin al que está conectado pasa a 1. |
| **Display de 7 segmentos** | Cada segmento se dibuja según el pin que le corresponde. La referencia de abajo (a RB0, b RB1, …) te dice el orden. |
| **Pulsador** | El número que aparece arriba es el nivel que le está entregando al pin. Hacé clic para presionarlo. |

### Zoom y desplazamiento

- Rueda del mouse (o pellizco en el celular) para acercar y alejar.
- Arrastrando con el mouse (o el dedo) se desplaza la vista.
- **Botón de la lupa** arriba a la derecha: abre los controles de zoom, con «−», «+», el porcentaje actual y «Ajustar» para volver a encuadrar la placa entera.

> **Multiplexado: qué vas a ver**
>
> En las placas de varios displays, los dígitos se encienden por turnos a gran velocidad. SimuPIC calcula cuánto tiempo estuvo encendido cada segmento y lo dibuja con esa intensidad, igual que lo vería el ojo. Por eso un dígito multiplexado se ve más tenue que uno fijo: eso es correcto, no es un defecto.

## 7. El editor de código

SimuPIC trae un editor con un ensamblador incorporado: podés escribir el assembler directamente acá y compilarlo sin salir del navegador. Se abre con el botón «Código» de la barra superior.

<!-- figura 9 · El editor con el código de uno de los ejemplos cargado. -->

| **Control** | **Qué hace** |
|---|---|
| **Compilar y cargar** | Ensambla el código y lo carga en la placa, listo para ejecutar. Está deshabilitado hasta que elijas una placa. |
| **Ícono de carpeta** | Abre un archivo .asm de tu computadora y lo trae al editor. |
| **Ícono de descarga** | Guarda en tu computadora el código que tenés escrito. |
| **Ícono de tacho** | Borra todo el contenido del editor. |

Si la compilación sale bien, abajo aparece en verde cuántas instrucciones generó. Si hay un error, te dice el número de línea y qué encontró.

<!-- figura 10 · Mensaje del ensamblador después de compilar correctamente. -->

### Qué acepta el ensamblador

Entiende el assembler estándar de Microchip (MPASM) para este chip, así que el mismo código funciona acá y en cualquier otra herramienta:

- Las 35 instrucciones del PIC16F628A, etiquetas y comentarios con «;».
- Directivas EQU, SET, ORG, END, __CONFIG, BANKSEL, PAGESEL, RES, FILL, DW, DT, DE, DA, LIST y RADIX.
- Bloques CBLOCK / ENDC, macros MACRO / ENDM y #define.
- La línea #include <p16f628a.inc> se acepta y se ignora: los nombres de registros y de bits ya están definidos internamente.

> **Podés trabajar enteramente acá**
>
> No hace falta ninguna herramienta externa: escribís el assembler en el editor, compilás y probás, todo dentro de SimuPIC. También funciona desde el celular.
>
> Si preferís compilar afuera, no hay problema: cargá el .hex y listo. El resultado es el mismo, porque el ensamblador de SimuPIC está verificado contra MPASM y produce el mismo código máquina.
>
> Un detalle: cuando cargás un .hex, el editor se vacía, porque ese código fuente no corresponde al programa que estás simulando.

## 8. El debugger

El debugger es la parte más potente de SimuPIC: te deja frenar el programa, avanzarlo instrucción por instrucción y mirar por dentro todos los registros del PIC mientras corre. Se abre y se cierra con el botón «Debugger» de la barra superior.

<!-- figura 11 · El debugger abierto, con dos paneles: Programa y Watch. -->

### 8.1 El encabezado

<!-- figura 12 · Encabezado del debugger. -->

| **Dato** | **Qué es** |
|---|---|
| **Ciclos** | Cuántos ciclos de instrucción lleva ejecutados el programa desde el último reinicio. A 4 MHz, cada ciclo son 1 µs. |
| **PC** | Program Counter: la dirección de la instrucción que está por ejecutarse. |
| **W** | El registro de trabajo. |
| **STATUS** | El registro STATUS en hexadecimal, y al lado los bits C, DC, Z y RP0. El bit se resalta cuando vale 1. |

#### Paso, ×10 y ×100

Con el programa pausado, «Paso ▸» ejecuta una sola instrucción y actualiza todo. «×10» y «×100» avanzan de a diez y de a cien instrucciones, para cruzar rápido un lazo de demora sin perder el hilo.

### 8.2 Cambiar de vista

Cada panel tiene arriba un menú desplegable con cinco vistas: Programa, Datos, SFR, Pila y Watch. El botón ⊞ abre un segundo panel al lado, así podés mirar dos cosas a la vez (por ejemplo, el programa y los registros). Los dos paneles a la vez sólo están disponibles en la computadora.

### 8.3 Vista Programa

Es la memoria de programa desensamblada. Cada fila muestra la dirección, la palabra de 14 bits tal cual está en memoria y la instrucción correspondiente.

<!-- figura 13 · Vista Programa. La fila verde es la instrucción que va a ejecutarse (el PC); el punto rojo es un breakpoint. -->

- **Fila resaltada en verde** — es donde está parado el PC en este momento.
- **Círculo de la izquierda** — hacé clic para poner o sacar un breakpoint. Cuando la ejecución llega a esa instrucción, el programa se pausa solo y podés mirar cómo quedó todo.

> **El breakpoint es tu mejor herramienta**
>
> En vez de ir apretando «Paso» cientos de veces hasta llegar a la parte que te interesa, poné un breakpoint ahí, dale ▶ y dejá que el programa corra hasta frenarse solo en ese punto.

### 8.4 Vista Datos

Es la memoria RAM completa, en hexadecimal, con las direcciones a la izquierda. Arriba, junto a la palabra «Banco», los botones 0 y 1 cambian entre los dos bancos de memoria. Las direcciones bajas, en violeta, son los registros especiales (SFR); a partir de 0x20 empieza tu memoria de uso general.

<!-- figura 14 · Vista Datos, banco 0. Las direcciones bajas en violeta son los registros especiales (SFR); a partir de 0x20 empieza tu memoria de uso general. -->

**Podés editar cualquier valor** : hacé clic en la celda, escribí el nuevo valor y presioná Enter (Escape cancela). Sirve para forzar una situación difícil de alcanzar y ver cómo reacciona tu programa.

<!-- figura 15 · El mismo panel mostrando el banco 1. -->

### 8.5 Vista SFR

Los registros especiales, con nombre, valor en hexadecimal y en binario. Los bits con nombre propio (los de STATUS, OPTION e INTCON) se listan al lado y se resaltan cuando valen 1.

<!-- figura 16 · Vista SFR. Acá se ve de un vistazo cómo quedaron TRISB, PORTB, TMR0, INTCON y los demás. -->

Es la vista que más ayuda cuando «no me enciende el LED»: mirá TRISB (¿configuraste el pin como salida?) y PORTB (¿escribiste el valor que creías?). Estos valores también se pueden editar haciendo clic.

### 8.6 Vista Pila

La pila de retorno del PIC, que tiene 8 niveles. Cada CALL apila la dirección de retorno y cada RETURN la desapila. Arriba se indica la profundidad actual.

<!-- figura 17 · Vista Pila con una llamada en curso: profundidad 1 de 8, y la dirección de retorno 0x006 en el tope. -->

> **Un error clásico**
>
> El PIC16F628A tiene sólo 8 niveles de pila. Si anidás más de 8 CALL, o si hacés un CALL sin su RETURN dentro de un lazo, la pila se desborda y el programa se va a cualquier lado. Esta vista te lo muestra al instante.

### 8.7 Vista Watch

Una lista de valores para vigilar. Escribí una dirección (por ejemplo 0x20) o el nombre de un registro (PORTB, TMR0, STATUS) y tocá «Agregar»: queda fijo en la lista y se actualiza en vivo mientras el programa corre.

<!-- figura 18 · Vista Watch siguiendo PORTB, TMR0 y la posición 0x20. De cada uno se ve la dirección, el valor en hexadecimal y en binario. -->

Es más cómoda que la vista Datos cuando sólo te interesan dos o tres variables: en vez de buscarlas en la grilla, las tenés siempre a la vista. Con la «×» de la derecha las sacás de la lista.

## 9. En el celular

SimuPIC funciona igual en el teléfono. La diferencia es que las zonas, en vez de estar una al lado de la otra, se apilan una debajo de la otra: primero la placa, después los controles de simulación y por último el debugger o el editor si los abriste. Se navega desplazándose hacia abajo.

### Diferencias respecto de la computadora

- Los botones de la barra superior muestran sólo el ícono.
- El debugger tiene un único panel: no está el botón ⊞ para dividir en dos.
- Los controles de zoom vienen plegados detrás del botón de la lupa; también funciona el pellizco con dos dedos.
- Para presionar un pulsador, mantenelo tocado con el dedo.

## 10. Instalarlo y usarlo sin internet

SimuPIC es una aplicación web instalable. La primera vez que la abrís con conexión, el navegador guarda una copia completa; a partir de ahí funciona sin internet.

### Cómo instalarla

- Abrí la dirección del simulador con conexión a internet.
- **En la computadora** : en la barra de direcciones de Chrome o Edge aparece un ícono de instalación. También está en el menú del navegador, como «Instalar SimuPIC».
- **En Android** : menú de Chrome → «Agregar a la pantalla principal».
- **En iPhone** : botón Compartir de Safari → «Agregar a inicio».

Queda como una aplicación más, con su ícono, y abre en su propia ventana sin la barra del navegador.

> **Sirve para rendir y para trabajar sin conexión**
>
> Una vez instalada, no necesitás internet para nada: ni para cargar tu .hex, ni para compilar, ni para depurar. Todo el simulador corre en tu dispositivo.

## 11. El set de instrucciones

El PIC16F628A tiene **35 instrucciones**. El botón **«Instrucciones»** de la barra superior
abre la tabla completa: mnemónico y operandos, qué hace, cuántos ciclos tarda y qué flags
del registro STATUS modifica. El buscador de arriba filtra por cualquiera de esas columnas,
así que podés escribir `BTFSS`, `salto` o `Z` y quedarte con lo que te interesa.

Los datos salen de la tabla 15-2 del datasheet de Microchip (DS40044F) y coinciden con lo
que ensambla SimuPIC.

> **Atajo mientras escribís código**
>
> No hace falta abrir la tabla: en el editor y en la vista Programa del debugger,
> pasando el mouse por encima de un mnemónico aparece un cartelito con la descripción,
> los ciclos y los flags de esa instrucción.

## 12. Si algo no anda

| **Qué te pasa** | **Qué mirar** |
|---|---|
| **El botón «Compilar y cargar» está gris** | Todavía no elegiste una placa. Elegila en el menú «Placa» y se habilita. |
| **Cargué el .hex pero no pasa nada** | Fijate que el mensaje de estado esté en verde. Después revisá en la vista SFR si TRISB quedó configurado como salida: si el pin es entrada, el LED nunca va a encender. |
| **El LED no enciende** | Casi siempre es el banco de memoria. TRISB está en el banco 1 y PORTB en el banco 0. Usá BANKSEL o revisá el bit RP0 en la vista SFR. |
| **El display muestra segmentos raros** | Verificá el orden de los pines: la referencia debajo del display te dice qué pin corresponde a cada segmento (a, b, c, …). |
| **El programa se va a una dirección extraña** | Mirá la vista Pila. Un CALL sin RETURN, o más de 8 llamadas anidadas, desbordan la pila de 8 niveles. |
| **El pulsador no responde** | Revisá que el pin esté configurado como entrada en TRIS, y acordate de que SimuPIC no simula las pull-up internas (RBPU): la placa ya define el nivel de reposo. |
| **Todo va demasiado rápido para verlo** | Bajá el reloj a unos pocos Hz, o pausá y usá «Paso». |
| **«Arrastrá un archivo .hex»** | Soltaste un archivo que no termina en .hex. Si compilaste afuera, el .hex queda junto al .asm en la carpeta del proyecto. También podés pegar el código en el editor y evitar el archivo. |

Si el problema persiste, detené la simulación con el botón cuadrado (que reinicia el chip) y volvé a cargar el programa. Recordá que el reinicio borra la RAM pero conserva la EEPROM, igual que el chip real.
