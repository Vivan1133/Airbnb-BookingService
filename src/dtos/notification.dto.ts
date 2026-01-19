export interface NotificationDTO {
    to: string,
    subject: string,
    templateID: string,
    params: Record<string, any>
}