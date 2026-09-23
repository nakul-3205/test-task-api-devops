export declare class AuthService {
    register(email: string, password: string, name?: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
        };
        token: string;
    }>;
    login(email: string, password: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
        };
        token: string;
    }>;
    private generateToken;
}
//# sourceMappingURL=auth.service.d.ts.map