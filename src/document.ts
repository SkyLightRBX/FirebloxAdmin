import FirebloxAdmin from './index'
import { FIRESTORE_DATABASE_ADDRESS } from './utils'
const HttpService = game.GetService('HttpService')
import { $dbg, $print, $warn } from "rbxts-transform-debug";
import { decodeValue, encodeValue, IValue } from './serialize'

type FirestoreObject = {
    name: string,
    fields: unknown,
    createTime: string,
    updateTime: string
}

type RawFirestoreObject = {
    nullValue?: undefined,
    booleanValue?: boolean,
    integerValue?: string,
    doubleValue?: number,
    timestampValue?: string,
    stringValue?: string
}

type FirebaseErrorStatus = "ABORTED" | "ALREADY_EXISTS" | "DEADLINE_EXCEEDED" | "FAILED_PRECONDITION" | "INTERNAL" | "INVALID_ARGUMENT" | "NOT_FOUND" | "PERMISSION_DENIED" | "RESOURCE_EXHAUSTED" | "UNAUTHENTICATED" | "UNAUTHENTICATED"

type FirebaseResponse = {
    error?: {
        code: number,
        message: string,
        status: FirebaseErrorStatus
    },
    createTime?:string,
    updateTime?:string,
    name?:string,
    fields?: unknown
}

export class DocumentSnapShot {

    public RawData: FirestoreObject|FirebaseResponse
    public id: string

    constructor(RawData: FirestoreObject|FirebaseResponse) {
        this.RawData = RawData
        if (RawData.name) {
            this.id = RawData.name
        } else {
            this.id = "UNKNOWN"
        }
    }

    public data() {
        let ReturnData: any = {}
        //@ts-ignore
        for (const [Index, FieldName] of ipairs(this.RawData.fields)) {
            //@ts-ignore\

            let FakeValue: IValue = this.RawData.fields[Index]
            let Value: any = decodeValue(FakeValue)
            //@ts-ignore
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
    public DocURL: string

    constructor(Path: string, Fireblox: FirebloxAdmin) {
        this.DocPath = Path
        this.Fireblox = Fireblox
        this.DocURL = FIRESTORE_DATABASE_ADDRESS(this.Fireblox.ProjectID, this.Fireblox.DatabaseID) + this.DocPath + ""
    }

    public get() {

        let Request = HttpService.RequestAsync({
            Url: this.DocPath,
            Method: "GET"
        })

        let RequestBody:FirebaseResponse = HttpService.JSONDecode(Request.Body)

        if (Request.StatusCode !== 200 && RequestBody.error) {
            $dbg('Detected non 200 status code')
            error(RequestBody.error.message)
        }

        return new DocumentSnapShot(
            HttpService.JSONDecode(
                Request.Body
            )
        )
    }

    private patchAction(Body: object, QueryParams: string) {
        let EncodedData:any = {}
        //@ts-ignore
        for (const [Index, FieldName] of ipairs(Data)) {
            //@ts-ignore
            let Value = Data[FieldName]
            //@ts-ignore 
            EncodedData[FieldName] = encodeValue(Value)
        }

        let Request = HttpService.RequestAsync({
            Url: this.DocPath,
            Method: "PATCH",
            Body: HttpService.JSONEncode({
                name: "",
                fields: EncodedData
            })
        })

        let RequestBody: FirebaseResponse = HttpService.JSONDecode(Request.Body)

        if (Request.StatusCode !== 200 && RequestBody.error) {
            $dbg('Detected non 200 status code')
            error(RequestBody.error.message)
        }

        return new DocumentSnapShot(
            RequestBody
        )
    }

    public set(Data: object) {
        this.patchAction(Data, "")
        $dbg('Set a document')
    }

    public create(Data: object) {
        this.patchAction(Data, "?currentDocument.exists=false")
    }

    public update(Data: object) {
        let Mask = ""

        //@ts-ignore
        for (const [Index, FieldName] of ipairs(Data)) {
            Mask = Mask + "updateMask.fieldPaths=" + FieldName + "&"
        }

        this.patchAction(Data, "?currentDocument.exists=true&" + Mask)
    }

    public delete() {
        let Request = HttpService.RequestAsync({
            Url: this.DocPath + "?currentDocument.exists=true",
            Method: "DELETE"
        })

        let RequestBody:FirebaseResponse = HttpService.JSONDecode(Request.Body)

        if (Request.StatusCode !== 200 && RequestBody.error) {
            $dbg('Detected non 200 status code')
            error(RequestBody.error.message)
        }

        return new DocumentSnapShot(
            HttpService.JSONDecode(
                Request.Body
            )
        )
    }
}