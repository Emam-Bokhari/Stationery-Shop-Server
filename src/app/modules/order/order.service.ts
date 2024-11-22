import { Product } from '../product/product.model';
import { TOrder } from './order.interface';
import { Order } from './order.model';

const createOrderIntoDB = async (orderData: TOrder) => {
    const { product, quantity } = orderData;

    const foundProduct = await Product.findById(product);

    if (!foundProduct) {
        throw new Error('Product not found');
    }

    if (foundProduct.quantity < quantity) {
        throw new Error('Insufficient stock available');
    }

    await Product.findByIdAndUpdate(
        product,
        {
            $inc: { quantity: -quantity },
            $set: { inStock: foundProduct.quantity - quantity > 0 },
        },
        { new: true },
    );

    const result = await Order.create(orderData);
    return result;
};

// Calculate Revenue function
const calculateRevenueFromDB = async () => {

    const revenueData = await Order.aggregate([

        {
            $lookup: {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: "productDetails"
            }
        },

        { $unwind: "$productDetails" },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: { $multiply: ["$quantity", "$productDetails.price"] } }
            }
        },

        {
            $project: {
                _id: 0,
                totalRevenue: 1,
            },
        },
    ]);


    return revenueData

};

export const OrderServices = {
    createOrderIntoDB,
    calculateRevenueFromDB,
};