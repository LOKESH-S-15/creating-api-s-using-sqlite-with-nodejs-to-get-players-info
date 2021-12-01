const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
      console.log(database);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

let convertDbObjectToDatabaseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  let getPlayersDetails = `
     SELECT
   *
    FROM
       cricket_team;`;
  const playersArray = await database.all(getPlayersDetails);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToDatabaseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  let { playerName, jerseyNumber, role } = request.body;
  let addPlayersDetails = `
     INSERT INTO cricket_team
     (
         player_name,jersey_number,role
     )VALUES('${playerName}',${jerseyNumber},'${role}')
       ; `;
  const playersArray = await database.run(addPlayersDetails);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getPlayersDetails = `
     SELECT
   *
    FROM
       cricket_team
       WHERE player_id=${playerId};`;
  const player = await database.get(getPlayersDetails);

  response.send(convertDbObjectToDatabaseObject(player));
});

app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let { playerName, jerseyNumber, role } = request.body;
  let getPlayersDetails = `
     UPDATE cricket_team
     SET
     
    player_Name= '${playerName}',
    jersey_Number=${jerseyNumber},
    role='${role}'

       WHERE player_id=${playerId};`;
  const player = await database.all(getPlayersDetails);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let getPlayersDetails = `
    DELETE FROM 
    cricket_team
       WHERE player_id=${playerId};`;
  const player = await database.all(getPlayersDetails);

  response.send("Player Removed");
});

module.exports = app;
