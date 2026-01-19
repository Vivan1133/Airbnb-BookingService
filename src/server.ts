import express from 'express';
import { serverConfig } from './config';
import v1Router from './routers/v1/index.router';
import v2Router from './routers/v2/index.router';
import { appErrorHandler, genericErrorHandler } from './middlewares/error.middleware';
import logger from './config/logger.config';
import { attachCorrelationIdMiddleware } from './middlewares/correlation.middleware';
// import { addMailToQueue } from './producers/mailer.producer';
import { setupBullBoard } from './queues/bullboard.setup';
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}))
app.use(express.text());

/**
 * Registering all the routers and their corresponding routes with out app server object.
 */

app.use(attachCorrelationIdMiddleware);
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router); 
app.use("/admin/queues", setupBullBoard().getRouter());


/**
 * Add the error handler middleware
 */

app.use(appErrorHandler);
app.use(genericErrorHandler);


app.listen(serverConfig.PORT, () => {
    logger.info(`Server is running on http://localhost:${serverConfig.PORT}`);
    logger.info(`Press Ctrl+C to stop the server.`);

    // addMailToQueue({
    //     to: "anirudhkmr9876@gmail.com",
    //     subject: "Welcome email",
    //     templateID: "welcome",
    //     params: { "name": "Vivan", "appName": "Booking.com" }
    // })

});
