const ApiError = require("../exeptions/api-error");
const FilmService = require("../service/film-service");



class FilmController {
    async create(req, res, next) {
        try {
            await FilmService.create(req.file, req.body)
            res.json({ message: "Фильм был успешно добавлен" })
        } catch (e) {
            res.status(400).json({ message: e.message })
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
            const film = await FilmService.getOne(req.params.name)
            return res.json(film)
        } catch (e) {
            res.status(400).json({ message: e.message })

        }
    }
    async findFilmId(req, res, next) {
        try {
            const film = await FilmService.findFilmId(req.params.id)
            return res.json(film)
        } catch (e) {
            res.status(400).json({ message: e.message })
        }
    }
    async update(req, res, next) {
        try {
            const updatedFilm = await FilmService.update(req.body, req.file);
            return res.json(updatedFilm);
        } catch (e) {
            res.status(400).json({ message: e.message })
        }
    }
    async delete(req, res) {
        try {
            await FilmService.delete(req.params.name);
            return res.json({ message: "фильм был удален" })
        } catch (e) {
            res.status(400).json({ message: e.message })
        }
    }
    async getFilmGenre(req, res) {
        try {

            let movie = await FilmService.getFilmGenre(req.body.genre, req.body.limit);
            return res.json(movie)
        } catch (e) {
            res.status(500).json(e.message)
        }
    }
    async searchFilm(req, res) {
        try {
            let film = await FilmService.searchFilm(req.body.name)

            return res.json(film)
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: 'Search error' })
        }
    }
    async getRating(req, res, next) {
        try {
            console.log(req.body)
            console.log(req.user)
            let rating = await FilmService.getRating(req.user, req.body)
            return res.json(rating)
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: e.message })
        }
    }
}


module.exports = new FilmController();