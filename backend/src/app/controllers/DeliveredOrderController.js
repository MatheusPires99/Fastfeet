import { Op } from "sequelize";

import Order from "../models/Order";
import Recipient from "../models/Recipient";
import File from "../models/File";

class DeliveredOrderController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const order = await Order.findAll({
      where: {
        deliveryman_id: req.params.id,
        signature_id: { [Op.not]: null },
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "deliveryman_id", "recipient_id"],
      },
      order: [["id", "DESC"]],
      limit: 10,
      offset: (page - 1) * 10,
      include: [
        {
          model: Recipient,
          as: "recipient",
          attributes: {
            exclude: ["createdAt", "updatedAt"],
          },
        },
        {
          model: File,
          as: "signature",
          attributes: {
            include: ["id", "path", "url"],
          },
        },
      ],
    });

    return res.json(order);
  }
}

export default new DeliveredOrderController();
