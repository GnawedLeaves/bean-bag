interface PushKeys {
    auth: string;
    p256dh: string;
}

export interface UserSubscription {
    userId: string;
    endpoint: string;
    keys: PushKeys;
    createdAt: Date;
}