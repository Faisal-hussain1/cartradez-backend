const express = require('express');

const {accessMiddleware} = require('../middleware');

const router = express.Router();

const sampleAccessCustomFunction = ({req}) => {};

/**
 * @swagger
 * /api/v1/private/sample:
 *   post:
 *     tags:
 *       - Private
 *     description: A private sample endpoint that requires access control
 *     responses:
 *       200:
 *         description: Private sample response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Response message
 *                   example: "Private Sample"
 *       403:
 *         description: Forbidden - User does not have access to this resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   description: HTTP status code of the response
 *                   example: 403
 *                 message:
 *                   type: string
 *                   description: Error message
 *                   example: "Access denied"
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
  (req, res, next) => res.status(200).json({message: 'Private Sample'})
);

module.exports = router;
