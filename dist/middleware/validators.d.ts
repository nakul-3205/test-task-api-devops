import { Request, Response, NextFunction } from 'express';
export declare const validate: (req: Request, _res: Response, next: NextFunction) => void;
export declare const registerValidator: (((req: Request, _res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const loginValidator: (((req: Request, _res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const taskValidator: (((req: Request, _res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
export declare const idParamValidator: (((req: Request, _res: Response, next: NextFunction) => void) | import("express-validator").ValidationChain)[];
//# sourceMappingURL=validators.d.ts.map