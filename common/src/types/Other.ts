export interface Theme {
    slug: string;
    version?: string;
    update_url?: string;
    files: string[];
}

export type ThemeUpdate =
    Omit<Theme, "files" | "update_url" | "version"
    > & {
        version: string;
        download_url: string;
    }