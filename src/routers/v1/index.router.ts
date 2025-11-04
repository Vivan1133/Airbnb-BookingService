import express from 'express';
import pingRouter from './ping.router';
import bookingRouter from './booking.router';

const v1Router = express.Router();


v1Router.use("/booking", bookingRouter);
v1Router.use('/ping',  pingRouter);

export default v1Router;