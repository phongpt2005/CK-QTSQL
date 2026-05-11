export declare class MailService {
    private readonly logger;
    private transporter;
    constructor();
    sendResetCode(toEmail: string, code: string): Promise<void>;
}
