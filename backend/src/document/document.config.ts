import { truncate } from "fs";

export enum DocumentStatus {
    CLOSED = 'closed',
    ONLY_CAPTURE = 'only_capture',
    ONLY_EDITION = 'only_edition',
    OPEN = 'open',
}

export class DocumentConfig {

    static get initialState(): DocumentStatus {
        return DocumentStatus.OPEN
    }

    static canBeEdited(currentStatus: DocumentStatus | string): boolean {
        switch (currentStatus) {
            case DocumentStatus.OPEN:
            case DocumentStatus.ONLY_EDITION:
                return true;
        }
        return false
    }

    static canBeCaptured(currentStatus: DocumentStatus | string): boolean {
        switch (currentStatus) {
            case DocumentStatus.OPEN:
            case DocumentStatus.ONLY_CAPTURE:
                return true;
        }
        return false
    }
}