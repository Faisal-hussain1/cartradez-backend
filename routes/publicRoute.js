const express = require('express');

const {accessMiddleware} = require('../middleware');

const router = express.Router();

const sampleAccessCustomFunction = ({req}) => {};

/**
 * @swagger
 * /api/v1/public/sample:
 *   post:
 *     tags:
 *       - Public
 *     description: A public sample endpoint
 *     responses:
 *       200:
 *         description: Public sample response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Response message
 *                   example: "Public Sample"
 *       500:
 *         description: Internal Server Error - An unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Internal server error"
 */

router.post(
  '/sample',
  accessMiddleware({customFn: sampleAccessCustomFunction}),
  (req, res, next) => res.status(200).json({message: 'Public Sample'})
);

module.exports = router;
