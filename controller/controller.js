const axios = require("axios");
const excel = require("exceljs");

const Favorite = require("../model/favoritesModal");

exports.getFilms = async (req, res, next) => {
  try {
    const response = await axios.get("https://swapi.dev/api/films");

    const films = response.data;

    const structuredResults = [];

    films.results.map((film) => {
      structuredResults.push({
        id: film.episode_id,
        title: film.title,
        releaseDate: new Date(film.release_date),
      });
    });

    res.status(200).json({ output: structuredResults });
  } catch (err) {
    next(err);
  }
};

exports.postFavorites = async (req, res, next) => {
  const { name } = req.body;
  const { ids } = req.body;
  try {
    const titles = [];
    const releaseDates = [];
    const characters = new Set();

    const alreadyExistingFavoriteName = await Favorite.findOne({ name: name });

    if (alreadyExistingFavoriteName) {
      throw new Error("Name you want to save already exists!");
    }

    ids.forEach(async (id, idx) => {
      const response = await axios.get(`http://swapi.dev/api/films/${id}`);

      const films = response.data;

      titles.push(films.title);
      releaseDates.push(new Date(films.release_date));

      films.characters.forEach((character) => {
        characters.add(character);
      });

      if (ids.length === idx + 1) {
        const favorite = new Favorite({
          name: name,
          releaseDates,
          titles,
          characters: [...characters],
        });

        const favoriteResult = await favorite.save();

        res.status(201).json({ favoriteResult });
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getFavorites = async (req, res, next) => {
  const { page = 1, limit = 2 } = req.query;

  try {
    const results = await Favorite.find()
      .skip((page - 1) * limit)
      .limit(limit);
    res.status(200).json({ results });
  } catch (err) {
    next(err);
  }
};

exports.getFavorite = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await Favorite.findById(id);

    res.status(200).json({ result });
  } catch (err) {
    next(err);
  }
};

exports.getFile = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await Favorite.findById(id);

    let workbook = new excel.Workbook();
    let worksheet = workbook.addWorksheet("Films");

    worksheet.columns = [
      { header: "Characters", key: "characters", width: 40 },
      { header: "Titles", key: "titles", width: 40 },
    ];

    const stringTitles = result.titles.join(",");

    result.characters.forEach((character, idx) => {
      worksheet.addRow([character, stringTitles]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=" + "films.xlsx"
    );
    return workbook.xlsx.write(res).then(function () {
      res.status(200).end();
    });
  } catch (err) {
    next(err);
  }
};
