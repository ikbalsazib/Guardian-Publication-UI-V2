import { FileTypes } from '../../enum/file-types.enum';

export interface Gallery {
  _id?: string;
  name?: string;
  url?: string;
  folder?: string;
  folderInfo?: any;
  type?: FileTypes;
  size?: number;
  createdAt?: Date;
  updatedAt?: Date;
  select?: boolean;
}
