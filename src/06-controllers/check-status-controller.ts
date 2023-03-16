import express, { NextFunction, Request, Response } from 'express';

const router = express.Router();

router.get('/checkStatus', async (request: Request, response: Response, next: NextFunction) => {
  try {
    response.sendStatus(200)

  } catch (error: any) {
    next(error);
  }
}
);

export default router;
