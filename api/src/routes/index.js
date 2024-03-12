const { Router } = require('express');
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');

// //REQUIRE GET
const getClientes = require("../controllers/Get/GetAllClients.js")
const getUsers = require("../controllers/Get/GetAllUsers.js")
const getFuncionalidades = require("../controllers/Get/GetAllFuncionalidades.js")
// const getAllCarts = require("../controllers/Get/GetAllCarts")


// //REQUIRE GET_ID
const getClienteId = require("../controllers/Get/GetId/GetIdClient.js")
// const getProcedureId = require("../controllers/Get/Get_id/GetProcedureId")
// const getUserId = require("../controllers/Get/Get_id/GetUserId")
// const getOrderId = require("../controllers/Get/Get_id/GetOrderId")
// const getProductId = require("../controllers/Get/Get_id/GetProductId")
// const getCart = require("../controllers/Get/Get_id/GetCartId")


// //REQUIRE PATCH
const patchUsuario = require("../controllers/Patch/PatchUsuario.js")
const patchCliente = require("../controllers/Patch/PatchCliente.js")
const patchFuncionalidades = require("../controllers/Patch/PatchFuncionalidades.js")
// const putProcedure = require("../controllers/Put/PutProcedure")
// const putProducts = require("../controllers/Put/PutProducts")
// const putUsers = require("../controllers/Put/PutUsers")

// //REQUIRE POST
const postClient = require("../controllers/Post/PostCliente.js")
const postUser = require("../controllers/Post/PostUsuario.js")
const postCustomizaciones = require("../controllers/Post/PostCustomizaciones.js")
const postFuncionalidades = require("../controllers/Post/PostFuncionalidades.js")
const postLanding = require("../controllers/Post/PostLanding.js")
const login = require("../controllers/Post/PostLogin.js")

// const postUsers = require("../controllers/Post/PostUsers")

// //REQUIRE DELETE
const deleteCustomizaciones = require("../controllers/Delete/DeleteCustomizaciones.js")
// const deleteConsultation = require("../controllers/Delete/DeleteConsultation")
// const deleteOrders = require("../controllers/Delete/DeleteOrders")
// const deleteProcedure = require("../controllers/Delete/DeleteProcedure")
// const deleteProducts = require("../controllers/Delete/DeleteProducts")
// const deleteUsers = require("../controllers/Delete/DeleteUsers")



const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

// //GET
router.use("/clientes", getClientes)
router.use("/usuarios", getUsers)
router.use("/funcionalidades", getFuncionalidades)
// router.use("/procedures", getProcedure)
// router.use("/carts", getAllCarts)




// //POST
router.use("/cliente", postClient)
router.use("/usuario", postUser)
router.use("/customizaciones", postCustomizaciones)
router.use("/funcionalidades", postFuncionalidades)
router.use("/landing", postLanding)
router.use("/login", login)
// router.use("/cart", postCart)
 
// //PATCH
router.use("/usuario", patchUsuario)
router.use("/cliente", patchCliente)
router.use("/funcionalidades", patchFuncionalidades)
// router.use("/orders", putOrders)
// router.use("/procedure", putProcedure)
// router.use("/cart", putCart)

// //DELETE
router.use("/customizaciones", deleteCustomizaciones)
// router.use("/products", deleteProducts)
// router.use("/consultation", deleteConsultation)
// router.use("/orders", deleteOrders)
// router.use("/procedure", deleteProcedure)
// router.use("/cart", deleteCart)

// //GETBYID
router.use("/clienteid", getClienteId)
// router.use("/order",getOrderId)
// router.use("/product",getProductId)
// router.use("/procedure", getProcedureId)
// router.use("/cart", getCart)



module.exports = router;
