import { Router } from "express";
import passport from "passport";

const sessionRouter = Router();

sessionRouter.post(
  "/login",
  passport.authenticate("login"),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).send({ mensaje: "Usuario invalido" });
      }

      req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
      };

      res.status(200).send({ payload: req.user });
    } catch (error) {
      res.status(500).send({ mensaje: `Error al iniciar sesion ${error}` });
    }
  }
);

sessionRouter.post(
  "/register",
  passport.authenticate("register"),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(400).send({ mensaje: "Usuario ya existente" });
      }

      res.status(200).send({ mensaje: "Usuario registrado" });
    } catch (error) {
      res.status(500).send({ mensaje: `Error al registrar usuario ${error}` });
    }
  }
);

sessionRouter.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

sessionRouter.get(
  "/githubCallback",
  passport.authenticate("github"),
  async (req, res) => {
    req.session.user = req.user;
    res.status(200).send({ mensaje: "Usuario logueado" });
  }
);

sessionRouter.get("/logout", (req, res) => {
  if (req.session.login) {
    req.session.destroy();
  }
  res.redirect("rutaLogin", 200, { resultado: "Usuario deslogueado" });
});

sessionRouter.get("/current", (req, res) => {
  try {
    if (req.isAuthenticated()) {
      // Utiliza req.user directamente para obtener la información del usuario
      res.status(200).send({ user: req.user });
    } else {
      res.status(404).send({ mensaje: "No hay sesión actual" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ mensaje: `Error al obtener la sesión actual ${error}` });
  }
});


export default sessionRouter;
