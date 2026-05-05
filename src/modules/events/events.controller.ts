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

// ── Attendees ─────────────────────────────────────────────────────────────────

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

// ── Images ────────────────────────────────────────────────────────────────────

export async function uploadImages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ message: "No se enviaron imágenes" });
      return;
    }
    const result = await service.uploadImages(Number(req.params.id), files);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.deleteImage(
      Number(req.params.id),
      Number(req.params.imageId),
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getImages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.getImages(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// ── PDFs ──────────────────────────────────────────────────────────────────────

export async function getPdfVersions(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.getPdfVersions(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getLatestPdf(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const pdf = await service.getLatestPdf(Number(req.params.id));
    res.redirect(pdf.url);
  } catch (err) {
    next(err);
  }
}

export async function regeneratePdf(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await service.regeneratePdf(Number(req.params.id));
    res.json(result);
  } catch (err) {
    next(err);
  }
}
