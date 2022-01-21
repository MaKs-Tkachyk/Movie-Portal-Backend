const ApiError = require("../exeptions/api-error");
const FilmService = require("../service/film-service");



class FilmController {
    async create(req, res, next) {
        try {
            await FilmService.create(req.body, req.files.picture)
            res.json({ message: "Фильм был успешно добавлен" })
        } catch (e) {
            next(e)
        }
    }

    async getAll(req, res) {
        try {
            const posts = await FilmService.getAll();
            return res.json(posts);
        } catch (e) {
            res.status(500).json(e)
        }
    }
    async getOne(req, res, next) {
        try {
            const post = await FilmService.getOne(req.params.name)
            return res.json(post)
        } catch (e) {
            next(e)
        }
    }
    async update(req, res, next) {
        try {
            let picture
            if(!req.files) picture = false
            else picture = req.files.picture
            const updatedFilm = await FilmService.update(req.body, picture);
            return res.json(updatedFilm);
        } catch (e) {
            next(e)
        }
    }
    async delete(req, res) {
        try {
            await FilmService.delete(req.params.name);
            return res.json({ message: "фильм был удален" })
        } catch (e) {
            res.status(500).json(e.message)
        }
    }
    async getFilmGenre(req, res) {
        try {
         console.log(req.body.genre)
         let movie = await FilmService.getFilmGenre(req.body.genre);
            return res.json(movie)
        } catch (e) {
            res.status(500).json(e.message)
        }
    }
}


module.exports = new FilmController();