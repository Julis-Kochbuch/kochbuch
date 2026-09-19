import { useEffect } from "react";

const useTitle = (title?: string) => {
    useEffect(() => {
        if (!title) return;

        const titleElement = document.createElement("title");

        titleElement.innerText = title;

        document.head.appendChild(titleElement);

        return () => {
            titleElement.remove();
        };
    }, [title]);
}

export default useTitle;