const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');
const bluebird = require('bluebird');

// Config
const app = express();
const port = 3000;

let client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride('_method'));

app.engine('handlebars', hbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');	

// Paginas
// Pagina busqueda
app.get('/', (req, res) => res.render('buscarusuario'));

// Procesar busqueda
app.post('/buscar', (req, res) => {
	
	let id = req.body.id;
	
	client
		.hgetallAsync(id)
		.then(data => {
			if(data){
				data.id = id;
				res.render('detalles', {
					usuario: data
				});
			}else{
				res.render('buscarusuario', {
					error: 'Usuario no existe'
				});
			}
		})
		.catch(e => {
			console.log(e);
			return;
		});
	
});

// Pagina agregar
app.get('/agregar', (req, res) => res.render('agregar'));

// Procesar agregar
app.post('/agregar', (req, res) => {
	
	let id = req.body.id;
	let nombre = req.body.nombre;
	let apellido = req.body.apellido;
	let email = req.body.email;
	let fono = req.body.fono;
	
	client
		.hmsetAsync(id, [
			'nombre', nombre,
			'apellido', apellido,
			'email', email,
			'fono', fono
		])
		.then(data => {
			console.log(data);
			res.redirect('/');
		})
		.catch(e => {
			console.log(e);
			return;
		});
	
});

// Procesar eliminar
app.delete('/eliminar/:id', (req, res) => {
	
	let id = req.params.id;
	
	client
		.delAsync(id)
		.then(() => {
			res.redirect('/');
		})
		.catch(e => {
			console.log(e);
			return;
		});
	
});

// Iniciar App
app.listen(port, function(){
	console.log('localhost:3000');
});

client.on('connect', function(){
	console.log('redis up');
})