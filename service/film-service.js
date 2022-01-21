const film = require("../models/film-model");
const fileService = require("./file-service");
const path = require('path')
const fs = require('fs');
const ApiError = require("../exeptions/api-error");


class FilmService {
    async create(movie, picture) {
        const name = await film.find({ name: movie.name })
        if (name.length) {
            throw ApiError.BadRequest('Такой фильм уже существует')
        }
        const fileName = fileService.saveFile(picture);
        const time = parseInt(movie.time)
        const genre = movie.genre.split(",")
        const createdPost = await film.create({ ...movie, picture: fileName, time, genre });

        return createdPost;
    }

    async getAll() {
        const Film = await film.find();
        return Film;
    }
    async getOne(name) {

        if (!name) {
            throw ApiError.BadRequest('Название фильма не указано')
        }
        const movie = await film.findOne({ name: name });
        if (!movie) {
            throw ApiError.BadRequest('Фильм не найден')
        }
        return movie;
    }

    async update(movie, picture) {
        let filmName = ""
        const previousUpdateFilm = await film.findOne({ name: movie.name })
        if (picture) {
            const previousFilmPicture = previousUpdateFilm.picture
            if (fs.existsSync(path.resolve('static') + "\\" + previousFilmPicture)) {
                fs.unlinkSync(path.resolve('static') + "\\" + previousFilmPicture)
                previousUpdateFilm.picture = null
            }
            filmName = fileService.saveFile(picture);
        } else {
            filmName = movie.picture
        }
        const time = parseInt(movie.time)
        const genre = movie.genre.split(",")
        const updatedFilm = await film.findOneAndUpdate({ name: movie.name }, { ...movie, picture: filmName, time, genre }, { new: true, upsert: true })
        return updatedFilm;
    }

    async delete(name) {
        if (!name) {
            throw ApiError.BadRequest('Название фильма не указано')
        }
        let movie = await film.findOne({ name: name })
        if (!movie) {
            throw ApiError.BadRequest('Фильм не найден')
        }
        fs.unlinkSync(path.resolve('static') + "\\" + movie.picture)
        movie = await film.findOneAndDelete({ name: name });
        return movie;
    }
    async getFilmGenre(genre) {

        let movie = await film.aggregate([
            { $match: { "genre": { $in: [...genre] } } },
            {
                $group: {
                    _id: "$_id",
                    "name": { "$first": "$name" },
                    "picture": { "$first": "$picture" },
                    "time": { "$first": "$time" },
                    "genre": { "$first": "$genre" },
                    "release": { "$first": "$release" },
                }
            },
            { $limit: 100 }

        ])
        return movie
    }
}


module.exports = new FilmService();