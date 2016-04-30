import {Adapter} from 'js-data-adapter'

interface IDict {
  [key: string]: any;
}
interface IBaseAdapter extends IDict {
  debug?: boolean,
  raw?: boolean
}
interface IBaseRethinkDBAdapter extends IBaseAdapter {
  authKey?: string
  bufferSize?: number
  db?: string
  deleteOpts?: IDict
  host?: string
  insertOpts?: IDict
  max?: number
  min?: number
  operators?: IDict
  port?: number
  runOpts?: IDict
  updateOpts?: IDict
}
export class RethinkDBAdapter extends Adapter {
  static extend(instanceProps?: IDict, classProps?: IDict): typeof RethinkDBAdapter
  constructor(opts?: IBaseRethinkDBAdapter)
}
export interface OPERATORS {
  '==': Function
  '===': Function
  '!=': Function
  '!==': Function
  '>': Function
  '>=': Function
  '<': Function
  '<=': Function
  'isectEmpty': Function
  'isectNotEmpty': Function
  'in': Function
  'notIn': Function
  'contains': Function
  'notContains': Function
}
export interface version {
  full: string
  minor: string
  major: string
  patch: string
  alpha: string | boolean
  beta: string | boolean
}