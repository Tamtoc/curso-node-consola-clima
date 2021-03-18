require('dotenv').config()

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async () => {

     let opt;
     const busquedas = new Busquedas();
    
     do {

        opt = await inquirerMenu();
        
        switch ( opt ) {
            case 1:
                // Mostrar mensaje
                const termino = await leerInput('Ciudad: ');

                // Buscar la ciudad
                const lugares = await busquedas.ciudad( termino );

                // Seleccionar la ciudad
                const id = await listarLugares( lugares );
                if ( id === '0' ) continue; // continua con la sig iteración

                const lugarSel = lugares.find( lugar => lugar.id === id );

                // Guardar en DB
                busquedas.agregarHistorial( lugarSel.nombre );

                // Clima
                const clima = await busquedas.climaLugar( lugarSel.lat, lugarSel.lng );

                // Mostrar resultados
                console.clear();
                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad:', lugarSel.nombre.green );
                console.log('Lat:', lugarSel.lat );
                console.log('Lng:', lugarSel.lng );
                console.log('Temperatura:', clima.min );
                console.log('T. Mínima:', clima.min );
                console.log('T. Máxima:', clima.max );
                console.log('Estado del clima:', clima.desc.green );
                break;
            case 2:
                busquedas.historialCapitalizado.forEach( (lugar, i) => {
                    const index = `${ i + 1 }.`.green;
                    console.log(`${ index } ${ lugar }`);
                });
                break;
            case 0: 
                console.log( opt )
                break;
        }

        await pausa();

     } while ( opt !== 0 );

} 

main();