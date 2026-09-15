export interface ShareableUser {
    name: string;
    key_id: number;
}

export interface ShareableUserList {
    local: ShareableUser[];
    foreign: ShareableUser[];
}

export interface UserSimplified {
    id: number;
}

export interface User extends UserSimplified {
    name: string;
    role: number;
}

export interface UserFull extends User {
    setting_theme_slug: string;
    setting_advanced_options: boolean;
}