import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Wallet, Transaction } from '../models';
import { TransferService } from '../services/transferService';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { Op } from 'sequelize';

export const getWalletDetails = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User ID is missing from token.');
    }

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      throw new NotFoundError('Wallet not found.');
    }

    return res.json({ wallet });
  } catch (error) {
    next(error);
  }
};

export const transferFunds = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const senderUserId = req.user?.id;
    if (!senderUserId) {
      throw new BadRequestError('User ID is missing from token.');
    }

    const { receiverEmail, amount, referenceNote } = req.body;

    const result = await TransferService.executeTransfer({
      senderUserId,
      receiverEmail,
      amount: parseFloat(amount),
      referenceNote,
      ipAddress: req.ip,
    });

    return res.json({
      message: 'Money transfer completed successfully!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User ID is missing from token.');
    }

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      throw new NotFoundError('Wallet not found.');
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const { rows: transactions, count: total } = await Transaction.findAndCountAll({
      where: {
        [Op.or]: [{ senderWalletId: wallet.id }, { receiverWalletId: wallet.id }],
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return res.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};
