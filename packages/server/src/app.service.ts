import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class AppService {
  async getSHA256(file: Buffer) {
    const hash = createHash('sha256'); // 创建 SHA-256 哈希对象
    hash.update(file); // 更新哈希值
    return hash.digest('hex'); // 返回哈希值的十六进制字符串
  }
}
