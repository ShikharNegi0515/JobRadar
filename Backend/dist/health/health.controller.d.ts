export declare class HealthController {
    check(): {
        success: boolean;
        data: {
            status: string;
            timestamp: string;
            service: string;
        };
    };
}
