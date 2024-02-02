import { Router } from "express";
import { cartModel } from "../models/carts.models.js";
import { productModel } from "../models/products.models.js";

const cartRouter = Router();

cartRouter.get("/", async (req, res) => {
  try {
    const carts = await cartModel.find();

    res.status(200).send({ respuesta: "OK", mensaje: carts });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      respuesta: "Error al obtener los carritos",
      mensaje: error,
    });
  }
});

cartRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const cart = await cartModel.findById(id);
    if (cart) res.status(200).send({ respuesta: "OK", mensaje: cart });
    else
      res.status(404).send({
        respuesta: "Error en consultar Carrito",
        mensaje: "Not Found",
      });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en consulta carrito", mensaje: error });
  }
});

cartRouter.post("/", async (req, res) => {
  try {
    const cart = await cartModel.create({});
    res.status(200).send({ respuesta: "OK", mensaje: cart });
  } catch (error) {
    res
      .status(400)
      .send({ respuesta: "Error en crear Carrito", mensaje: error });
  }
});

cartRouter.post("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await cartModel.findById(cid);
    if (cart) {
      const prod = await productModel.findById(pid);

      if (prod) {
        const indice = cart.products.findIndex((item) => item.id_prod == pid);
        if (indice != -1) {
          cart.products[indice].quantity = quantity;
        } else {
          cart.products.push({ id_prod: pid, quantity: quantity });
        }
        const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
        res.status(200).send({ respuesta: "OK", mensaje: respuesta });
      } else {
        res.status(404).send({
          respuesta: "Error en agregar producto Carrito",
          mensaje: "Produt Not Found",
        });
      }
    } else {
      res.status(404).send({
        respuesta: "Error en agregar producto Carrito",
        mensaje: "Cart Not Found",
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .send({ respuesta: "Error en agregar producto Carrito", mensaje: error });
  }
});

cartRouter.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await cartModel.findById(cid);
    if (cart) {
      const prod = await productModel.findById(pid);

      if (prod) {
        const indice = cart.products.findIndex((item) => item.id_prod == pid);
        if (indice != -1) {
          cart.products[indice].quantity = quantity;
          const respuesta = await cartModel.findByIdAndUpdate(cid, cart);
          res.status(200).send({ respuesta: "OK", mensaje: respuesta });
        } else {
          res.status(404).send({
            respuesta: "Error al modificar producto en el carrito",
            mensaje: "Producto no encontrado en el carrito",
          });
        }
      } else {
        res.status(404).send({
          respuesta: "Error al modificar producto en el carrito",
          mensaje: "Producto no encontrado",
        });
      }
    } else {
      res.status(404).send({
        respuesta: "Error al modificar producto en el carrito",
        mensaje: "Carrito no encontrado",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      respuesta: "Error al modificar producto en el carrito",
      mensaje: error,
    });
  }
});

cartRouter.put("/", async (req, res) => {
  const { products } = req.body;

  try {
    // Verificar si se proporciona la lista completa de productos
    if (products && Array.isArray(products)) {
      // Crear un objeto para almacenar la nueva lista de productos
      const updatedProducts = {};

      // Iterar sobre la lista de productos proporcionada en el cuerpo
      for (const product of products) {
        const { productId, quantity } = product;
        updatedProducts[`products.${productId}.quantity`] = quantity;
      }

      // Actualizar todos los productos en el carrito utilizando findByIdAndUpdate
      const respuesta = await cartModel.updateOne(
        {},
        { $set: updatedProducts }
      );

      res.status(200).send({ respuesta: "OK", mensaje: respuesta });
    } else {
      res.status(400).send({
        respuesta: "Error al actualizar productos en el carrito",
        mensaje: "La lista de productos no se proporciona correctamente",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({
      respuesta: "Error al actualizar productos en el carrito",
      mensaje: error,
    });
  }
});

cartRouter.delete("/", async (req, res) => {
  const { cartId } = req.body;

  try {
    if (!cartId) {
      return res.status(400).send({
        respuesta: "Error al vaciar el carrito",
        mensaje:
          "Se requiere proporcionar el ID del carrito en el cuerpo de la solicitud",
      });
    }

    // Encontrar el carrito por ID
    const cart = await cartModel.findById(cartId);
    if (!cart) {
      return res.status(404).send({
        respuesta: "Error al vaciar el carrito",
        mensaje: "Carrito no encontrado",
      });
    }

    // Vaciar el array de productos en el carrito
    cart.products = [];

    // Guardar el carrito actualizado
    const respuesta = await cart.save();

    res.status(200).send({ respuesta: "OK", mensaje: respuesta });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      respuesta: "Error al vaciar el carrito",
      mensaje: error,
    });
  }
});

cartRouter.delete("/product/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Encuentra el carrito por ID
    const cart = await cartModel.findOne();

    if (!cart) {
      return res.status(404).send({
        respuesta: "Error al eliminar producto del carrito",
        mensaje: "Carrito no encontrado",
      });
    }

    // Encuentra el producto en el array de productos del carrito por id_prod
    const productIndex = cart.products.findIndex(
      (product) => product.id_prod === id
    );

    if (productIndex !== -1) {
      // Elimina el producto del array de productos del carrito
      cart.products.splice(productIndex, 1);

      // Guarda el carrito actualizado
      const respuesta = await cart.save();

      return res.status(200).send({ respuesta: "OK", mensaje: respuesta });
    } else {
      return res.status(404).send({
        respuesta: "Error al eliminar producto del carrito",
        mensaje: "Producto no encontrado en el carrito",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      respuesta: "Error al eliminar producto del carrito",
      mensaje: error,
    });
  }
});

export default cartRouter;
