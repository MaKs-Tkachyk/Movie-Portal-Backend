const film = require("../models/film-model");
const fileService = require("./file-service");
const path = require('path')
const fs = require('fs');
const ApiError = require("../exeptions/api-error");
const util = require('util');
const { findOneAndUpdate, findById } = require("../models/film-model");
const userModels = require("../models/user-models");
const unlinkFile = util.promisify(fs.unlink)

class FilmService {
    async create(filmPicture, movie) {
        const name = await film.find({ name: movie.name })
        if (name.length) {
            throw ApiError.BadRequest('Такой фильм уже существует')
        }
        const result = await fileService.uploadFile(filmPicture)
        unlinkFile(filmPicture.path)
        const genre = movie.genre.split(",")
        const release = parseInt(movie.release, 10)
        const createdPost = await film.create({ ...movie, genre, picture: result.Location, release });

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
        let key = previousUpdateFilm.picture.split("/").pop()
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
        const release = parseInt(movie.release, 10)
        const updatedFilm = await film.findOneAndUpdate({ name: movie.name }, { ...movie, picture: filmName, genre, release }, { new: true, upsert: true })
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
        let key = movie.picture.split("/").pop()
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
            { $limit: limit },
            { $sort: { release: -1 } }

        ])
        return movie
    }


    async searchFilm(name) {
        return await film.aggregate([
            { $match: { "name": { $regex: name, $options: 'i' } } },
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
            { $sort: { score: { $meta: "textScore" }, release: -1 } }
        ])
    }


    async getRating(userInformation, filmInform) {
        if (!filmInform.rating) {
            throw ApiError.BadRequest('Рейтинг не указан')
        }
        let lastRating = parseInt(filmInform.rating, 10)
        let user = await userModels.findById(userInformation.id)
        const userVoiceOnFilm = user.voice.some(el=>el==filmInform._id)
        console.log(userVoiceOnFilm)
        let movie = await film.findById(filmInform._id)
        if (!userVoiceOnFilm) {
            let rating = ((movie.rating + lastRating) / 2).toFixed(1)
            await film.findOneAndUpdate({ _id: filmInform._id }, { rating }, { upsert: true })
            await userModels.findOneAndUpdate({ _id: userInformation.id }, { voice: [...user.voice, filmInform._id] }, { upsert: true })
            return rating
        } else {
            return movie.rating;
        }
    }
}

module.exports = new FilmService();