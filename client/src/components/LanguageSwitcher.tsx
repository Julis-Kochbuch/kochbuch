import { useTranslation } from 'react-i18next';

type Language = {
    locale: string;
    nativeName: string;
};

const languages : Language[] = [
    { locale: "en", nativeName: "English" },
    { locale: "de", nativeName: "Deutsch" }
]



type LanguageSwitcherProps = {
    disabled?: boolean;
};

const LanguageSwitcher = ({ disabled }: LanguageSwitcherProps) => {
    const { i18n } = useTranslation();
    
    return (
        <>
            <select
                id="languageswitcher"
                className="languageswitcher"
                onChange={(e => {
                    i18n.changeLanguage(e.target.value);
                })}
                value={i18n.resolvedLanguage}
                disabled={disabled}
            >
                {
                    languages.map((language) => (
                        <option key={language.locale} value={language.locale}>
                            {language.nativeName}
                        </option>
                    ))
                }
            </select>
        </>
    )
}

export default LanguageSwitcher