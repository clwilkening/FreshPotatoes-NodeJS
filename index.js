const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      moment = require('moment'),
      app = express();

const { PORT=3000, NODE_ENV='development', DB_PATH='./db/database.db' } = process.env;

// START SERVER
Promise.resolve()
  .then(() => app.listen(PORT, () => console.log(`App listening on port ${PORT}`)))
  .catch((err) => { if (NODE_ENV === 'development') console.error(err.stack); });

const sequelize = new Sequelize({
  host: 'localhost',
  dialect: 'sqlite',
  port: 3000,
  storage: './db/database.db',
  define: {timestamps: false},
  sync: {force:true}
})

const Films = sequelize.define('film', {
	id: {type: Sequelize.INTEGER, primaryKey: true},
	title: Sequelize.STRING,
	release_date: Sequelize.STRING,
	tagline: Sequelize.STRING,
	revenue: Sequelize.BIGINT,
	budget: Sequelize.BIGINT,
	runtime: Sequelize.INTEGER,
	original_language: Sequelize.STRING,
	status: Sequelize.STRING,
	genre_id: Sequelize.INTEGER
}, {
	tableName: 'films',
	define: {timestamps: false}
});

Films.sync().then(() => console.log('SYNCED'));

sequelize.authenticate()
	.then(() => {
		console.log('CONNECTION ESTABLISHED', './db/database.db');
	})
	.catch(err => console.log('CONNECTION FAILED', err));
// ROUTES
app.get('/films/:id/recommendations', getFilmRecommendations);

// ROUTE HANDLER
function getFilmRecommendations(req, res) {
	// Films.findAll()
	// .then(films => {
	// 	console.log('films ', films)
	// })

	return Films.findById(parseInt(req.params.id))
 //  .then((film) => {
	// 	//console.log('film ', film);
	// 	return film;
	//   //res.json(films);
	// })
	.then((film) => {
		//get all films where genre matches
		//console.log('film foundById', film)
		//console.log(film.release_date);
		//var minus15 = new Date(film.release_date);
		var minus15 = moment(film.release_date).subtract(15, 'years').format('YYYY MM DD');
		//console.log('minus15', minus15)
		//console.log(minus15);
		var plus15 = moment(film.release_date).add(15, 'years').format('YYYY MM DD');
		//console.log(plus15)
		//var Op = Sequelize.Op; not in v3
	  return Films.findAll({
			where: [ 
				`genre_id=${film.genre_id} and release_date >= '${minus15}' and release_date <= '${plus15}'`
			]
		})
		// .then((films) => {
		// 	console.log('genres ', films)
		// 	//res.json(films)
		// 	return films;
		// })
	.then((films) => {
		//console.log('filmss', films);
		//using matching genres, get reviews for each and calculate the average rating
		//console.log('films', films[0].dataValues.id)
		//console.log('films length', films.length);
		let ids = [];
		films.forEach((film, i) => {
			//console.log(film.id)
			ids.push(film.id);
		})
		return ids;
		
		// Films.findAll({
		// 	where: {
		// 		genre_id = film.genre_id,

		// 	}
		// })
		})
	.then((ids) => {
		console.log('ids', ids)
	})
	})
  //res.status(500).send('Not Implemented');
}

module.exports = app;
