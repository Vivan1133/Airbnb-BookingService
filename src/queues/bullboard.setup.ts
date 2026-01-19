import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express"
import { mailerQueue } from "../queues/mailer.queue"; 


export const setupBullBoard = () => {

    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/admin/queues");

    createBullBoard({
        queues: [new BullMQAdapter(mailerQueue)],
        serverAdapter: serverAdapter,
    });

    return serverAdapter;

}



