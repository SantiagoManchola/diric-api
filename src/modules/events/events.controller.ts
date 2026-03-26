import { Request, Response, NextFunction } from "express";
import * as service from "./events.service";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.getAll(
      req.query.search as string | undefined,
      req.user!.primaryRole,
      req.user!.userId,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.getById(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.create(req.body, req.user!.userId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.update(Number(req.params.id), req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.remove(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function addAttendee(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.addAttendee(Number(req.params.id), req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateAttendee(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.updateAttendee(
      Number(req.params.attendeeId),
      req.body.status,
      req.body.note,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function removeAttendee(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.removeAttendee(Number(req.params.attendeeId));
    res.json(result);
  } catch (err) {
    next(err);
  }
}
