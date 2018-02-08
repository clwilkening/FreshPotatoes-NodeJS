const sqlite = require('sqlite'),
      Sequelize = require('sequelize'),
      request = require('request'),
      express = require('express'),
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

sequelize.authenticate()
	.then(() => {
		console.log('CONNECTION ESTABLISHED', './db/database.db');
	})
	.catch(err => console.log('CONNECTION FAILED', err));
// ROUTES
app.get('/films/:id/recommendations', getFilmRecommendations);

// ROUTE HANDLER
function getFilmRecommendations(req, res) {
  res.status(500).send('Not Implemented');
}

module.exports = app;
