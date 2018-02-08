const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
      moment = require('moment'),
      axios = require('axios'),
      _ = require('lodash'),
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
	return Films.findById(parseInt(req.params.id))
	.then((film) => {
		//get all films where genre matches
		var minus15 = moment(film.release_date).subtract(15, 'years').format('YYYY MM DD');
		var plus15 = moment(film.release_date).add(15, 'years').format('YYYY MM DD');
		//var Op = Sequelize.Op; not in v3
	  return Films.findAll({
			where: [ 
				`genre_id=${film.genre_id} and release_date >= '${minus15}' and release_date <= '${plus15}'`
			]
		})
	})
	.then((films) => {
		//using matching genres, get reviews for each and calculate the average rating
		let ids = [];
		films.forEach((film, i) => {
			ids.push(film.id);
		});
		return ids;
		})
		.then((ids) => {
			let promise = Promise.resolve(null);
		  let movieRatings = [];
		 	ids.forEach((id, i) => {
				let obj = {};
			  let ratings = [];
				promise = promise.then(() => {
					return axios.get(`http://credentials-api.generalassemb.ly/4576f55f-c427-4cfc-a11c-5bfe914ca6c1?films=${id}`)
					.then((res) => {
						let newArray = [];
						const blob = res.data[0].reviews;
						blob.forEach((rating, i) => {
							ratings.push(rating.rating);
						});
						obj.id = id;
						obj.rating = ratings;
						newArray.push(obj);
						movieRatings.push(newArray);
					})
					.catch(err => {
						console.error('err', err);
					});
				});
			});
	 	return promise.then(() => {
	 		return movieRatings;
	 	})
	})
	.then((ratings) => {
		//ratings must be >= 5
		//avg must be 4 or higer
		let recommendations = [];
		ratings.forEach((arr, i) => {
			let recomObj = {};
			console.log(arr[i]);
			if (arr[i].rating !== undefined) {
				if (arr[i].rating.length >= 4) {
					let avg = _.mean(arr[i].rating);
					if (avg >= 4) {
						recomObj.id = arr[i].id;
						recomObj.averageRating = avg;
						recomObj.reviews = length;
					};
				};
			  recommendations.push(recomObj);			
			};
		});
		return recommendations;
	})
	.then((recommendations) => {
		//TODO: build correct recommendations object
		console.log('recs', recommendations);
	})
	.catch(err => {
		console.log(err.message);
		res.json('message: ' + err.message);
	});
};

module.exports = app;
