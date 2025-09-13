import { ENDPOINT } from '@app/constant/endPoint.constant';
import { encrypt } from '@app/helpers';
import { runSeeder } from '@app/seeders/location.seeder';
import { runUserSeeder } from '@app/seeders/user.seeder';
import type { Express, Router } from 'express';

export function initRoutes(app: Express, router: Router) {
  router.get(ENDPOINT.BLANK, (req, res) => res.status(200).send({ message: 'Welcome to SARVADHI world!!' }));

  router.post(ENDPOINT.ENC, (req, res) => {
    let encData = encrypt(req.body);
    res.status(200).send({ message: 'Encryption route!!', data: encData });
  });
  router.post(ENDPOINT.DEC, (req, res) => {
    console.log(req.body, 'Encrypted Data');

    res.status(200).send({ message: 'Decryption route!!', data: req.body.data });
  });

  router.get(ENDPOINT.SEED_LOCATION, async (req, res) => {
    await runSeeder();
    res.status(200).send({ message: 'add city state country!!' });
  });

  router.get(ENDPOINT.SEED_USER, async (req, res) => {
    await runUserSeeder();
    res.status(200).send({ message: 'add user!!' });
  });

  return router;
}
