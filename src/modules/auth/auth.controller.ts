import { Request, Response, NextFunction } from "express";
import * as authService from "./auth.service";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function googleLogin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { idToken } = req.body;
    const result = await authService.googleLogin(idToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  // Stateless JWT - client discards the token
  res.json({ success: true });
}

export async function getSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const session = await authService.getSession(req.user!.userId);
    res.json({ session });
  } catch (err) {
    next(err);
  }
}
