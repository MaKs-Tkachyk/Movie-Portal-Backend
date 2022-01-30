const film = require("../models/film-model");
const fileService = require("./file-service");
const path = require('path')
const fs = require('fs');
const ApiError = require("../exeptions/api-error");
const util = require('util')
const unlinkFile = util.promisify(fs.unlink)

class FilmService {
    async create(filmPicture, movie) {
        unlinkFile(filmPicture.path)
        const name = await film.find({ name: movie.name })
        if (name.length) {
            throw ApiError.BadRequest('Такой фильм уже существует')
        }
        const result = await fileService.uploadFile(filmPicture)
        
        const genre = movie.genre.split(",")

        const createdPost = await film.create({ ...movie, genre, picture: result.Location });

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
    async findFilmId(_id) {
        if (!_id) {
            throw ApiError.BadRequest('Название фильма не указано')
        }
        const movie = await film.findById(_id);
        if (!_id) {
            throw ApiError.BadRequest('Фильм не найден')
        }

        return movie;
    }
    async update(movie, picture) {
        let filmName = ""
        const previousUpdateFilm = await film.findOne({ name: movie.name })
        let key  = previousUpdateFilm.picture.split("/").pop()
        let result = await fileService.checkFile(key)
        if (result == "403" && picture) {
            fileService.deleteFile(key)
            const newImgFilm = await fileService.uploadFile(picture)
            unlinkFile(picture.path)
            filmName = newImgFilm.Location
        } else {
            filmName = previousUpdateFilm.picture
        }
        const genre = movie.genre.split(",")

        const updatedFilm = await film.findOneAndUpdate({ name: movie.name }, { ...movie, picture: filmName,  genre }, { new: true, upsert: true })
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
        let key  = movie.picture.split("/").pop()
        fileService.deleteFile(key)
        movie = await film.findOneAndDelete({ name: name });
        return movie;
    }
    async getFilmGenre(genre, limit) {

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
            { $limit: limit }

        ])
        return movie
    }
}


module.exports = new FilmService();