import { type Request, type Response, type NextFunction } from 'express';



export function requireAuth(minRole: number) {
    return function (req: Request, res: Response<{ message: string }>, next: NextFunction) {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userRole = req.session.role ?? 0;

        if (userRole < minRole) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        next();
    };
}