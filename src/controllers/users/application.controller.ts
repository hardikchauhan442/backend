/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';

import db from '../../models';
let model = 'User';
class ApplicationController {
  errors: any;
  constructor(m) {
    model = m;
  }

  async _create(req, res, next) {
    try {
      const user = await db[model].findOne({
        where: { email: req.body.email },
      });
      const data = await db['model'].findOne({
        where: { modelName: model },
        include: [{ all: true }],
      });
      // if (!user) {
      const create = await db[model].create(req.body);
      await data.customfields.map(async (ele) => {
        const data = req.body;
        const name = ele.name;
        await db['customfieldValue'].create({
          name: ele.name,
          value: req.body[`${ele.name}`],
          modelDataId: create.id,
          coustamfiledId: ele.id,
        });
      });
      // }
      return res.status(400).json({ message: 'user already exits!' });
    } catch (error) {
      next(error);
    }
  }
  async getData(req, res, next) {
    try {
      const user = await db[model].findAll({ include: [{ all: true }] });
      const otherFiled = await db['model'].findAll({
        where: { modelName: model },
        include: [{ all: true }],
      });
      const coustm = await db['customfieldValue'].findAll({
        include: [{ all: true }],
      });
      let obj = {
        user,
        otherFiled,
        coustm,
      };
      return res.status(200).json({
        data: obj,
        massage: 'successfully get',
      });
    } catch (error) {
      next(error);
    }
  }
  _list(req, res, options = {}, callback = null) {
    return db[model]
      .findAll({ include: [{ all: true }] })
      .then((data) => res.status(200).send({ success: true, data: data }))
      .catch((error) => res.status(400).json({ errors: error }));
  }

  _findOne(req, res, callback = null) {
    db[model]
      .findOne(req.condition || {})
      .then((data) => {
        if (typeof callback === 'function') callback(data);
        else res.status(200).send(data);
      })
      .catch((error) => res.status(400).json({ errors: error }));
  }

  private isCallback(cb) {
    return typeof cb === 'function';
  }
  private model() {
    return db[model];
  }
}

export default ApplicationController;
