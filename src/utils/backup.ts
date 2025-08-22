import child_process from 'child_process';
import path from 'path';
import fs from 'fs';

// import { uploadImageToS3 } from '@app/helpers/fileUploads.helper';
// import { ImageType } from '@app/constant/imageType.constant';
import { getFormattedDateWithTime } from './timeStamp';
import { uploadImageToS3 } from '../services/s3FileUpload';
import { ImageType } from '../constant/imageType.constant';
import appError from './errorHelper';
import { ErrorType } from './errorTypes';
import { logger } from '../logger/Logger';
import { environment } from '../config';

//Perform a backup of the database and upload the backup to S3.

export async function backup() {
  try {
    const currentDate = getFormattedDateWithTime();
    const backupPath = '../../backup';
    const backupFileName = `backup-${currentDate}.dump`;
    const backupFilePath = path.join(backupPath, backupFileName);

    // Ensure backup directory exists
    const fullPath = path.join(__dirname, backupPath);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      logger.info(`Created backup directory: ${fullPath}`);
    }

    // eslint-disable-next-line max-len
    const backupCommand = `PGPASSWORD=${environment.db_password} pg_dump -U ${environment.db_user} -h ${environment.db_host} -Fc -f "${backupFilePath}" "${environment.db_name}"`;

    child_process.execSync(backupCommand, { cwd: __dirname });
    logger.info(`Backup completed: ${backupFilePath}`);

    // if uploads backup in aws s3 then uncomment below code
    const s3Location = await uploadImageToS3(ImageType.DB_BACKUP, currentDate, {
      data: backupFileName,
      mimetype: 'application/sql',
    });

    logger.info(`Backup uploaded to S3: ${s3Location?.Location}`);
    const deletePath = path.join(__dirname, backupPath, backupFileName);

    fs.unlinkSync(deletePath);
    logger.info(`Local backup file deleted: ${backupFilePath}`);
  } catch (error) {
    throw new appError(error.message, ErrorType.unknown_error);
  }
}
