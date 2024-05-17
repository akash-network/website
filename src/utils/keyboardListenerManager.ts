let listenerAdded = false;

export const addKeyboardListener = (callback: () => void) => {
    if (!listenerAdded) {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "k" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                callback();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        listenerAdded = true;

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            listenerAdded = false;
        };
    }
    return () => { };
};
