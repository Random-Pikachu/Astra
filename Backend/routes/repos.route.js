const express = require("express");
const  {storeRepo, getRepoList, removeRepo} = require('../controllers/repo.controller')

const router = express.Router();

// POST /api/repos/scan
router.post("/store-directory", storeRepo);
router.get("/get-repoList/:userCode", getRepoList);
router.delete("/remove-repo/:userCode/:repoCode", removeRepo);
module.exports = router;
