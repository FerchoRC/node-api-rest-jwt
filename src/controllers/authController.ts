import { Request, Response } from "express";
import { comparePassword, hashPassword } from "../services/password.service";
import prisma from "../models/user";
import { generateToken } from "../services/auth.service";

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email) {
        res.status(400).json({
            message: "el email es obligatorio"})
            return
    }
    
    if (!password) {
        res.status(400).json({
            message: "el password es obligatorio",
          });
          return
    }
    const hashedPassword = await hashPassword(password);
    console.log(hashedPassword);

    const user = await prisma.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(user);
    res.status(201).json({
      token,
    });
  } catch (error: any) {

    if (error?.code === "p2002" && error?.meta?.target?.includes("email")) {
      res.status(400).json({
        message: "el email ya esta registrado",
      });
    }

    console.log(error);
    res.status(500).json({
      error: "hubo un error",
    });
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {

    if (!email) {
        res.status(400).json({
            message: "el email es obligatorio"})
            return
    }
    
    if (!password) {
        res.status(400).json({
            message: "el password es obligatorio",
          });
          return
    }

    const user = await prisma.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({
        error: "usuario no encontrado",
      });
      return;
    }

    const passwordMatch = await comparePassword(password, user.password);
    if(!passwordMatch) {
        res.status(401).json({ error: 'usuario y contraseña incorrecto' })
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
    });

  } catch (error: any) {
    console.log(error)
  }
};
