import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { readdir, unlink } from 'fs/promises';
import sharp from 'sharp';

@Controller()
export class AppController {
  bedPath: string;
  externalLink: string;

  constructor(private readonly appService: AppService) {
    const bedPath = process.env.BED_PATH;
    if (bedPath) {
      this.bedPath = bedPath;
    } else {
      console.warn(`BED_PATH is not defined.`);
    }
    const externalLink = process.env.EXTERNAL_LINK;
    if (externalLink) {
      this.externalLink = externalLink;
    } else {
      console.warn(`EXTERNAL_LINK is not defined.`);
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const sha256 = await this.appService.getSHA256(file.buffer);
    const imgSavePath = `${this.bedPath}/${sha256}.webp`;
    const res = await sharp(file.buffer)
      .webp({ quality: 100 })
      .toFile(imgSavePath);
    return res;
  }

  @Get('imgs')
  async getImages() {
    const files = await readdir(this.bedPath);
    const webpList = files
      .filter((file) => {
        const suffix = file.split(`.`).at(-1);
        if (suffix.toLowerCase() == `webp`) {
          return true;
        }
        return false;
      })
      .map((img) => `${this.externalLink}/${img}`);
    return webpList;
  }

  @Delete(':sha256')
  async deleteImg(@Param('sha256') sha256: string) {
    try {
      const targetImgPath = `${this.bedPath}/${sha256}.webp`;
      await unlink(targetImgPath);
      return {
        msg: `Delete file successful.`,
      };
    } catch {
      return { msg: `Delete file is failed.` };
    }
  }
}
