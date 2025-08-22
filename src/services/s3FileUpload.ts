import { logger } from '../logger/Logger';
import { environment } from '../config';
import { DeleteObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import appError from '../utils/errorHelper';
import { ErrorType } from '../utils/errorTypes';
import { AWS_FOLDER_NAME, ImageType } from '../constant/imageType.constant';
import { monthName } from '../constant/dateFormate.constant';

export const s3Client = new S3Client({
  region: environment.region,
  credentials: {
    accessKeyId: environment.accessKeyId,
    secretAccessKey: environment.secretAccessKey,
  },
});

export const imageDetailS3Client = new S3Client({
  region: environment.image_detail_region,
  credentials: {
    accessKeyId: environment.image_detail_accessKeyId,
    secretAccessKey: environment.image_detail_secretAccessKey,
  },
});

const getFileExtension = (file: any) => {
  try {
    if (file?.name?.includes('.')) {
      const extension = file?.name.split('.').pop();
      return extension; // Return the original extension for other file types
    } else {
      const extension = file?.mimetype.split('/').pop();
      return extension; // Return the original extension for other file types
    }
  } catch (error) {
    logger.error(`Error getting file extension: ${error.message}`);
  }
};

const getFileName = (key, imageId, file) => {
  try {
    const currentDate = new Date();

    switch (parseInt(key)) {
      case ImageType.DB_BACKUP:
        return `files/${environment.db_name}/${AWS_FOLDER_NAME.POSTGRES_DB_BACKUP}/${currentDate.getFullYear()}/${monthName[currentDate.getMonth()]}/${imageId}`;

      default:
        break;
    }
  } catch (error) {
    logger.error(error);
  }
};

const uploadImageToS3 = async (imageType, imageId, file) => {
  try {
    if (!imageId) {
      throw new appError('imgId not found', ErrorType.invalid_request);
    }
    if (!imageType) {
      throw new appError('imageType not found', ErrorType.invalid_request);
    }
    if (!file) {
      throw new appError('file not found', ErrorType.invalid_request);
    }

    const fileName = getFileName(imageType, imageId, file);
    const uploadParams = {
      Bucket: environment.bucket,
      Key: fileName,
      Body: file.data,
      ContentType: file.mimetype,
    };

    const { Location, Key } = await new Upload({
      client: s3Client,
      params: uploadParams,
    }).done();
    if (!Location) {
      throw new appError('somthing went wrong', ErrorType.unknown_error);
    }
    return { Location, Key };
  } catch (error) {
    logger.error(error);
  }
};

const deleteImageAWS = async (key) => {
  try {
    if (!key) {
      throw new appError('key not found please provide key!', ErrorType.invalid_request);
    }
    const params = {
      Bucket: environment.bucket,
      Key: key,
    };

    const deleteCommand = new DeleteObjectCommand(params);
    await s3Client.send(deleteCommand);
    logger.info(`Object deleted: ${key}`);
    return true;
  } catch (error) {
    logger.error(error);
  }
};

const generateFullImageUrl = (image) => {
  const url = `${environment.aws_url}${image}`;
  return url;
};

async function getAllS3Files(folder: string): Promise<string[]> {
  let files: string[] = [];
  let continuationToken: string | undefined = undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: environment.bucket,
      Prefix: `${folder}/`,
      MaxKeys: 1000, // S3 default limit
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);

    // Extract file names (remove folder prefix)
    const folderFiles = response.Contents?.map((file) => file.Key?.split('/')[1]) || [];
    files = [...files, ...folderFiles];

    // Set next continuation token
    continuationToken = response.NextContinuationToken;
    logger.info(`📄 Retrieved ${folderFiles.length} files from ${folder} (Total: ${files.length})`);
  } while (continuationToken);
  return files;
}

export { uploadImageToS3, deleteImageAWS, getFileExtension, generateFullImageUrl, getAllS3Files };

//
