import Middleware from "./middleware";
import express from "express";
import cors from "cors";
import passport from "passport";
import { set } from "mongoose";

const middleware = new Middleware(express());

const setUpRoutes = (middleware: Middleware) => {
  middleware.addMiddleware(
    "/healthcheck",
    (req: express.Request, res: express.Response) => {
      res.status(200).send("Demo Credit Server is up and running!");
    }
  );
};

const setUpMiddleware = () => {
  middleware.addMiddleware(cors());
  middleware.addMiddleware(express.json());
  middleware.addMiddleware(passport.initialize());

  setUpRoutes(middleware);
};

setUpMiddleware();

export default middleware;
