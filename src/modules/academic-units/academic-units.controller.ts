import { Request, Response, NextFunction } from "express";
import * as service from "./academic-units.service";

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.getAll(req.query.search as string | undefined);
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
    const result = await service.create(req.body);
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

export async function associateProfessor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.associateProfessor(
      Number(req.params.id),
      req.body.professor_id,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function disassociateProfessor(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.disassociateProfessor(
      Number(req.params.academicUnitId),
      Number(req.params.professorId),
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
