import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(): Promise<{
        id: string;
        type: string;
        title: string;
        description: string;
        time: Date;
    }[]>;
}
