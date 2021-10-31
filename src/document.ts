import FirebloxAdmin from './index'
import { FIRESTORE_DATABASE_ADDRESS } from './utils'
const HttpService = game.GetService('HttpService')

type FirestoreObject = {
    name: string,
    fields: Array<any>,
    createTime: string,
    updateTime: string
}

export class DocumentSnapShot {

    public RawData: FirestoreObject
    public id: string

    constructor(RawData: FirestoreObject) {
        this.RawData = RawData
        this.id = RawData.name
    }

    public data() {
        let ReturnData: any = {}

        for (const [Index, FieldName] of ipairs(this.RawData.fields)) {
            let FakeValue = this.RawData.fields[Index]
            let Value: any
            for (const [Index, FieldType] of ipairs(FakeValue)) {
                Value = FakeValue[Index]
            }

            ReturnData[FieldName] = Value
        }

        /*for (const prop in this.RawData.fields) {
            let FakeValue = this.RawData.fields[prop]
            let Value
            for (const Prop in FakeValue) {
                Value = FakeValue[Prop]
            }
            ReturnData[prop] = Value
        }*/

        return ReturnData
    }
}

export class DocumentReference {
    public DocPath: string
    private Fireblox: FirebloxAdmin

    constructor(Path: string, Fireblox: FirebloxAdmin) {
        this.DocPath = Path
        this.Fireblox = Fireblox
    }

    public get() {
        return new DocumentSnapShot(
            HttpService.JSONDecode(
                HttpService.GetAsync(FIRESTORE_DATABASE_ADDRESS(this.Fireblox.ProjectID, this.Fireblox.DatabaseID) + this.DocPath)
            )
        )
    }
}