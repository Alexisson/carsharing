import { Router } from "express";
import pool from "../db.js";

const route = Router();

export default route
  .get("/getcarlist/:class", async (r) => {
    if (r.params.class.toString() === "0") {
      const data = await pool.query(
        'SELECT CAR."ID", CAR."MODEL", CAR."YEAR", CAR."PHOTO", CL."CLASS", CL."COST", COALESCE(RT."RATING",0) AS "RATING" FROM "CARSHARING"."CARS" CAR LEFT JOIN "CARSHARING"."CLASS" CL ON CAR."CLASS" = CL."ID" LEFT JOIN (SELECT O."ID_CAR", ROUND(AVG(O."RATING"),2) AS "RATING" FROM "CARSHARING"."ORDER" O GROUP BY O."ID_CAR") RT ON RT."ID_CAR" = CAR."ID" WHERE CAR."ID" NOT IN ( SELECT "ID_CAR" FROM "CARSHARING"."ORDER" WHERE "FINISH_TIMESTAMP" IS NULL)  ORDER BY CAR."MODEL"'
      );
      r.res.send(data.rows);
    } else {
      const data = await pool.query(
        'SELECT CAR."ID", CAR."MODEL", CAR."YEAR", CAR."PHOTO", CL."CLASS", CL."COST", COALESCE(RT."RATING",0) AS "RATING" FROM "CARSHARING"."CARS" CAR LEFT JOIN "CARSHARING"."CLASS" CL ON CAR."CLASS" = CL."ID" LEFT JOIN (SELECT O."ID_CAR", ROUND(AVG(O."RATING"),2) AS "RATING" FROM "CARSHARING"."ORDER" O GROUP BY O."ID_CAR") RT ON RT."ID_CAR" = CAR."ID" WHERE CAR."ID" NOT IN ( SELECT "ID_CAR" FROM "CARSHARING"."ORDER" WHERE "FINISH_TIMESTAMP" IS NULL) AND CAR."CLASS" = $1 ORDER BY CAR."MODEL"',
        [r.params.class.toString()]
      );
      r.res.send(data.rows);
    }
  })
  .get("/history/:id_user", async (r) => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log(tz);
    const data = await pool.query(
      'SELECT CAR."MODEL", to_char(to_timestamp(O."START_TIMESTAMP")::timestamp,\'YYYY-MM-DD HH24:MI:SS\') as "START_TIMESTAMP", to_char(to_timestamp(O."FINISH_TIMESTAMP")::timestamp,\'YYYY-MM-DD HH24:MI:SS\') as "FINISH_TIMESTAMP", O."RATING", O."SUMMARY" FROM "CARSHARING"."ORDER" O LEFT JOIN "CARSHARING"."CARS" CAR ON CAR."ID" = O."ID_CAR" WHERE O."ID_USER" = $1  ',

      [r.params.id_user]
    );

    r.res.send(data.rows);
  })
  .all("/getclasses/", async (r) => {
    const data = await pool.query(
      'SELECT "ID", "CLASS" FROM "CARSHARING"."CLASS"'
    );

    r.res.send(data.rows);
  });
