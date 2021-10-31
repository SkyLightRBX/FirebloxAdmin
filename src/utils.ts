export const FIRESTORE_BASE_ADDRESS = "https://firestore.googleapis.com/v1/"

export function FIRESTORE_DATABASE_ADDRESS(ProjectId:string, DatabaseID:string = "default") {
    return `${FIRESTORE_BASE_ADDRESS}projects/${ProjectId}/databases/(${DatabaseID})/`
}