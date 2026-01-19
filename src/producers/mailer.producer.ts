
import { NotificationDTO } from "../dtos/notification.dto"
import { mailerQueue } from "../queues/mailer.queue" 

export const MAILER_PAYLOAD = "payload:mailer"

export const addMailToQueue = async (payload : NotificationDTO) => {
    await mailerQueue.add(MAILER_PAYLOAD, payload)
}