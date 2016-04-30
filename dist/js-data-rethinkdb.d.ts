import {Adapter} from 'js-data-adapter'

interface IDict {
  [key: string]: any;
}
interface IActionOpts {
  adapter?: string,
  pathname?: string,
  request?: Function,
  response?: Function,
  responseError?: Function
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
  insertOpts?: IDICT
  max?: number
  min?: number
  operators?: IDICT
  port?: number
  runOpts?: IDICT
  updateOpts?: IDICT
}
export class RethinkDBAdapter extends Adapter {
  static extend(instanceProps?: IDict, classProps?: IDict): typeof RethinkDBAdapter
  constructor(opts?: IBaseRethinkDBAdapter)
}
export const OPERATORS = {
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
export const version = {
  full?: string
  minor?: string
  major?: string
  patch?: string
  alpha?: string | boolean
  beta?: string | boolean
}