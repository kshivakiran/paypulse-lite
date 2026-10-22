import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { User, Wallet, AuditLog } from '../models';
import { getJwtSecret } from '../middleware/auth';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/errors';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('User with this email already exists. Please login instead.');
    }

    const userId = crypto.randomUUID();
    const walletId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({ id: userId, name, email, passwordHash, role: 'customer' });
    const wallet = await Wallet.create({ id: walletId, userId, balance: 1000.0, currency: 'INR', status: 'active' });

    if (mongoose.connection.readyState === 1) {
      AuditLog.create({
        eventType: 'USER_REGISTERED',
        userId: user.id,
        details: { email, walletId: wallet.id },
        ipAddress: req.ip,
      }).catch(() => {});
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      message: 'User registered successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      wallet: { id: wallet.id, balance: wallet.balance, currency: wallet.currency },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Wallet, as: 'wallet' }],
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const storedHash = user.passwordHash;
    if (!storedHash) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    if (mongoose.connection.readyState === 1) {
      AuditLog.create({
        eventType: 'USER_LOGIN',
        userId: user.id,
        details: { email },
        ipAddress: req.ip,
      }).catch(() => {});
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    const userWallet = (user as any).wallet;

    return res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      wallet: userWallet,
    });
  } catch (error) {
    next(error);
  }
};
