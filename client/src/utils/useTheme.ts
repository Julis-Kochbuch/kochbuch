import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

import { type Theme } from "@kochbuch/common";

const useTheme = (theme?: Theme | string) => {
    const { t } = useTranslation("errors");
    
    useEffect(() => {
        if (!theme) return;

        let links: HTMLLinkElement[] = [];
        let cancelled = false;

        const loadTheme = async () => {
            let themeData: Theme;

            if (typeof theme === "string") {
                try {
                    const response = await fetch(`/uploads/themes/${theme}/theme.json`, {
                        method: "GET",
                        credentials: "include",
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.error || data.message || t("fetching_theme_data_failed"));
                    }

                    themeData = data as Theme;
                } catch (err) {
                    const message = err instanceof Error ? err.message : t("unexprected_error");
                    console.log(message);
                    return;
                }
            } else {
                themeData = theme;
            }

            if (cancelled) return;

            links = themeData.files.map((file) => {
                const link = document.createElement("link");

                link.rel = "stylesheet";
                link.href = `/uploads/themes/${themeData.slug}/${file}`;

                document.head.appendChild(link);

                return link;
            });
        }

        loadTheme();

        return () => {
            cancelled = true;

            for (const link of links) {
                link.remove();
            }
        };
    }, [theme]);
}

export default useTheme;