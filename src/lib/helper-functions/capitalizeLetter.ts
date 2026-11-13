
export const capitalizeLetter = (str: string) => {
    if(str){
        return str
            .toLowerCase()
            .replace(/_/g, ' ')
            .split(' ')
            .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

export const formatText = (text: string | null | undefined): string => {
    if (!text) {
        return '';
    }

    return text
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase());
};