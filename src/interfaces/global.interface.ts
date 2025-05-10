export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly color?: string;
}

export interface INote {
  _id?: string; // Used by datastore
  localId?: string;
  localDeleteSynced?: boolean;
  localEditSynced?: boolean;
  tags?: SelectOption[];
  title: string;
  createdAt: Date;
  updatedAt?: Date; // Add this for conflict detection
}
