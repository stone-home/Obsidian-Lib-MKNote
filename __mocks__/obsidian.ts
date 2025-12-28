export class TFile {
    path: string = '';
    name: string = '';
    extension: string = '';
}

export const normalizePath = (path: string): string => {
    return path.replace(/\\/g, '/').replace(/\/+$/, '');
};

export class App {
    vault = {
        getAbstractFileByPath: jest.fn(),
        read: jest.fn(),
        modify: jest.fn(),
        create: jest.fn(),
        createFolder: jest.fn(),
    };
    fileManager = {
        renameFile: jest.fn(),
    };
    metadataCache = {
        getFileCache: jest.fn(),
    };
}