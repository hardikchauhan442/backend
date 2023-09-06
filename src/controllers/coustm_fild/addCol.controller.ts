import { error } from 'console';
import db from './../../models';

class addCol {
  errors: any;
  constructor() {}
  async create(req, res, next) {
    const { id } = req.params;
    const { notNull, type, name, defaultValue, option, labal, inputType } =
      req.body;

    const data = await db['customfield'].create({
      modelId: id,
      notNull,
      type,
      name,
      labal,
      defaultValue,
      inputType,
      option,
    });
    return res.status(201).json({ massage: 'successfully created' });
  }
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const data = await db['customfield'].findOne({
        where: {
          id: id,
        },
      });
      if (!data) {
        return res.status(404).json({ massage: 'Data is not found' });
      }
      await db['customfield'].destroy({
        where: {
          id: id,
        },
      });
      return res.status(200).json({ massage: 'successfully delete' });
    } catch (error) {
      next(error);
    }
  }
  async findModelFiled(req, res, next) {
    try {
      const { id } = req.params;
      const data = await db['customfield'].findAll({
        where: {
          modelId: id,
        },
      });
      if (!data) {
        return res.status(404).json({ massage: 'data not found', data: [] });
      }
      return res.status(200).json({ massage: 'successfully get', data: data });
    } catch (error) {
      next(error);
    }
  }
}

export default addCol;
