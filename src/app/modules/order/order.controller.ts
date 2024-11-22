import { Request, Response } from 'express';
import { OrderServices } from './order.service';
import config from '../../config';

const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderData = req.body.order;

    const result = await OrderServices.createOrderIntoDB(orderData);

    // success response
    res.status(201).json({
      message: 'Order created successfully',
      status: true,
      data: result,
    });
  } catch (err: any) {
    // conditional error response
    if (
      err.message === 'Product not found' ||
      err.message === 'Insufficient stock available'
    ) {
      res.status(400).json({
        message: err.message,
        status: false,
      });
    } else {
      // general error response
      res.status(500).json({
        message: err.message || 'Internal server error',
        status: false,
        error: err,
        stack: config.node_env === 'development' ? err.stack : undefined,
      });
    }
  }
};

const calculateRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await OrderServices.calculateRevenueFromDB()

    // success response
    res.status(200).json({
      message: "Revenue calculated successfully",
      status: true,
      data: result,
    })
  } catch (err: any) {
    // general error response
    res.status(500).json({
      message: err.message || "Internal server error",
      status: false,
      error: err,
      stack: config.node_env === "development" ? err.stack : undefined,
    })
  }
}

export const OrderControllers = {
  createOrder,
  calculateRevenue,
};