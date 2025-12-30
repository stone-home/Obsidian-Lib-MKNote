
export const normalizePath = (path: string): string => {
    return path.replace(/\\/g, '/').replace(/\/+$/, '');
};

export class TFile {}
export class App {}
export class Component {}
export class Modal {}
export class Notice {}
export class Plugin {}
export class PluginSettingTab {}
export class Setting {}