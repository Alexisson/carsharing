import { Router } from "express";
import fs from "fs";
import CryptoJS from "crypto-js";
import pool from "../db.js";
import { v4 } from "uuid";

const route = Router();

export default route
  .get("/", (r) => {
    r.res.render("./pages/index", { title: "Главная страница" });
  })
  .get("/register", (r) => {
    r.res.render("./pages/register", { title: "Регистрация" });
  })
  .post("/register", (r) => {
    pool.query(
      'INSERT INTO "CARSHARING"."USERS" ("ID","LASTNAME", "FIRSTNAME", "LOGIN", "PASSWORD", "PHONE", "EMAIL") VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [
        v4(),
        r.body.last_name,
        r.body.first_name,
        r.body.login,
        CryptoJS.SHA256(r.body.password).toString(),
        r.body.phone,
        r.body.email,
      ],
      (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          console.log(res.rows[0]);
        }
      }
    );
    // console.log(date);
    r.res.redirect("/");
  })
  .post("/login", async (r) => {
    const res = await pool.query(
      'SELECT "ID", "LOGIN", "PASSWORD" FROM "CARSHARING"."USERS" WHERE "LOGIN" = $1',
      ["Droid"]
    );
    console.log();
    if (
      r.body.login === res.rows[0].LOGIN &&
      CryptoJS.SHA256(r.body.password).toString() === res.rows[0].PASSWORD
    )
      r.res.redirect("/main/" + res.rows[0].ID);
    else r.res.send("Fail");
  })
  .get("/main/:id", async (r) => {
    const res = await pool.query(
      'SELECT COUNT(*) AS "CNT" FROM "CARSHARING"."ORDER" WHERE "ID_USER" = $1 AND "FINISH_TIMESTAMP" IS NULL',
      [r.params.id]
    );
    console.log(res.rows[0].CNT);
    if (parseInt(res.rows[0].CNT) === 0)
      r.res.render("./pages/main", {
        title: "Главная страница",
        id_user: r.params.id,
      });
    else {
      const RENT = await pool.query(
        'SELECT "ID_USER", "ID_CAR" FROM "CARSHARING"."ORDER" WHERE "ID_USER" = $1 AND "FINISH_TIMESTAMP" IS NULL',
        [r.params.id]
      );
      console.log(RENT.rows);
      r.res.redirect(
        "/return/" + RENT.rows[0].ID_CAR + "/" + RENT.rows[0].ID_USER
      );
    }
  })
  .get("/rent/:id_car/:id_user", (r) => {
    pool.query(
      'INSERT INTO "CARSHARING"."ORDER" ("ID_USER","ID_CAR", "START_TIMESTAMP") VALUES ($1,$2,$3)',
      [r.params.id_user, r.params.id_car, Math.floor(Date.now() / 1000)],
      (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          r.res.redirect("/return/" + r.params.id_car + "/" + r.params.id_user);
        }
      }
    );
  })
  .get("/return/:id_car/:id_user", (r) => {
    r.res.render("./pages/car_return", {
      title: "Возврат автомобиля",
      data: { id_car: r.params.id_car, id_user: r.params.id_user },
    });
  })
  .post("/return/:id_car/:id_user", (r) => {
    pool.query(
      'UPDATE "CARSHARING"."ORDER" SET "FINISH_TIMESTAMP" = $1, "RATING" = $2 WHERE "ID_USER" = $3 AND "ID_CAR" = $4 AND "FINISH_TIMESTAMP" IS NULL',
      [
        Math.floor(Date.now() / 1000),
        parseInt(r.body.rating),
        r.params.id_user,
        r.params.id_car,
      ],
      (err, res) => {
        if (err) {
          console.log(err.stack);
        } else {
          pool.query(
            'UPDATE "CARSHARING"."ORDER" SET "SUMMARY" = (SELECT ROUND(CO."COST"*(O."FINISH_TIMESTAMP"-O."START_TIMESTAMP")/60,2) AS COST FROM "CARSHARING"."ORDER" O LEFT JOIN "CARSHARING"."CARS" CAR ON O."ID_CAR" = CAR."ID" LEFT JOIN "CARSHARING"."CLASS" CO  ON CAR."CLASS" = CO."ID" WHERE O."ID_USER" = $1 AND O."SUMMARY" IS NULL) WHERE "ID_USER" = $2 AND "SUMMARY" IS NULL',
            [r.params.id_user, r.params.id_user],
            (err, res) => {
              if (err) {
                console.log(err.stack);
              } else {
                r.res.redirect("/main/" + r.params.id_user);
              }
            }
          );
        }
      }
    );
  })
  .get("/history/:id", (r) => {
    r.res.render("./pages/drive_history", {
      title: "История поездок",
      id_user: r.params.id,
    });
  });
