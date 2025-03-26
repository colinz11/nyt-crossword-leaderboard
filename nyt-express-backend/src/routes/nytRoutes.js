const express = require('express');
const NytController = require('../controllers/nytController');

const router = express.Router();
const nytController = new NytController();

function setRoutes(app) {
    router.get('/articles', nytController.fetchArticles.bind(nytController));
    router.post('/articles', nytController.saveArticle.bind(nytController));
    
    app.use('/nyt', router);
}

module.exports = setRoutes;