import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Settings } from 'src/models/setting';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(Settings.name) private settingsModel: Model<Settings>,
  ) {}

  async getValue(key: string) {
    const setting = await this.settingsModel.findOne({ key });
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: string) {
    let setting = await this.settingsModel.findOne({ key });
    if (!setting) {
      setting = await this.settingsModel.create({ key, value });
    } else {
      setting.value = value;
      await setting.save();
    }
    return setting;
  }
  async getKeysValues(keys: string[]) {
    const obj = {};
    const settings = await this.settingsModel.find({ key: { $in: keys } });
    for (const setting of settings) {
      obj[setting.key] = setting.value;
    }
    return obj;
  }
}
