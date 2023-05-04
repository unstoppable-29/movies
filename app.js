const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
//API 1
app.get("/movies/", async (request, response) => {
  const getMovies = `
    SELECT
      movie_name
    FROM
       movie;`;
  const moviesArray = await db.all(getMovies);
  response.send(
    moviesArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});
//post method API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
    INSERT INTO
      movie ( director_id, movie_name, lead_actor)
    VALUES
      (
        ${directorId},
         '${movieName}',
         '${leadActor}'
      );`;
  const dbResponse = await db.run(addMovieQuery);
  response.send(`Movie Successfully Added`);
});
const convertDbObjectToResponseObject1 = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
//get method for returning one movie API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
      *
    FROM
       movie
       where movie_id=${movieId};`;
  const movieArray = await db.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject1(movieArray));
});
//put API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const updateMovieDetails = request.body;
  const { directorId, movieName, leadActor } = updateMovieDetails;
  const updateMovieQuery = `
    update movie
    set
        director_id=${directorId},
         movie_name='${movieName}',
         lead_actor='${leadActor}'
      where 
      movie_id=${movieId};`;
  await db.run(updateMovieQuery);
  response.send(`Movie Details Updated`);
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});
const convertDbObjectToResponseObject3 = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
//get API 6 from directors table
app.get("/directors/", async (request, response) => {
  const getdirectors = `
    SELECT
      *
    FROM
       director;`;
  const directorsArray = await db.get(getdirectors);
  response.send(convertDbObjectToResponseObject3(directorsArray));
});
//get particular director movie name API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT
     movie_name
    FROM
     movie
    WHERE
      director_id = ${directorId};`;
  const total = await db.get(getDirectorQuery);
  response.send(convertDbObjectToResponseObject1(total));
});
module.exports = app;
