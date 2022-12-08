export class JoiningCode {
  constructor(
    public accountName: string,
    public userName: string,
    public accountId: number
  ) {}
  
  static from(str: string) {
    const decoded = Buffer.from(str, 'base64').toString('utf-8')
    const [ accountName, userName, accountId ] = decoded.split('.')
    return new JoiningCode(accountName!, userName!, parseInt(accountId!))
  }

  toString() {
    return Buffer.from(`${this.accountName}.${this.userName}.${this.accountId}`, 'utf-8').toString('base64')
  }
}