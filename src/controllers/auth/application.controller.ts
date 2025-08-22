import db from '../../models';
let model = 'Users';
export class AuthController {
  errors: any;
  constructor(m) {
    model = m;
  }

  async _create(req, res, next) {
    try {
      const user = await db[model].findOne({ where: { email: req.body.email } });
      if (!user) {
        req.pick = ['email', 'firstName', 'lastName', 'password', 'phone'];
        let new_user = await db[model].create(req.body);
        return res.status(201).send({ success: true, data: new_user, message: 'Successfully Created' });
      } else {
        return res.status(400).json({ message: 'user already exits!' });
      }
    } catch (error) {
      return next(error);
    }
  }

  async _login(req, res, next) {
    try {
      const user = await db[model].findOne({
        where: { email: req.body.email },
      });

      if (!user) {
        return res.status(401).send({
          success: false,
          errors: [{ message: 'Authentication failed. Wrong password or email.' }],
        });
      }

      const isValid = await user.authenticate(req.body.password);

      if (!isValid) {
        return res.status(401).send({
          success: false,
          errors: [{ message: 'Authentication failed. Wrong password or email.' }],
        });
      }

      const userData = user.toJSON();
      delete userData.password;

      const token = user.generateToken();

      return res.status(200).send({
        success: true,
        data: userData,
        token,
        message: 'Congrats! You have successfully logged in.',
      });
    } catch (error) {
      return next(error);
    }
  }
}
