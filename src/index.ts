import { DocumentReference } from './document'

type FirebloxAdminSettings = {
    APIKey:string,
    ProjectID:string,
    DatabaseID:string
}

export default class FirebloxAdmin {

    public APIKey:string
    public ProjectID:string
    public DatabaseID:string


    constructor (Settings:FirebloxAdminSettings) {
        this.APIKey = Settings.APIKey
        this.ProjectID = Settings.ProjectID
        this.DatabaseID = Settings.DatabaseID
    }

    public doc (Path:string) {
        return new DocumentReference(Path, this)
    }
}