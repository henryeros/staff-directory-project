export const getInitials=(name:string)=>{
    if (!name) return '';
    const words = name.trim().replace(/\s+/g, ' ').split(/[\s-]+/);
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
}