const fs = require('fs');

const axios = require('axios');


class Busquedas {

    historial = [];
    dbPath = './db/database.json';

    constructor() {
        // leer DB si existe
        this.leerDB();

    }

    get historialCapitalizado() {
        // Capitalizar cada palabra
        return this.historial.map ( lugar => {

            const arrayLower = lugar.split(' ');

            const arrayUpper = arrayLower.map( palabra => {
                return palabra[0].toUpperCase() + palabra.slice(1);
            });
            
            return arrayUpper.join(' ');
        });
    }

    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5, 
            'language': 'es'
        }
    }

    get paramsOpenWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }

    async ciudad( lugar = '' ) {

        try {

            // petición http
            // const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/Madrid.json?access_token=pk.eyJ1IjoidGFtdG9jIiwiYSI6ImNrbWJsMml3YTIyZzIycHVzNnV5N2l3NnAifQ.OeoPFFnGHeMv9F_9FXQ1_A&limit=5&language=es');
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();
            
            // retornar lugares que coincidan
            return resp.data.features.map( lugar => ({

                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],

            }));  

        } catch (error) {
            return [];
        }
    }

    async climaLugar( lat, lon ) {

        try {

            // instance axios
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: { ...this.paramsOpenWeather, lat, lon }
            });

            const resp = await instance.get();
            const { weather, main } = resp.data;

            // extraer y retornar información
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }

        } catch(error) {
            return {};
        }

    }

    agregarHistorial( lugar = '' ) {

        if( this.historial.includes( lugar.toLocaleLowerCase() ) ) {
            return;
        }
        // Limitar la cantidad de elementos del historial
        this.historial = this.historial.splice(0, 5);

        // Prevenir duplicados
        this.historial.unshift( lugar.toLocaleLowerCase() );

        // Grabar en DB
        this.guardarDB();

    }

    guardarDB() {

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );

    }

    leerDB() {

        if ( !fs.existsSync( this.dbPath ) ) return;
        
        const info = fs.readFileSync( this.dbPath,  { encoding: 'utf-8' } );
        const data = JSON.parse( info );

        this.historial = data.historial;

    }

}

module.exports = Busquedas;