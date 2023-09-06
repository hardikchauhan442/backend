import { error } from 'console';
import db from './../../models';

class Model {
  errors: any;
  constructor() {}
  async create(req, res, next) {
    const { modelName } = req.body;

    const data = await db['model'].create({
      modelName,
    });
    return res.status(201).json({ massage: 'successfully created' });
  }
  async findModel(req, res, next) {
    try {
      const { id } = req.params;
      const data = await db['model'].findAll({});
      if (!data) {
        return res.status(404).json({ massage: 'data not found', data: [] });
      }
      return res.status(200).json({ massage: 'successfully get', data: data });
    } catch (error) {
      next(error);
    }
  }
}

export default Model;
