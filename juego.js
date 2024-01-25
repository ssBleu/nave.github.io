var fondo;
var nave;
var cursores;
var enemigos;
var timer;
var gasolinas;
var timerGasolina;
var botonReinicio;

var balas;
var tiempoBala = 0;

var puntaje = 0;
var puntajeTexto;

var reiniciando = false;  // Variable para controlar el reinicio
var mensaje;  // Variable para almacenar el mensaje
var Juego = {
    preload: function () {
        juego.load.image('bg', 'img/espaciobg.png');
        juego.load.image('nave', 'img/nave.png');
        juego.load.image('naveMalo', 'img/enemigo.png');
        juego.load.image('botonReinicio', 'img/reset.png');  // Nueva imagen para el botón de reinicio

        juego.load.image('laser', 'img/balas.png');
        juego.load.audio('laserSound', 'sound/laserSound.mp3'); //precarga de sonido
        juego.load.audio('destruccion', 'sound/destruccion.mp3'); //no funciona aun

        juego.forceSingleUpdate = true;
    },

    create: function () {
        fondo = juego.add.tileSprite(0, 0, 290, 540, 'bg');

        this.laserSound = this.sound.add('laserSound'); //instancia de sonido

        this.destruccion = this.sound.add('destruccion'); //instancia de sonido

        nave = juego.add.sprite(juego.width / 2, 496, 'nave');
        nave.anchor.setTo(0.5);

        juego.physics.arcade.enable(nave);

        puntajeTexto = juego.add.text(20, 20, 'Puntaje: 0', { font: '20px Arial', fill: '#fff' });

        enemigos = juego.add.group();
        juego.physics.arcade.enable(enemigos, true);
        enemigos.enableBody = true;
        enemigos.createMultiple(20, 'naveMalo');
        enemigos.setAll('anchor.x', 0.5);
        enemigos.setAll('anchor.y', 0.5);
        enemigos.setAll('outOfBoundsKill', true);
        enemigos.setAll('checkWorldBounds', true);

        timer = juego.time.events.loop(1500, this.crearnaveMalo, this);


        balas = juego.add.group();
        balas.enableBody = true;
        balas.physicsBodyType = Phaser.Physics.ARCADE;
        balas.createMultiple(20, 'laser');
        balas.setAll('anchor.x', -2);
        balas.setAll('anchor.y', 1);
        balas.setAll('outOfBoundsKill', true);
        balas.setAll('checkWorldBounds', true);


        // Agregar el botón de reinicio
        botonReinicio = juego.add.button(juego.width / 2, juego.height / 2, 'botonReinicio', this.reiniciarJuego, this);
        botonReinicio.anchor.setTo(0.5);
        botonReinicio.visible = false;  // Ocultar el botón al principio

        botonDisparo = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


        // Manejar clic directamente en el botón de reinicio
        botonReinicio.inputEnabled = true;
        botonReinicio.events.onInputDown.add(this.reiniciarJuego, this);

        cursores = juego.input.keyboard.createCursorKeys();
    },

    update: function () {
        fondo.tilePosition.y += 3;

        juego.physics.arcade.overlap(nave, gasolinas, this.colisionGasolina, null, this);

        if (!reiniciando) {
            // Solo actualiza el juego si no se está reiniciando
            juego.physics.arcade.overlap(nave, enemigos, this.colisionEnemigo, null, this);

            if (cursores.right.isDown && nave.position.x < 245) {
                nave.position.x += 5;
            } else if (cursores.left.isDown && nave.position.x > 45) {
                nave.position.x -= 5;
            }

            var bala;
            if (botonDisparo.isDown) {
                if (juego.time.now > tiempoBala) {
                    bala = balas.getFirstExists(false);
                }
                if (bala) {
                    bala.reset(nave.x - 40, nave.y); //posicion de la bala
                    bala.body.velocity.y = -300;
                    tiempoBala = juego.time.now + 400; //cadencia de disparo
                }
                this.laserSound.play(); //reproducción del sonido al disparar
            }

            juego.physics.arcade.overlap(balas, enemigos, colision, null, this);
        }
    },


    crearnaveMalo: function () {
        var posicion = Math.floor(Math.random() * 3) + 1;
        var enemigo = enemigos.getFirstDead();
        enemigo.physicsBodyType = Phaser.Physics.ARCADE;
        enemigo.reset(posicion * 73, 0);
        enemigo.body.velocity.y = 200;
        enemigo.anchor.setTo(0.5);
    },


    colisionEnemigo: function (nave, enemigo) {
        // Eliminar el mensaje actual si existe
        if (this.mensaje) {
            this.mensaje.destroy();
        }

        // Mostrar mensaje de reinicio y puntuación
        this.mensaje = juego.add.text(juego.width / 2, juego.height / 2 - 50, '¡Has chocado!\nPuntuación: ' + puntaje, { font: '25px Arial', fill: '#fff', align: 'center' });
        this.mensaje.anchor.setTo(0.5);
        // Mostrar el botón de reinicio
        botonReinicio.visible = true;

        // Establecer la variable reiniciando en true
        reiniciando = true;
    },

    reiniciarJuego: function () {
        // Eliminar el mensaje actual si existe
        if (this.mensaje) {
            this.mensaje.destroy();
        }
        // Ocultar el botón de reinicio
        botonReinicio.visible = false;

        // Reinicia todas las variables y objetos necesarios
        puntaje = 0;
        puntajeTexto.text = 'Puntaje: ' + puntaje;
        nave.position.x = juego.width / 2;

        // Reinicia la posición de otros elementos del juego si es necesario

        // Restablecer la variable reiniciando
        reiniciando = false;
    },


};

function colision(bala, enemigo) {
    bala.kill();
    enemigo.kill();
    this.destruccion.play();

    puntaje += 10;    // Aumenta el puntaje al recoger la gasolina
    puntajeTexto.text = 'Puntaje: ' + puntaje;  // Actualiza el texto del puntaje
}